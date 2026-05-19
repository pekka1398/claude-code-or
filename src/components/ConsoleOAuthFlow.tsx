/**
 * Stub ConsoleOAuthFlow — OpenRouter doesn't use OAuth login UI.
 * Renders a message telling users to set OPENROUTER_API_KEY.
 */

import * as React from 'react'
import { Text } from '../ink.js'

interface ConsoleOAuthFlowProps {
  onDone: (success: boolean) => void
  startingMessage?: string
  mode?: string
  forceLoginMethod?: string
}

export function ConsoleOAuthFlow(props: ConsoleOAuthFlowProps): React.ReactNode {
  return React.createElement(Text, { color: 'yellow' },
    'OAuth login is not available. Set OPENROUTER_API_KEY in your .env file.'
  )
}
