/**
 * Bridge poll interval config — stubbed for OpenRouter build.
 */

export type PollIntervalConfig = {
  poll_interval_ms_not_at_capacity: number
  poll_interval_ms_at_capacity: number
  non_exclusive_heartbeat_interval_ms: number
  multisession_poll_interval_ms_not_at_capacity: number
  multisession_poll_interval_ms_partial_capacity: number
  multisession_poll_interval_ms_at_capacity: number
  reclaim_older_than_ms: number
  session_keepalive_interval_v2_ms: number
}

export function getPollIntervalConfig(): PollIntervalConfig {
  return {
    poll_interval_ms_not_at_capacity: 5_000,
    poll_interval_ms_at_capacity: 0,
    non_exclusive_heartbeat_interval_ms: 0,
    multisession_poll_interval_ms_not_at_capacity: 5_000,
    multisession_poll_interval_ms_partial_capacity: 5_000,
    multisession_poll_interval_ms_at_capacity: 0,
    reclaim_older_than_ms: 5_000,
    session_keepalive_interval_v2_ms: 120_000,
  }
}
