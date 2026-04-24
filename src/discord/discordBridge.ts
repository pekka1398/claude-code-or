/**
 * Discord Bridge — lets you control Claude Code from your phone via Discord.
 *
 * Architecture:
 *   Phone Discord <-> Discord API <-> This bot (local) <-> Claude Code REPL
 *
 * Multi-channel: Each /discord call creates a new Discord channel.
 * Conversation history is synced to the channel on connect.
 */

import {
  Client,
  Events,
  GatewayIntentBits,
  type Message,
  type TextChannel,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js'
import { enqueue } from '../utils/messageQueueManager.js'
import type { Message as CCMessage } from '../types/message.js'
import { logForDebugging } from '../utils/debug.js'

const DISCORD_MAX_LENGTH = 2000
const CHANNEL_PREFIX = 'claude-'

/** Active bridge sessions: channelId -> session info */
const activeSessions = new Map<string, {
  getMessages: () => CCMessage[]
  lastMessageIndex: number
  watcherInterval: ReturnType<typeof setInterval> | null
}>()

/** Pending permission requests keyed by Discord message ID. */
const pendingPermissions = new Map<string, {
  resolve: (approved: boolean) => void
  toolName: string
}>()

let client: Client | null = null
let guildId: string | null = null
let onReadyResolve: (() => void) | null = null

/**
 * Start the Discord bot client (if not already running).
 * Returns the bot client, creating one if needed.
 */
async function ensureClient(token: string): Promise<Client> {
  if (client && client.isReady()) return client

  // If client exists but isn't ready, destroy it
  if (client) {
    client.destroy()
    client = null
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.on(Events.MessageCreate, async (msg: Message) => {
    // Ignore own messages
    if (msg.author.id === client!.user?.id) return

    // Only handle messages in active session channels
    const session = activeSessions.get(msg.channelId)
    if (!session) return

    const text = msg.content.trim()
    if (!text) return

    logForDebugging(`[discord] Inbound from channel ${msg.channelId}: ${text.slice(0, 80)}`)
    enqueue({
      value: text,
      mode: 'prompt' as const,
      priority: 'next',
    })
  })

  // Handle permission responses via reactions
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.id === client!.user?.id) return

    const emoji = reaction.emoji.name
    const msgId = reaction.message.id
    const pending = pendingPermissions.get(msgId)
    if (!pending) return

    if (emoji === '👍' || emoji === '✅') {
      pending.resolve(true)
      pendingPermissions.delete(msgId)
    } else if (emoji === '👎' || emoji === '❌') {
      pending.resolve(false)
      pendingPermissions.delete(msgId)
    }
  })

  client.on(Events.Error, (error) => {
    logForDebugging(`[discord] Client error: ${error.message}`, { level: 'error' })
  })

  const readyPromise = new Promise<void>((resolve) => {
    onReadyResolve = resolve
  })

  client.on(Events.ClientReady, () => {
    logForDebugging(`[discord] Bot ready as ${client!.user?.tag}`)
    onReadyResolve?.()
  })

  await client.login(token)
  await readyPromise

  return client
}

/**
 * Start a Discord bridge session: creates a new channel and syncs messages.
 *
 * @param token Discord bot token
 * @param targetGuildId Discord server (guild) ID
 * @param getMessages Function to get current messages array
 * @returns The created channel ID
 */
