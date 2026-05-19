/**
 * Stub keychainPrefetch — not needed for OpenRouter.
 */

export function startKeychainPrefetch(): void {}
export function ensureKeychainPrefetchCompleted(): Promise<void> { return Promise.resolve() }
export function getLegacyApiKeyPrefetchResult(): null { return null }
export function clearLegacyApiKeyPrefetch(): void {}
