/**
 * Stub macOsKeychainHelpers — not needed for OpenRouter.
 */

export function getMacOsKeychainStorageServiceName(): string {
  return 'claude-code-or'
}

export function getUsername(): string {
  return process.env.USER ?? 'unknown'
}

export function clearKeychainCache(): void {}