export async function startDiscordBridge(
  token: string,
  targetGuildId: string,
  getMessages: () => CCMessage[],
): Promise<string> {
  const bot = await ensureClient(token)
  guildId = targetGuildId

  const guild = await bot.guilds.fetch(guildId)
  if (!guild) throw new Error(`Cannot find Discord server with ID ${guildId}`)

  // Create a new channel for this session
  const now = new Date()
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const channelName = `${CHANNEL_PREFIX}${dateStr}`

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    topic: 'Claude Code remote control session',
  })

  logForDebugging(`[discord] Created channel #${channel.name} (${channel.id})`)

  // Sync existing messages (last 30 only)
  const MAX_SYNC_MESSAGES = 30
  const allMsgs = getMessages()
  const msgs = allMsgs.slice(-MAX_SYNC_MESSAGES)

  // Batch multiple messages into fewer Discord messages to reduce round trips
  const batches: string[] = []
  let currentBatch = ''

  for (const msg of msgs) {
    let line = ''
    if (msg.type === 'assistant') {
      const text = extractAssistantText(msg)
      if (text) line = `**Claude:** ${text}`
    } else if (msg.type === 'user') {
      const text = extractUserText(msg)
      if (text) line = `**You:** ${text}`
    }
    if (!line) continue

    // If adding this line would exceed limit, flush current batch
    if (currentBatch && (currentBatch.length + line.length + 2) > DISCORD_MAX_LENGTH) {
      batches.push(currentBatch)
      currentBatch = line
    } else {
      currentBatch = currentBatch ? `${currentBatch}\n\n${line}` : line
    }
  }
  if (currentBatch) batches.push(currentBatch)

  // Send history
  if (batches.length > 0) {
    const skipped = Math.max(0, allMsgs.length - MAX_SYNC_MESSAGES)
    const header = skipped > 0
      ? `📋 **Syncing last ${MAX_SYNC_MESSAGES} messages (${skipped} older skipped)...**`
      : '📋 **Syncing conversation history...**'
    await sendToChannel(channel, header)
    for (const batch of batches) {
      await sendToChannelChunked(channel, batch)
    }
    await sendToChannel(channel, '✅ **History synced. Start chatting!**')
  }

  // Register session
  const sessionId = channel.id
  const session = {
    getMessages,
    lastMessageIndex: allMsgs.length,
    watcherInterval: null as ReturnType<typeof setInterval> | null,
  }
  activeSessions.set(sessionId, session)

  // Start watching for new messages — batch multiple new messages into fewer sends
  session.watcherInterval = setInterval(() => {
    if (!bot.isReady()) return
    const currentMsgs = session.getMessages()

    // Handle compaction
    if (session.lastMessageIndex > currentMsgs.length) {
      session.lastMessageIndex = currentMsgs.length
    }

    // Collect new messages
    const newLines: string[] = []
    for (let i = session.lastMessageIndex; i < currentMsgs.length; i++) {
      const msg = currentMsgs[i]
      if (!msg) continue

      if (msg.type === 'assistant') {
        const text = extractAssistantText(msg)
        if (text) newLines.push(`**Claude:** ${text}`)
      } else if (msg.type === 'user') {
        const text = extractUserText(msg)
        if (text) newLines.push(`**You:** ${text}`)
      } else if (msg.type === 'system' && msg.subtype === 'local_command') {
        const text = extractSystemText(msg)
        if (text) newLines.push(`*${text}*`)
      }
    }
    session.lastMessageIndex = currentMsgs.length

    // Batch lines into fewer Discord messages
    if (newLines.length === 0) return
    let batch = ''
    for (const line of newLines) {
      if (batch && (batch.length + line.length + 2) > DISCORD_MAX_LENGTH) {
        // Flush current batch (already within limit)
        sendToChannel(channel, batch)
        batch = ''
      }
      if (line.length > DISCORD_MAX_LENGTH) {
        // Line itself exceeds limit — chunk it
        if (batch) {
          sendToChannel(channel, batch)
          batch = ''
        }
        sendToChannelChunked(channel, line)
      } else if (batch) {
        batch = `${batch}\n\n${line}`
      } else {
        batch = line
      }
    }
    if (batch) sendToChannel(channel, batch)
  }, 1500)

  await sendToChannel(channel, '🟢 **Discord bridge connected!** Send messages here to control Claude Code.')

  return sessionId
}

/**
 * Stop a specific Discord bridge session.
 */
