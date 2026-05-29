/**
 * Bridge debug utilities — stubbed for OpenRouter build.
 */

export type BridgeDebugHandle = never

export function registerBridgeDebugHandle(): void {}
export function clearBridgeDebugHandle(): void {}

export function getBridgeDebugHandle(): null {
  return null
}

export function injectBridgeFault(): void {}

export function wrapApiForFaultInjection<T>(api: T): T {
  return api
}
