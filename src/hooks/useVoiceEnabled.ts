import { useMemo } from 'react'
import { useAppState } from '../state/AppState.js'

// voice/ module deleted — always returns false
function hasVoiceAuth(): boolean {
  return false
}

function isVoiceGrowthBookEnabled(): boolean {
  return false
}

/**
 * Combines user intent (settings.voiceEnabled) with auth + GB kill-switch.
 * Stubbed: voice/ module was deleted, always returns false.
 */
export function useVoiceEnabled(): boolean {
  const userIntent = useAppState(s => s.settings.voiceEnabled === true)
  const authVersion = useAppState(s => s.authVersion)

  const authed = useMemo(hasVoiceAuth, [authVersion])
  return userIntent && authed && isVoiceGrowthBookEnabled()
}
