import * as React from 'react'
import { Box, Text } from '../../ink.js'
import {
  getLastRequestInputTokens,
  getLastRequestOutputTokens,
  getLastRequestCostUSD,
  getLastRequestORCostUSD,
  getLastRequestCacheReadTokens,
  getLastRequestCacheWriteTokens,
  getTotalInputTokens,
  getTotalOutputTokens,
  getTotalCacheReadInputTokens,
  getTotalCacheCreationInputTokens,
  getTotalCostUSD,
  getOpenRouterActualCostUSD,
} from '../../bootstrap/state.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'

type Props = {
  isLoading: boolean
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function fmtCost(cost: number): string {
  if (cost === 0) return '$0'
  const s = cost.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return `$${s}`
}

function isOpenRouter(): boolean {
  return !!process.env.OPENROUTER_API_KEY
}

export function TokenUsageMonitor({ isLoading }: Props): React.ReactNode {
  const { columns } = useTerminalSize()

  const [data, setData] = React.useState(() => readData())

  React.useEffect(() => {
    const update = () => setData(readData())
    update()

    if (isLoading) {
      const interval = setInterval(update, 500)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Prefer per-request data (last API call), fallback to cumulative session total
  const inputTokens = data.lastInput > 0 ? data.lastInput : data.totalInput
  const outputTokens = data.lastOutput > 0 ? data.lastOutput : data.totalOutput
  const cacheRead = data.lastCacheRead > 0 ? data.lastCacheRead : data.totalCacheRead
  const cacheWrite = data.lastCacheWrite > 0 ? data.lastCacheWrite : data.totalCacheWrite
  const newTokens = Math.max(inputTokens - cacheRead - cacheWrite, 0)
  const isOR = isOpenRouter()

  // Actual cost: OR actual when available, else estimated
  const actualCost = isOR && data.lastORCost > 0 ? data.lastORCost
    : isOR && data.totalORCost > 0 ? data.totalORCost
    : data.lastEstCost > 0 ? data.lastEstCost
    : data.totalEstCost
  // Predicted cost: always the model-based estimate
  const predictCost = data.lastEstCost > 0 ? data.lastEstCost : data.totalEstCost

  if (inputTokens === 0 && outputTokens === 0) return null

  // Format: in:15.5k(R:13.2k/W:0.3k/N:0k) out:10 $0.0067(P:$0.0066)
  const isNarrow = columns < 100

  return (
    <Box gap={0}>
      <Text dimColor>
        <Text color="suggestion">in:</Text>{fmt(inputTokens)}
        <Text color="gray">(</Text>
        <Text color="cyan">R:</Text>{fmt(cacheRead)}
        <Text color="gray">/</Text>
        <Text color="magenta">W:</Text>{fmt(cacheWrite)}
        <Text color="gray">/</Text>
        <Text color="suggestion">N:</Text>{fmt(newTokens)}
        <Text color="gray">)</Text>
        <Text> </Text>
        <Text color="warning">out:</Text>{fmt(outputTokens)}
        <Text> </Text>
        <Text color="success">{fmtCost(actualCost)}</Text>
        <Text color="gray">(P:{fmtCost(predictCost)})</Text>
      </Text>
    </Box>
  )
}

function readData() {
  return {
    lastInput: getLastRequestInputTokens(),
    lastOutput: getLastRequestOutputTokens(),
    lastEstCost: getLastRequestCostUSD(),
    lastORCost: getLastRequestORCostUSD(),
    lastCacheRead: getLastRequestCacheReadTokens(),
    lastCacheWrite: getLastRequestCacheWriteTokens(),
    totalInput: getTotalInputTokens() + getTotalCacheCreationInputTokens() + getTotalCacheReadInputTokens(),
    totalOutput: getTotalOutputTokens(),
    totalEstCost: getTotalCostUSD(),
    totalORCost: getOpenRouterActualCostUSD(),
    totalCacheRead: getTotalCacheReadInputTokens(),
    totalCacheWrite: getTotalCacheCreationInputTokens(),
  }
}
