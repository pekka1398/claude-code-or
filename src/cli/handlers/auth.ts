/**
 * Auth handlers — stubbed for OpenRouter.
 * No OAuth, no login/logout, no subscription checks.
 */

import { getAnthropicApiKeyWithSource, getAuthTokenSource, isUsing3PServices } from '../../utils/auth.js'
import { getAPIProvider } from '../../utils/model/providers.js'

export async function installOAuthTokens(): Promise<void> {
  // No-op: OpenRouter doesn't use OAuth tokens
}

export async function authLogin(): Promise<void> {
  process.stderr.write(
    'Login is not needed. Set OPENROUTER_API_KEY in your .env file.\n',
  )
  process.exit(1)
}

export async function authStatus(opts: {
  json?: boolean
  text?: boolean
}): Promise<void> {
  const { source: authTokenSource, hasToken } = getAuthTokenSource()
  const { source: apiKeySource } = getAnthropicApiKeyWithSource()
  const using3P = isUsing3PServices()
  const loggedIn = hasToken || apiKeySource !== 'none' || using3P

  if (opts.text) {
    const apiProvider = getAPIProvider()
    process.stdout.write(`Provider: ${apiProvider}\n`)
    if (apiKeySource !== 'none') {
      process.stdout.write(`Key source: ${apiKeySource}\n`)
    }
    if (!loggedIn) {
      process.stdout.write(
        'Not logged in. Set OPENROUTER_API_KEY in your .env file.\n',
      )
    }
  } else {
    const output: Record<string, string | boolean | null> = {
      loggedIn,
      authMethod: using3P ? 'third_party' : apiKeySource !== 'none' ? 'api_key' : 'none',
      apiProvider: getAPIProvider(),
    }
    process.stdout.write(JSON.stringify(output, null, 2) + '\n')
  }
  process.exit(loggedIn ? 0 : 1)
}

export async function authLogout(): Promise<void> {
  process.stderr.write(
    'Logout is not applicable. Unset OPENROUTER_API_KEY in your .env file.\n',
  )
  process.exit(1)
}
