/**
 * Stub secureStorage — minimal interface for plugin options.
 * Real keychain storage is not needed for OpenRouter.
 */

export interface SecureStorageBackend {
  name: string
  read(): Record<string, unknown> | null
  readAsync(): Promise<Record<string, unknown> | null>
  update(data: Record<string, unknown>): { success: boolean; warning?: string }
}

const memoryStorage = new Map<string, Record<string, unknown>>()

export function getSecureStorage(): SecureStorageBackend {
  return {
    name: 'memory',
    read(): Record<string, unknown> | null {
      return memoryStorage.get('data') ?? null
    },
    async readAsync(): Promise<Record<string, unknown> | null> {
      return this.read()
    },
    update(data: Record<string, unknown>): { success: boolean; warning?: string } {
      memoryStorage.set('data', data)
      return { success: true }
    },
  }
}
