/**
 * Bridge mode entitlement checks.
 * Stubbed for OpenRouter build — Remote Control is not supported.
 */

export function isBridgeEnabled(): boolean {
  return false
}

export async function isBridgeEnabledBlocking(): Promise<boolean> {
  return false
}

export async function getBridgeDisabledReason(): Promise<string | null> {
  return 'Remote Control is not available in this build.'
}

export function isEnvLessBridgeEnabled(): boolean {
  return false
}