export async function stopDiscordBridge(channelId?: string): Promise<void> {
  if (channelId) {
    const session = activeSessions.get(channelId)
    if (session) {
      if (session.watcherInterval) clearInterval(session.watcherInterval)
      activeSessions.delete(channelId)

      // Send disconnect message to channel
      const ch = client?.channels.cache.get(channelId) as TextChannel | undefined
      if (ch) {
        await sendToChannel(ch, '🔴 **Discord bridge disconnected.**')
      }
    }
  } else {
    // Stop all sessions
    for (const [id, session] of activeSessions) {
      if (session.watcherInterval) clearInterval(session.watcherInterval)
      const ch = client?.channels.cache.get(id) as TextChannel | undefined
      if (ch) {
        await sendToChannel(ch, '🔴 **Discord bridge disconnected.**')
      }
    }
    activeSessions.clear()
  }

  // If no more sessions, destroy client
  if (activeSessions.size === 0 && client) {
    client.destroy()
    client = null
    guildId = null
  }
}

/**
 * Check if any Discord bridge session is running.
 */
export function isDiscordBridgeRunning(): boolean {
  return activeSessions.size > 0
}

/**
 * Get all active session channel IDs.
 */
export function getActiveSessionIds(): string[] {
  return [...activeSessions.keys()]
}

/**
 * Send a permission prompt to Discord and wait for approval/denial.
 */
export async function requestPermissionViaDiscord(
  channelId: string,
  toolName: string,
  input: Record<string, unknown>,
  description?: string,
  timeoutMs = 120_000,
): Promise<boolean> {
  if (!client) return false

  const channel = await client.channels.fetch(channelId)
  if (!channel?.isTextBased()) return false

  const inputPreview = Object.entries(input)
    .slice(0, 3)
    .map(([k, v]) => `  ${k}: ${String(v).slice(0, 100)}`)
    .join('\n')

  const embed = new EmbedBuilder()
    .setTitle(`🔒 Permission Request: ${toolName}`)
    .setDescription(description || `Tool **${toolName}** wants to run.`)
    .addFields({ name: 'Input', value: inputPreview ? `\`\`\`\n${inputPreview}\n\`\`\`` : 'N/A' })
    .setColor(0xFF_A5_00)
    .setFooter({ text: 'React 👍 to approve, 👎 to deny' })

  const msg = await (channel as TextChannel).send({ embeds: [embed] })
  await msg.react('👍')
  await msg.react('👎')

  return new Promise((resolve) => {
    pendingPermissions.set(msg.id, { resolve, toolName })
    setTimeout(() => {
      if (pendingPermissions.has(msg.id)) {
        pendingPermissions.delete(msg.id)
        resolve(false)
        msg.edit({ content: '⏰ Permission request timed out (denied).' }).catch(() => {})
      }
    }, timeoutMs)
  })
}

// ============================================================================
// Internal helpers
// ============================================================================

const TOOL_RESULT_MAX = 200

function extractAssistantText(msg: CCMessage): string {
  if (msg.type !== 'assistant') return ''
  const content = (msg as any).message?.content
  if (!content) return ''
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''

  const parts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text?.trim()) {
      parts.push(block.text)
    } else if (block.type === 'tool_use') {
      const toolName = block.name || 'unknown'
      const input = block.input || {}
      const inputStr = formatToolInput(toolName, input)
      parts.push(`🔧 **${toolName}** ${inputStr}`)
    }
  }
  return parts.join('\n')
}

