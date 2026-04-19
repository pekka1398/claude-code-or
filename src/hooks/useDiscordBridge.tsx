/**
 * Hook that integrates the Discord bridge into the REPL.
 *
 * Reads DISCORD_BOT_TOKEN and DISCORD_GUILD_ID from environment.
 * Each /discord call creates a new channel in the server.
 */

import { useEffect, useRef } from 'react'
import { useAppState, useSetAppState } from '../state/AppState.js'
import type { Message as CCMessage } from '../types/message.js'
import { logForDebugging } from '../utils/debug.js'
import { startDiscordBridge, stopDiscordBridge, getActiveSessionIds } from '../discord/discordBridge.js'
import { createSystemMessage } from '../utils/messages.js'

export function useDiscordBridge(
  messages: CCMessage[],
  setMessages: (action: React.SetStateAction<CCMessage[]>) => void,
): void {
  const setAppState = useSetAppState()
  const discordBridgeEnabled = useAppState(s => s.discordBridgeEnabled)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  useEffect(() => {
    if (!discordBridgeEnabled) return

    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    if (!token || !guildId) {
      const missing = !token ? 'DISCORD_BOT_TOKEN' : 'DISCORD_GUILD_ID'
      logForDebugging(`[discord] ${missing} not set`)
      setAppState(prev => ({
        ...prev,
        discordBridgeEnabled: false,
        discordBridgeError: `${missing} environment variable not set. Run: export ${missing}=your_value`,
      }))
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const channelId = await startDiscordBridge(token, guildId, () => messagesRef.current)
        if (cancelled) {
          await stopDiscordBridge(channelId)
          return
        }
        setAppState(prev => ({
          ...prev,
          discordBridgeConnected: true,
          discordBridgeError: undefined,
          discordChannelId: channelId,
        }))
        setMessages(prev => [...prev, createSystemMessage(`Discord bridge connected. Channel: <#${channelId}>`, 'warning')])
      } catch (err) {
        if (cancelled) return
        const errMsg = (err as Error).message
        logForDebugging(`[discord] Bridge failed: ${errMsg}`, { level: 'error' })
        setAppState(prev => ({
          ...prev,
          discordBridgeEnabled: false,
          discordBridgeConnected: false,
          discordBridgeError: errMsg,
        }))
        setMessages(prev => [...prev, createSystemMessage(`Discord bridge failed: ${errMsg}`, 'warning')])
      }
    })()

    return () => {
      cancelled = true
      const sessionIds = getActiveSessionIds()
      for (const id of sessionIds) {
        stopDiscordBridge(id)
      }
      setAppState(prev => ({
        ...prev,
        discordBridgeConnected: false,
        discordChannelId: undefined,
      }))
    }
  }, [discordBridgeEnabled, setAppState, setMessages])
}
