/**
 * Bridge status utilities — stubbed for OpenRouter build.
 * Remote Control is not supported; these exports satisfy remaining imports.
 */

export type StatusState = never

export const TOOL_DISPLAY_EXPIRY_MS = 30_000
export const SHIMMER_INTERVAL_MS = 150

export function timestamp(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function abbreviateActivity(summary: string): string {
  return summary.slice(0, 30)
}

export function buildBridgeConnectUrl(): string {
  return ''
}

export function buildBridgeSessionUrl(): string {
  return ''
}

export function computeGlimmerIndex(): number {
  return 0
}

export function computeShimmerSegments(text: string): {
  before: string
  shimmer: string
  after: string
} {
  return { before: text, shimmer: '', after: '' }
}

export type BridgeStatusInfo = {
  label: string
  color: 'error' | 'warning' | 'success'
}

export function getBridgeStatus(): BridgeStatusInfo {
  return { label: 'Remote Control failed', color: 'error' }
}

export function buildIdleFooterText(): string {
  return ''
}

export function buildActiveFooterText(): string {
  return ''
}

export const FAILED_FOOTER_TEXT = 'Something went wrong, please try again'

export function wrapWithOsc8Link(text: string, url: string): string {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remS = s % 60
  if (m < 60) return remS > 0 ? `${m}m ${remS}s` : `${m}m`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`
}

export function truncatePrompt(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1) + '\u2026'
}
