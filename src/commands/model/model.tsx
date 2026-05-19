/**
 * /model command — simplified: just accept model name string.
 * No picker UI. /model shows current model, /model xxx sets it.
 */

import chalk from 'chalk'
import * as React from 'react'
import type { CommandResultDisplay } from '../../commands.js'
import { useAppState, useSetAppState } from '../../state/AppState.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { getDefaultMainLoopModelSetting, renderDefaultModelSetting } from '../../utils/model/model.js'
import { isModelAllowed } from '../../utils/model/modelAllowlist.js'
import { validateModel } from '../../utils/model/validateModel.js'
import { MODEL_ALIASES } from '../../utils/model/aliases.js'

function SetModelAndClose({
  args,
  onDone,
}: {
  args: string
  onDone: (result?: string, options?: { display?: CommandResultDisplay }) => void
}): React.ReactNode {
  const setAppState = useSetAppState()
  const model = args === 'default' ? null : args

  React.useEffect(() => {
    async function handleModelChange(): Promise<void> {
      if (model && !isModelAllowed(model)) {
        onDone(`Model '${model}' is not available.`, { display: 'system' })
        return
      }

      if (!model) {
        setModel(null)
        return
      }

      // Skip validation for known aliases
      if (isKnownAlias(model)) {
        setModel(model)
        return
      }

      // Validate model
      try {
        const { valid, error } = await validateModel(model)
        if (valid) {
          setModel(model)
        } else {
          onDone(error || `Model '${model}' not found`, { display: 'system' })
        }
      } catch (error) {
        onDone(`Failed to validate model: ${(error as Error).message}`, { display: 'system' })
      }
    }

    function setModel(modelValue: string | null): void {
      setAppState(prev => ({
        ...prev,
        mainLoopModel: modelValue,
        mainLoopModelForSession: null,
      }))
      const displayModel = renderModelLabel(modelValue)
      onDone(`Set model to ${chalk.bold(displayModel)}`)
    }

    void handleModelChange()
  }, [model, onDone, setAppState])

  return null
}

function isKnownAlias(model: string): boolean {
  return (MODEL_ALIASES as readonly string[]).includes(model.toLowerCase().trim())
}

function ShowModelAndClose({ onDone }: { onDone: (result?: string) => void }): React.ReactNode {
  const mainLoopModel = useAppState(s => s.mainLoopModel)
  const displayModel = renderModelLabel(mainLoopModel)
  onDone(`Current model: ${displayModel}`)
  return null
}

function renderModelLabel(model: string | null): string {
  const rendered = renderDefaultModelSetting(model ?? getDefaultMainLoopModelSetting())
  return model === null ? `${rendered} (default)` : rendered
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  args = args?.trim() || ''

  if (args) {
    return <SetModelAndClose args={args} onDone={onDone} />
  }

  return <ShowModelAndClose onDone={onDone} />
}
