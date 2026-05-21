import { BASH_TOOL_NAME } from '../../tools/BashTool/toolName.js'
import { isEnvDefinedFalsy, isEnvTruthy } from '../envUtils.js'
import { getPlatform } from '../platform.js'

export const SHELL_TOOL_NAMES: string[] = [BASH_TOOL_NAME]

/**
 * Runtime gate for PowerShellTool. Always returns false — PowerShellTool has
 * been removed from this build. Kept as a no-op stub for any remaining callers.
 */
export function isPowerShellToolEnabled(): boolean {
  return false
}
