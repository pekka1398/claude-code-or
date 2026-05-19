/**
 * Simplified billing — OpenRouter users always have billing access.
 */

import { getAnthropicApiKey } from './auth.js'
import { isEnvTruthy } from './envUtils.js'

export function hasConsoleBillingAccess(): boolean {
  if (isEnvTruthy(process.env.DISABLE_COST_WARNINGS)) return false
  return getAnthropicApiKey() !== null
}

export function hasClaudeAiBillingAccess(): boolean {
  return false // Never a Claude.ai subscriber
}

let mockBillingAccessOverride: boolean | null = null

export function setMockBillingAccessOverride(value: boolean | null): void {
  mockBillingAccessOverride = value
}
