/**
 * Stub auth file descriptor — not needed for OpenRouter.
 * CCR/file-descriptor auth paths are removed.
 */

export const CCR_SESSION_INGRESS_TOKEN_PATH = '/dev/null'
export const CCR_OAUTH_TOKEN_PATH = '/dev/null'

export function readTokenFromWellKnownFile(_path: string, _label: string): null {
  return null
}

export function maybePersistTokenForSubprocesses(_path: string, _token: string, _label: string): void {}

export function getOAuthTokenFromFileDescriptor(): string | null {
  return null
}

export function getApiKeyFromFileDescriptor(): string | null {
  return null
}
