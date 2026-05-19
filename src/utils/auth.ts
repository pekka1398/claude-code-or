/**
 * Simplified auth module for OpenRouter-only usage.
 *
 * Auth is simple: OPENROUTER_API_KEY exists → can use, doesn't exist → cannot.
 * No OAuth, no login, no subscription checks, no AWS/GCP, no Keychain.
 */

import { isEnvTruthy } from './envUtils.js'
import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from 'src/services/analytics/index.js'

// ─── Core auth check ───────────────────────────────────────────────

export function getAnthropicApiKey(): string | null {
  return process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || null
}

export function hasAnthropicApiKeyAuth(): boolean {
  return getAnthropicApiKey() !== null
}

export type ApiKeySource = 'ANTHROPIC_API_KEY' | 'ANTHROPIC_AUTH_TOKEN' | 'none'

export function getAnthropicApiKeyWithSource(
  _opts?: { skipRetrievingKeyFromApiKeyHelper?: boolean },
): { key: string | null; source: ApiKeySource } {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return { key: process.env.ANTHROPIC_AUTH_TOKEN, source: 'ANTHROPIC_AUTH_TOKEN' }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { key: process.env.ANTHROPIC_API_KEY, source: 'ANTHROPIC_API_KEY' }
  }
  return { key: null, source: 'none' }
}

// ─── Auth source ───────────────────────────────────────────────────

export function getAuthTokenSource(): { source: string; hasToken: boolean } {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return { source: 'ANTHROPIC_AUTH_TOKEN', hasToken: true }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { source: 'ANTHROPIC_API_KEY', hasToken: true }
  }
  return { source: 'none', hasToken: false }
}

// ─── Always-false stubs (OpenRouter never uses these) ──────────────

export function isAnthropicAuthEnabled(): boolean {
  return false
}

export function isClaudeAISubscriber(): boolean {
  return false
}

export type SubscriptionType = 'max' | 'pro' | 'enterprise' | 'team' | null

export function getSubscriptionType(): SubscriptionType {
  return null
}

export function isMaxSubscriber(): boolean {
  return false
}

export function isTeamSubscriber(): boolean {
  return false
}

export function isTeamPremiumSubscriber(): boolean {
  return false
}

export function isEnterpriseSubscriber(): boolean {
  return false
}

export function isProSubscriber(): boolean {
  return false
}

export function isConsumerSubscriber(): boolean {
  return false
}

export function hasOpusAccess(): boolean {
  return true
}

export function getRateLimitTier(): string | null {
  return null
}

export function getSubscriptionName(): string {
  return 'OpenRouter'
}

export function isUsing3PServices(): boolean {
  return false
}

export function is1PApiCustomer(): boolean {
  return false
}

export function isOverageProvisioningAllowed(): boolean {
  return false
}

export function hasProfileScope(): boolean {
  return false
}

export function getOauthAccountInfo(): undefined {
  return undefined
}

export type UserAccountInfo = {
  subscription?: string
  tokenSource?: string
  apiKeySource?: ApiKeySource
  organization?: string
  email?: string
}

export function getAccountInformation(): UserAccountInfo {
  const { source } = getAuthTokenSource()
  const { source: apiKeySource } = getAnthropicApiKeyWithSource()
  return { tokenSource: source, apiKeySource }
}

// ─── No-ops (formerly heavy implementations) ───────────────────────

export function saveOAuthTokensIfNeeded(_tokens: unknown): { success: boolean; warning?: string } {
  return { success: true }
}

export function getClaudeAIOAuthTokens(): null {
  return null
}

export function clearOAuthTokenCache(): void {}

export function checkAndRefreshOAuthTokenIfNeeded(): Promise<boolean> {
  return Promise.resolve(false)
}

export function handleOAuth401Error(_token: string): Promise<boolean> {
  return Promise.resolve(false)
}

export function validateForceLoginOrg(): Promise<{ valid: true }> {
  return Promise.resolve({ valid: true })
}

export function getConfiguredApiKeyHelper(): undefined {
  return undefined
}

export function getApiKeyFromApiKeyHelperCached(): null {
  return null
}

export function getApiKeyFromApiKeyHelper(): Promise<null> {
  return Promise.resolve(null)
}

export function clearApiKeyHelperCache(): void {}

export function prefetchApiKeyFromApiKeyHelperIfSafe(): void {}

export function getApiKeyHelperElapsedMs(): number {
  return 0
}

export function saveApiKey(_apiKey: string): Promise<void> {
  return Promise.resolve()
}

export function removeApiKey(): Promise<void> {
  return Promise.resolve()
}

export function isCustomApiKeyApproved(_apiKey: string): boolean {
  return true
}

export function clearAwsCredentialsCache(): void {}

export function refreshAndGetAwsCredentials(): Promise<null> {
  return Promise.resolve(null)
}

export function clearGcpCredentialsCache(): void {}

export function refreshGcpCredentialsIfNeeded(): Promise<boolean> {
  return Promise.resolve(false)
}

export function prefetchGcpCredentialsIfSafe(): void {}

export function prefetchAwsCredentialsAndBedRockInfoIfSafe(): void {}

export function isAwsAuthRefreshFromProjectSettings(): boolean {
  return false
}

export function isGcpAuthRefreshFromProjectSettings(): boolean {
  return false
}

export function isAwsCredentialExportFromProjectSettings(): boolean {
  return false
}

export function isOtelHeadersHelperFromProjectOrLocalSettings(): boolean {
  return false
}

export function getOtelHeadersFromHelper(): Record<string, string> {
  return {}
}

export function refreshAwsAuth(_cmd: string): Promise<boolean> {
  return Promise.resolve(false)
}

export function refreshGcpAuth(_cmd: string): Promise<boolean> {
  return Promise.resolve(false)
}

export function checkGcpCredentialsValid(): Promise<boolean> {
  return Promise.resolve(false)
}

export function getClaudeAIOAuthTokensAsync(): Promise<null> {
  return Promise.resolve(null)
}

export type OrgValidationResult = { valid: true } | { valid: false; message: string }
