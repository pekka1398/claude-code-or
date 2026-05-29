import type { AppState } from '../../state/AppState.js';

type SetAppState = (f: (prevState: AppState) => AppState) => void;

/**
 * Plugin startup checks - no-op (plugin system removed)
 */
export async function performStartupChecks(_setAppState: SetAppState): Promise<void> {
  // Plugin system has been removed. This function is retained for import compatibility.
}