function extractUserText(msg: CCMessage): string {
  if (msg.type !== 'user') return ''
  const content = (msg as any).message?.content
  if (!content) return ''
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''

  const parts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text?.trim()) {
      parts.push(block.text)
    } else if (block.type === 'tool_result') {
      // Find the preceding tool_use to know which tool this result is for
      const toolName = findLastToolName(content, block)
      const resultText = extractToolResultText(block)
      if (!resultText) continue

      // Skip verbose results — just show summary
      if (toolName === 'Read') {
        // File contents are too long, skip entirely
        continue
      }
      if (toolName === 'Grep' || toolName === 'Glob') {
        // Show just first 3 lines
        const lines = resultText.split('\n').filter(l => l.trim())
        const preview = lines.slice(0, 3).join('\n')
        const suffix = lines.length > 3 ? `\n... (+${lines.length - 3} more)` : ''
        parts.push(`📄 \`\`\`\n${preview}${suffix}\n\`\`\``)
      } else if (toolName === 'Edit' || toolName === 'FileEditTool') {
        // Show diff summary from the text like "Added 1 line, removed 1 line"
        const match = resultText.match(/Added \d+ line.*removed \d+ line/i)
          || resultText.match(/Added \d+ line/i)
          || resultText.match(/removed \d+ line/i)
        if (match) {
          parts.push(`📄 ${match[0]}`)
        } else {
          const truncated = truncateResult(resultText, 150)
          parts.push(`📄 \`${truncated}\``)
        }
      } else {
        // Generic: max 3 lines
        const lines = resultText.split('\n').filter(l => l.trim())
        const preview = lines.slice(0, 3).join('\n')
        const suffix = lines.length > 3 ? `\n... (+${lines.length - 3} more)` : ''
        const truncated = preview.length > TOOL_RESULT_MAX ? preview.slice(0, TOOL_RESULT_MAX) + '…' : preview
        parts.push(`📄 \`\`\`\n${truncated}${suffix}\n\`\`\``)
      }
    }
  }
  return parts.join('\n')
}

function formatToolInput(toolName: string, input: Record<string, any>): string {
  // Show key inputs per tool type
  if (toolName === 'Bash') {
    return `\`${input.command || ''}\``
  }
  if (toolName === 'Read') {
    return `\`${input.file_path || ''}\``
  }
  if (toolName === 'Edit' || toolName === 'FileEditTool') {
    return `\`${input.file_path || ''}\``
  }
  if (toolName === 'Write') {
    return `\`${input.file_path || ''}\``
  }
  if (toolName === 'Grep') {
    return `pattern: \`${input.pattern || ''}\` in \`${input.path || ''}\``
  }
  if (toolName === 'Glob') {
    return `\`${input.pattern || ''}\``
  }
  if (toolName === 'Agent') {
    return `\`${input.description || ''}\``
  }
  // Generic: show first 2 keys
  const entries = Object.entries(input).slice(0, 2)
  if (entries.length === 0) return ''
  return entries.map(([k, v]) => `${k}: \`${String(v).slice(0, 80)}\``).join(', ')
}

function extractToolResultText(block: any): string {
  if (!block.content) return ''
  if (typeof block.content === 'string') return block.content
  if (Array.isArray(block.content)) {
    return block.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text || '')
      .join('\n')
  }
  return ''
}

/**
 * Walk the content blocks to find the tool_use name that precedes this tool_result.
 * This tells us which tool produced the result so we can format it appropriately.
 */
function findLastToolName(content: any[], toolResultBlock: any): string | null {
  const toolUseIds = new Map<string, string>()
  for (const block of content) {
    if (block.type === 'tool_use' && block.id) {
      toolUseIds.set(block.id, block.name)
    }
  }
  // tool_result has tool_use_id pointing to the tool_use block
  const toolUseId = toolResultBlock.tool_use_id
  if (toolUseId) return toolUseIds.get(toolUseId) ?? null
  return null
}

function truncateResult(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
}

function extractSystemText(msg: CCMessage): string {
  if (msg.type !== 'system') return ''
  return (msg as any).content || ''
}

async function sendToChannel(channel: TextChannel, text: string): Promise<void> {
  try {
    await channel.send(text)
  } catch (err) {
    logForDebugging(`[discord] Send failed: ${(err as Error).message}`, { level: 'error' })
  }
}

async function sendToChannelChunked(channel: TextChannel, text: string): Promise<void> {
  const chunks = splitMessage(text, DISCORD_MAX_LENGTH)
  for (const chunk of chunks) {
    await sendToChannel(channel, chunk)
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100))
  }
}

function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    let splitIndex = remaining.lastIndexOf('\n', maxLength)
    if (splitIndex <= 0 || splitIndex > maxLength) {
      splitIndex = maxLength
    }

    chunks.push(remaining.slice(0, splitIndex))
    remaining = remaining.slice(splitIndex)

    if (remaining.startsWith('\n')) {
      remaining = remaining.slice(1)
    }
  }

  return chunks
}
