/**
 * Stub AWS utilities — not needed for OpenRouter.
 */

export function checkStsCallerIdentity(): Promise<void> {
  return Promise.resolve()
}

export function clearAwsIniCache(): Promise<void> {
  return Promise.resolve()
}

export function isValidAwsStsOutput(_output: unknown): boolean {
  return false
}

export function isAwsCredentialsProviderError(_error: unknown): boolean {
  return false
}
