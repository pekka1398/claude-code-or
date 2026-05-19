/**
 * Model cost calculation — driven by ~/.claude-code-or/config.json
 *
 * Pricing is read from config.json at runtime. No hardcoded Anthropic prices.
 * Fallback: if a model is not in config.json, use $5/$25 per Mtok.
 */

import type { BetaUsage as Usage } from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { setHasUnknownModelCost } from '../bootstrap/state.js'
import { logForDebugging } from './debug.js'

export type ModelCosts = {
  inputTokens: number
  outputTokens: number
  promptCacheWriteTokens: number
  promptCacheReadTokens: number
  webSearchRequests: number
}

// Fallback for unknown models ($5/$25 per Mtok)
const DEFAULT_MODEL_COST: ModelCosts = {
  inputTokens: 5,
  outputTokens: 25,
  promptCacheWriteTokens: 6.25,
  promptCacheReadTokens: 0.5,
  webSearchRequests: 0,
}

interface ModelPricing {
  input: number
  cache_read: number
  cache_write: number
  output: number
}

interface ModelProviderConfig {
  priority: number
  pricing: ModelPricing
}

interface ModelConfig {
  providers: Record<string, ModelProviderConfig>
}

interface ConfigJson {
  models: Record<string, ModelConfig>
}

// Cached config
let _configCache: ConfigJson | null = null
let _configCacheTime = 0
const CONFIG_CACHE_TTL = 30_000 // 30s

function getConfig(): ConfigJson {
  const now = Date.now()
  if (_configCache && now - _configCacheTime < CONFIG_CACHE_TTL) {
    return _configCache
  }

  const configPaths = [
    join(homedir(), '.claude-code-or', 'config.json'),
  ]

  for (const p of configPaths) {
    if (existsSync(p)) {
      try {
        const raw = readFileSync(p, 'utf8')
        _configCache = JSON.parse(raw) as ConfigJson
        _configCacheTime = now
        return _configCache
      } catch (e) {
        logForDebugging(`Failed to read config.json: ${e}`, { level: 'error' })
      }
    }
  }

  if (!_configCache) {
    _configCache = { models: {} }
    _configCacheTime = now
  }
  return _configCache
}

/**
 * Get pricing for a model from config.json.
 * Uses the highest-priority provider's pricing.
 */
export function getModelCostsFromConfig(model: string): ModelCosts | null {
  const config = getConfig()
  const modelConfig = config.models[model]
  if (!modelConfig?.providers) return null

  // Find highest priority provider (lowest number)
  let bestProvider: ModelProviderConfig | null = null
  let bestPriority = Infinity
  for (const prov of Object.values(modelConfig.providers)) {
    if (prov.priority < bestPriority) {
      bestPriority = prov.priority
      bestProvider = prov
    }
  }

  if (!bestProvider?.pricing) return null

  const p = bestProvider.pricing
  return {
    inputTokens: p.input,
    outputTokens: p.output,
    promptCacheWriteTokens: p.cache_write,
    promptCacheReadTokens: p.cache_read,
    webSearchRequests: 0,
  }
}

/**
 * Get model costs, checking config.json first, then falling back to default.
 */
export function getModelCosts(model: string, _usage?: Usage): ModelCosts {
  // Try exact match in config
  const fromConfig = getModelCostsFromConfig(model)
  if (fromConfig) return fromConfig

  // Unknown model — use default and track
  logForDebugging(`No pricing found in config.json for model: ${model}, using default $5/$25`)
  setHasUnknownModelCost()
  return DEFAULT_MODEL_COST
}

/**
 * Calculate USD cost from token usage.
 */
function tokensToUSDCost(modelCosts: ModelCosts, usage: Usage): number {
  return (
    (usage.input_tokens / 1_000_000) * modelCosts.inputTokens +
    (usage.output_tokens / 1_000_000) * modelCosts.outputTokens +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * modelCosts.promptCacheReadTokens +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * modelCosts.promptCacheWriteTokens +
    (usage.server_tool_use?.web_search_requests ?? 0) * modelCosts.webSearchRequests
  )
}

export function calculateUSDCost(resolvedModel: string, usage: Usage): number {
  const modelCosts = getModelCosts(resolvedModel, usage)
  return tokensToUSDCost(modelCosts, usage)
}

/**
 * Calculate cost from raw token counts without a full BetaUsage object.
 */
export function calculateCostFromTokens(
  model: string,
  tokens: {
    inputTokens: number
    outputTokens: number
    cacheReadInputTokens: number
    cacheCreationInputTokens: number
  },
): number {
  const usage: Usage = {
    input_tokens: tokens.inputTokens,
    output_tokens: tokens.outputTokens,
    cache_read_input_tokens: tokens.cacheReadInputTokens,
    cache_creation_input_tokens: tokens.cacheCreationInputTokens,
  } as Usage
  return calculateUSDCost(model, usage)
}

function formatPrice(price: number): string {
  if (Number.isInteger(price)) return `$${price}`
  return `$${price.toFixed(2)}`
}

export function formatModelPricing(costs: ModelCosts): string {
  return `${formatPrice(costs.inputTokens)}/${formatPrice(costs.outputTokens)} per Mtok`
}

export function getModelPricingString(model: string): string | undefined {
  const costs = getModelCostsFromConfig(model)
  if (!costs) return undefined
  return formatModelPricing(costs)
}

// Keep these exports for backward compatibility
export const COST_TIER_3_15 = DEFAULT_MODEL_COST
export const COST_TIER_5_25 = DEFAULT_MODEL_COST
export const COST_TIER_15_75 = DEFAULT_MODEL_COST
export const COST_TIER_30_150 = DEFAULT_MODEL_COST
export const COST_HAIKU_35 = DEFAULT_MODEL_COST
export const COST_HAIKU_45 = DEFAULT_MODEL_COST
export const MODEL_COSTS: Record<string, ModelCosts> = {}
export function getOpus46CostTier(_fastMode: boolean): ModelCosts { return DEFAULT_MODEL_COST }
