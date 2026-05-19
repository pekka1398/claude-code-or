/**
 * Stub auth code listener — OpenRouter doesn't use OAuth.
 */

export function createAuthCodeListener(): Promise<{ port: number; close: () => void }> {
  return Promise.resolve({ port: 0, close() {} })
}
