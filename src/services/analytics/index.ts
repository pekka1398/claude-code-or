/**
 * Analytics service - public API for event logging
 *
 * Stubbed for OpenRouter-only build — all event logging is a no-op.
 *
 * DESIGN: This module has NO dependencies to avoid import cycles.
 */

/**
 * Marker type for verifying analytics metadata doesn't contain sensitive data
 */
export type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = never

/**
 * Marker type for values routed to PII-tagged proto columns via `_PROTO_*`
 * payload keys.
 */
export type AnalyticsMetadata_I_VERIFIED_THIS_IS_PII_TAGGED = never

/**
 * Strip `_PROTO_*` keys from a payload destined for general-access storage.
 * Stubbed — returns input unchanged.
 */
export function stripProtoFields<V>(
  metadata: Record<string, V>,
): Record<string, V> {
  return metadata
}

// Internal type for logEvent metadata
type LogEventMetadata = { [key: string]: boolean | number | undefined }

/**
 * Sink interface for the analytics backend
 */
export type AnalyticsSink = {
  logEvent: (eventName: string, metadata: LogEventMetadata) => void
  logEventAsync: (
    eventName: string,
    metadata: LogEventMetadata,
  ) => Promise<void>
}

/**
 * Attach the analytics sink that will receive all events.
 * Stubbed — no-op.
 */
export function attachAnalyticsSink(_newSink: AnalyticsSink): void {
  // Analytics disabled for OpenRouter-only build
}

/**
 * Log an event to analytics backends (synchronous)
 * Stubbed — silently discards.
 */
export function logEvent(
  _eventName: string,
  _metadata: LogEventMetadata,
): void {
  // Analytics disabled for OpenRouter-only build
}

/**
 * Log an event to analytics backends (asynchronous)
 * Stubbed — silently discards.
 */
export async function logEventAsync(
  _eventName: string,
  _metadata: LogEventMetadata,
): Promise<void> {
  // Analytics disabled for OpenRouter-only build
}

/**
 * Reset analytics state for testing purposes only.
 * @internal
 */
export function _resetForTesting(): void {
  // Analytics disabled for OpenRouter-only build
}
