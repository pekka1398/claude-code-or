import React from 'react'
import type { Command, LocalJSXCommandCall } from '../../types/command.js'

const call: LocalJSXCommandCall = async (onDone, context, _args) => {
    // Lazy-load the memory extraction function
    const { manuallyExtractSessionMemory } = await import('../../services/SessionMemory/sessionMemory.js')
    const { messages } = context
    const toolUseContext = context

    // Inform the user summarization has started
    onDone('Generating conversation summary...', { display: 'system', shouldQuery: false });

    try {
        const result = await manuallyExtractSessionMemory(messages, toolUseContext)

        if (result.success) {
            onDone(`✅ Summary generated and saved. You can find your session notes at: ${result.memoryPath}`)
        } else {
            onDone(`❌ Summary failed: ${result.error}`, { display: 'system' })
        }
    } catch (error) {
        onDone(`❌ Error during summarization: ${error instanceof Error ? error.message : String(error)}`, { display: 'system' })
    }
    return null
}

const summary: Command = {
    name: 'summary',
    aliases: ['summarize'],
    description: 'Generate a summary of the current session',
    type: 'local-jsx',
    load: async () => ({ call })
}

export default summary
