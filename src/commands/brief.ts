import { feature } from 'bun:bundle'

// BriefTool has been removed. This command is a no-op stub.
// All brief-related functionality (KAIROS_BRIEF feature) is disabled
// since the BriefTool directory no longer exists.

const brief = {
  type: 'local-jsx' as const,
  name: 'brief',
  description: 'Toggle brief-only mode (disabled)',
  isEnabled: () => false,
  immediate: true,
  load: () =>
    Promise.resolve({
      async call(onDone: (result: string, options?: { display?: string }) => void): Promise<null> {
        onDone('Brief mode is not available in this build', { display: 'system' })
        return null
      },
    }),
} satisfies import('../types/command.js').Command

export default brief
