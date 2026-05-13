import { isInBundledMode } from 'src/utils/bundledMode.js';
import { getCurrentInstallationType } from 'src/utils/doctorDiagnostic.js';
import { isEnvTruthy } from 'src/utils/envUtils.js';
import { useStartupNotification } from './useStartupNotification.js';
const NPM_DEPRECATION_MESSAGE = 'Claude Code has switched from npm to native installer. Run `claude install` or see https://docs.anthropic.com/en/docs/claude-code/getting-started for more options.';
export function useNpmDeprecationNotification() {
  // Disabled: NPM deprecation message removed
  return null;
}
async function _temp() {
  return null;
}
