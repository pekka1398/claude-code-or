/**
 * Stub authPortable — normalizeApiKeyForConfig is still used in a few places.
 */

export function normalizeApiKeyForConfig(apiKey: string): string {
  return apiKey.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
}

export async function maybeRemoveApiKeyFromMacOSKeychainThrows(): Promise<void> {}
