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
