/**
 * Stub OAuth client — OpenRouter doesn't use OAuth.
 */

import type { OAuthTokens } from './types.js'

export function shouldUseClaudeAIAuth(_scopes?: string[] | null): boolean {
  return false
}

export function isOAuthTokenExpired(_expiresAt: string | null): boolean {
  return false
}

export function refreshOAuthToken(_refreshToken: string, _opts?: { scopes?: string[] }): Promise<OAuthTokens> {
  return Promise.reject(new Error('OAuth not available'))
}

export function createAndStoreApiKey(_accessToken: string): Promise<string | null> {
  return Promise.resolve(null)
}

export function fetchAndStoreUserRoles(_accessToken: string): Promise<void> {
  return Promise.resolve()
}

export function storeOAuthAccountInfo(_info: unknown): void {}

export function getOrganizationUUID(): string | null {
  return null
}

export function populateOAuthAccountInfoIfNeeded(): Promise<void> {
  return Promise.resolve()
}

export function fetchAndStoreClaudeCodeFirstTokenDate(): Promise<void> {
  return Promise.resolve()
}
