/**
 * /discord command — toggle the Discord bridge connection.
 *
 * Reads DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID from environment
 * at connect time so users can set them mid-session.
 */

import React, { useEffect, useState } from 'react'
import { Box, Text } from '../../ink.js'
import { useAppState, useSetAppState } from '../../state/AppState.js'
import { Dialog } from '../../components/design-system/Dialog.js'
import { ListItem } from '../../components/design-system/ListItem.js'
import { useKeybindings } from '../../keybindings/useKeybinding.js'
import { useRegisterOverlay } from '../../context/overlayContext.js'
import type { LocalJSXCommandOnDone, LocalJSXCommandContext } from '../../types/command.js'
import type { ToolUseContext } from '../../Tool.js'

type Props = {
  onDone: LocalJSXCommandOnDone
}

function DiscordToggle({ onDone }: Props) {
  const setAppState = useSetAppState()
  const discordBridgeEnabled = useAppState(s => s.discordBridgeEnabled)
  const discordBridgeConnected = useAppState(s => s.discordBridgeConnected)
  const discordBridgeError = useAppState(s => s.discordBridgeError)

  useEffect(() => {
    // If already connected, show disconnect dialog
    if (discordBridgeEnabled && discordBridgeConnected) {
      return
    }

    // Check prerequisites from env vars
    const token = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID

    if (!token) {
      onDone('DISCORD_BOT_TOKEN environment variable not set. Run: export DISCORD_BOT_TOKEN=your_token', { display: 'system' })
      return
    }
    if (!guildId) {
      onDone('DISCORD_GUILD_ID environment variable not set. Run: export DISCORD_GUILD_ID=your_guild_id', { display: 'system' })
      return
    }

    // Enable the bridge
    setAppState(prev => ({
      ...prev,
      discordBridgeEnabled: true,
      discordBridgeError: undefined,
    }))
    onDone('Discord bridge connecting...', { display: 'system' })
  }, [discordBridgeEnabled, discordBridgeConnected, onDone, setAppState])

  if (discordBridgeEnabled && discordBridgeConnected) {
    return <DiscordDisconnectDialog onDone={onDone} />
  }

  if (discordBridgeError) {
    return <DiscordErrorDialog onDone={onDone} error={discordBridgeError} />
  }

  return null
}

function DiscordDisconnectDialog({ onDone }: { onDone: LocalJSXCommandOnDone }) {
  const setAppState = useSetAppState()
  const [focusIndex, setFocusIndex] = useState(0)
  useRegisterOverlay('discord-disconnect-dialog', undefined)

  const handleDisconnect = () => {
    setAppState(prev => ({
      ...prev,
      discordBridgeEnabled: false,
      discordBridgeConnected: false,
    }))
    onDone('Discord bridge disconnected.', { display: 'system' })
  }

  const handleContinue = () => {
    onDone(undefined, { display: 'skip' })
  }

  useKeybindings({
    'select:next': () => setFocusIndex(i => (i + 1) % 2),
    'select:previous': () => setFocusIndex(i => (i - 1 + 2) % 2),
    'select:accept': () => {
      if (focusIndex === 0) handleDisconnect()
      else handleContinue()
    },
  }, { context: 'Select' })

  return (
    <Dialog title="Discord Bridge" onCancel={handleContinue} hideInputGuide>
      <Box flexDirection="column" gap={1}>
        <Text>Discord bridge is connected and active.</Text>
        <Box flexDirection="column">
          <ListItem isFocused={focusIndex === 0}>
            <Text>Disconnect</Text>
          </ListItem>
          <ListItem isFocused={focusIndex === 1}>
            <Text>Continue</Text>
          </ListItem>
        </Box>
        <Text dimColor>Enter to select · Esc to continue</Text>
      </Box>
    </Dialog>
  )
}

function DiscordErrorDialog({ onDone, error }: { onDone: LocalJSXCommandOnDone; error: string }) {
  const setAppState = useSetAppState()
  useRegisterOverlay('discord-error-dialog', undefined)

  const handleDismiss = () => {
    setAppState(prev => ({
      ...prev,
      discordBridgeError: undefined,
    }))
    onDone(undefined, { display: 'skip' })
  }

  useKeybindings({
    'select:accept': handleDismiss,
  }, { context: 'Select' })

  return (
    <Dialog title="Discord Bridge Error" onCancel={handleDismiss} hideInputGuide>
      <Box flexDirection="column" gap={1}>
        <Text color="red">{error}</Text>
        <Text dimColor>Press Enter to dismiss</Text>
      </Box>
    </Dialog>
  )
}

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: ToolUseContext & LocalJSXCommandContext,
  _args: string,
): Promise<React.ReactNode> {
  return <DiscordToggle onDone={onDone} />
}
