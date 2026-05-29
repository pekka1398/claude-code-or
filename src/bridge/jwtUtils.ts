/**
 * JWT utilities — stubbed for OpenRouter build.
 */

import { jsonParse } from '../utils/slowOperations.js'

export function decodeJwtPayload(token: string): unknown | null {
  const jwt = token.startsWith('sk-ant-si-')
    ? token.slice('sk-ant-si-'.length)
    : token
  const parts = jwt.split('.')
  if (parts.length !== 3 || !parts[1]) return null
  try {
    return jsonParse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function decodeJwtExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token)
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'exp' in payload &&
    typeof payload.exp === 'number'
  ) {
    return payload.exp
  }
  return null
}

export function createTokenRefreshScheduler(_opts: {
  getAccessToken: () => string | undefined | Promise<string | undefined>
  onRefresh: (sessionId: string, oauthToken: string) => void
  label: string
  refreshBufferMs?: number
}): {
  schedule: (sessionId: string, token: string) => void
  scheduleFromExpiresIn: (sessionId: string, expiresInSeconds: number) => void
  cancel: (sessionId: string) => void
  cancelAll: () => void
} {
  return {
    schedule: () => {},
    scheduleFromExpiresIn: () => {},
    cancel: () => {},
    cancelAll: () => {},
  }
}
