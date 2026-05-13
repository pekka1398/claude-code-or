import { homedir } from 'os'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'

// Mirror of the Rust Pricing struct in ~/.cache-aware/config.json
type Pricing = {
  input: number
  cache_read: number
  cache_write: number
  output: number
}

type ProviderEntry = {
  priority: number
  pricing: Pricing
}

type ModelConfig = {
  providers: Record<string, ProviderEntry>
}

type CacheAwareConfig = {
  models: Record<string, ModelConfig>
}

let _config: CacheAwareConfig | null = null
let _config_mtime: number = 0

function configPath(): string {
  return join(homedir(), '.claude-code-or', 'config.json')
}

function loadConfig(): CacheAwareConfig | null {
  const path = configPath()
  if (!existsSync(path)) return null
  try {
    const stat = require('fs').statSync(path)
    // Reload if file changed
    if (_config && stat.mtimeMs === _config_mtime) return _config
    const raw = readFileSync(path, 'utf-8')
    _config = JSON.parse(raw) as CacheAwareConfig
    _config_mtime = stat.mtimeMs
    return _config
  } catch {
    return null
  }
}

/**
 * Find pricing for a model from config.
 * Uses the highest-priority (lowest priority number) provider's pricing.
 * Falls back to prefix glob ("anthropic/*") then wildcard "*".
 */
export function getPricingForModel(model: string): Pricing | null {
  const config = loadConfig()
  if (!config) return null

  const mc = findModelConfig(config, model)
  if (!mc || Object.keys(mc.providers).length === 0) return null

  // Pick the highest-priority provider (lowest priority number)
  const entries = Object.values(mc.providers)
  entries.sort((a, b) => a.priority - b.priority)
  return entries[0].pricing
}

/**
 * Compute predicted cost using config pricing.
 * Returns null if the model isn't in config.
 */
export function computePredictedCost(
  model: string,
  tokens: {
    input_new: number
    cache_read: number
    cache_write: number
    output: number
  },
): number | null {
  const pricing = getPricingForModel(model)
  if (!pricing) return null

  return (
    (tokens.input_new / 1_000_000) * pricing.input +
    (tokens.cache_read / 1_000_000) * pricing.cache_read +
    (tokens.cache_write / 1_000_000) * pricing.cache_write +
    (tokens.output / 1_000_000) * pricing.output
  )
}

function findModelConfig(config: CacheAwareConfig, model: string): ModelConfig | null {
  // Exact match
  if (config.models[model]) return config.models[model]

  // Prefix glob: "anthropic/*" matches "anthropic/claude-opus-4.7"
  for (const [pattern, mc] of Object.entries(config.models)) {
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2)
      if (model.startsWith(prefix)) return mc
    }
  }

  // Wildcard
  if (config.models['*']) return config.models['*']

  return null
}
