/**
 * Plugin delisting detection.
 *
 * Compares installed plugins against marketplace manifests to find plugins
 * that have been removed, and auto-uninstalls them.
 *
 * The security.json fetch was removed (see #25447) — ~29.5M/week GitHub hits
 * for UI reason/text only. If re-introduced, serve from downloads.claude.ai.
 */

/**
 * Plugin delisting detection - no-op (plugin system removed)
 */
export async function detectAndUninstallDelistedPlugins(): Promise<string[]> {
  return []
}
