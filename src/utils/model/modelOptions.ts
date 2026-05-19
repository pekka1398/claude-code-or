/**
 * Model options — simplified for OpenRouter.
 * Only the PAYG 3P path remains. No subscription-tier branching.
 */

import { getInitialMainLoopModel } from '../../bootstrap/state.js'
import { getModelStrings } from './modelStrings.js'
import { getModelCostsFromConfig, formatModelPricing } from '../modelCost.js'
import { getSettings_DEPRECATED } from '../settings/settings.js'
import { getAPIProvider } from './providers.js'
import { isModelAllowed } from './modelAllowlist.js'
import {
  getCanonicalName,
  getDefaultSonnetModel,
  getDefaultOpusModel,
  getDefaultHaikuModel,
  getDefaultMainLoopModelSetting,
  getMarketingNameForModel,
  getUserSpecifiedModelSetting,
  renderDefaultModelSetting,
  type ModelSetting,
} from './model.js'
import { has1mContext } from '../context.js'
import { getGlobalConfig } from '../config.js'

export type ModelOption = {
  value: ModelSetting
  label: string
  description: string
  descriptionForModel?: string
}

export function getDefaultOptionForUser(_fastMode = false): ModelOption {
  return {
    value: null,
    label: 'Default (recommended)',
    description: `Use the default model (currently ${renderDefaultModelSetting(getDefaultMainLoopModelSetting())})`,
  }
}

function getCustomSonnetOption(): ModelOption | undefined {
  const customSonnetModel = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL
  if (customSonnetModel) {
    const is1m = has1mContext(customSonnetModel)
    const pricing = getModelCostsFromConfig(customSonnetModel)
    return {
      value: 'sonnet',
      label: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_NAME ?? customSonnetModel,
      description:
        process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION ??
        `Custom Sonnet model${is1m ? ' (1M context)' : ''}${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
      descriptionForModel: `${process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION ?? `Custom Sonnet model${is1m ? ' with 1M context' : ''}`} (${customSonnetModel})`,
    }
  }
}

function getSonnet46Option(): ModelOption {
  const model = getModelStrings().sonnet46
  const pricing = getModelCostsFromConfig(model)
  return {
    value: model,
    label: 'Sonnet 4.6',
    description: `Best for everyday tasks${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
    descriptionForModel: 'Sonnet 4.6 - best for everyday tasks',
  }
}

function getCustomOpusOption(): ModelOption | undefined {
  const customOpusModel = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL
  if (customOpusModel) {
    const is1m = has1mContext(customOpusModel)
    const pricing = getModelCostsFromConfig(customOpusModel)
    return {
      value: 'opus',
      label: process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME ?? customOpusModel,
      description:
        process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION ??
        `Custom Opus model${is1m ? ' (1M context)' : ''}${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
      descriptionForModel: `${process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION ?? `Custom Opus model${is1m ? ' with 1M context' : ''}`} (${customOpusModel})`,
    }
  }
}

function getOpus46Option(): ModelOption {
  const model = getModelStrings().opus46
  const pricing = getModelCostsFromConfig(model)
  return {
    value: model,
    label: 'Opus 4.6',
    description: `Most capable for complex work${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
    descriptionForModel: 'Opus 4.6 - most capable for complex work',
  }
}

function getCustomHaikuOption(): ModelOption | undefined {
  const customHaikuModel = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL
  if (customHaikuModel) {
    const pricing = getModelCostsFromConfig(customHaikuModel)
    return {
      value: 'haiku',
      label: process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME ?? customHaikuModel,
      description:
        process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION ??
        `Custom Haiku model${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
      descriptionForModel: `${process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION ?? 'Custom Haiku model'} (${customHaikuModel})`,
    }
  }
}

function getHaikuOption(): ModelOption {
  const model = getDefaultHaikuModel()
  const pricing = getModelCostsFromConfig(model)
  return {
    value: model,
    label: 'Haiku',
    description: `Fastest for quick answers${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
    descriptionForModel: 'Haiku - fastest for quick answers. Lower cost but less capable.',
  }
}

/**
 * Build model options list — OpenRouter / PAYG 3P only.
 */
function getModelOptionsBase(_fastMode = false): ModelOption[] {
  const options = [getDefaultOptionForUser()]

  const customSonnet = getCustomSonnetOption()
  if (customSonnet !== undefined) {
    options.push(customSonnet)
  } else {
    options.push(getSonnet46Option())
  }

  const customOpus = getCustomOpusOption()
  if (customOpus !== undefined) {
    options.push(customOpus)
  } else {
    options.push(getOpus46Option())
  }

  const customHaiku = getCustomHaikuOption()
  if (customHaiku !== undefined) {
    options.push(customHaiku)
  } else {
    options.push(getHaikuOption())
  }

  // Add OpenRouter-specific models
  if (getAPIProvider() === 'openrouter') {
    // Add models from config.json that aren't already in the list
    const existingValues = new Set(options.map(o => o.value))
    const { readFileSync, existsSync } = require('fs')
    const { join } = require('path')
    const { homedir } = require('os')
    const configPath = join(homedir(), '.claude-code-or', 'config.json')
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'))
        for (const [modelId, modelConfig] of Object.entries(config.models ?? {})) {
          if (!existingValues.has(modelId)) {
            const pricing = getModelCostsFromConfig(modelId)
            options.push({
              value: modelId,
              label: modelId,
              description: `From config.json${pricing ? ` · ${formatModelPricing(pricing)}` : ''}`,
            })
            existingValues.add(modelId)
          }
        }
      } catch {}
    }
  }

  return options
}

export function getModelOptions(fastMode = false): ModelOption[] {
  const options = getModelOptionsBase(fastMode)

  // Add the custom model from env var
  const envCustomModel = process.env.ANTHROPIC_CUSTOM_MODEL_OPTION
  if (envCustomModel && !options.some(existing => existing.value === envCustomModel)) {
    options.push({
      value: envCustomModel,
      label: process.env.ANTHROPIC_CUSTOM_MODEL_OPTION_NAME ?? envCustomModel,
      description:
        process.env.ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION ??
        `Custom model (${envCustomModel})`,
    })
  }

  // Append additional model options from bootstrap cache
  for (const opt of getGlobalConfig().additionalModelOptionsCache ?? []) {
    if (!options.some(existing => existing.value === opt.value)) {
      options.push(opt)
    }
  }

  // Add current custom model if not already in the list
  let customModel: ModelSetting = null
  const currentMainLoopModel = getUserSpecifiedModelSetting()
  const initialMainLoopModel = getInitialMainLoopModel()
  if (currentMainLoopModel !== undefined && currentMainLoopModel !== null) {
    customModel = currentMainLoopModel
  } else if (initialMainLoopModel !== null) {
    customModel = initialMainLoopModel
  }

  if (customModel !== null && !options.some(opt => opt.value === customModel)) {
    const marketingName = getMarketingNameForModel(customModel)
    options.push({
      value: customModel,
      label: marketingName ?? customModel,
      description: marketingName ? customModel : 'Custom model',
    })
  }

  return filterModelOptionsByAllowlist(options)
}

function filterModelOptionsByAllowlist(options: ModelOption[]): ModelOption[] {
  const settings = getSettings_DEPRECATED() || {}
  if (!settings.availableModels) return options
  return options.filter(
    opt => opt.value === null || (opt.value !== null && isModelAllowed(opt.value)),
  )
}
