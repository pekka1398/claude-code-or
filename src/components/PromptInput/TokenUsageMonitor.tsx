import * as React from 'react'
import { Box, Text } from '../../ink.js'
import {
  getLastRequestInputTokens,
  getLastRequestOutputTokens,
  getLastRequestCostUSD,
  getLastRequestORCostUSD,
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

function formatTokenCount(n: number): string {
  return n.toLocaleString()
}

function formatCostUSD(cost: number): string {
  if (cost === 0) return '$0'
  // Show up to 4 decimal places, strip trailing zeros
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
  const isOR = isOpenRouter()
  const cost = isOR && data.lastORCost > 0 ? data.lastORCost
    : isOR && data.totalORCost > 0 ? data.totalORCost
    : data.lastEstCost > 0 ? data.lastEstCost
    : data.totalEstCost

  if (inputTokens === 0 && outputTokens === 0) return null

  const isNarrow = columns < 80

  if (isNarrow) {
    return (
      <Box gap={1}>
        <Text dimColor>
          <Text color="suggestion">in</Text>{formatTokenCount(inputTokens)}
          <Text> </Text>
          <Text color="warning">out</Text>{formatTokenCount(outputTokens)}
          <Text> </Text>
          <Text color="success">{formatCostUSD(cost)}</Text>
        </Text>
      </Box>
    )
  }

  return (
    <Box gap={1}>
      <Text dimColor>
        <Text color="suggestion">in</Text>:{formatTokenCount(inputTokens)}
        <Text> </Text>
        <Text color="warning">out</Text>:{formatTokenCount(outputTokens)}
        <Text> </Text>
        <Text color="success">{formatCostUSD(cost)}</Text>
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
    totalInput: getTotalInputTokens() + getTotalCacheCreationInputTokens() + getTotalCacheReadInputTokens(),
    totalOutput: getTotalOutputTokens(),
    totalEstCost: getTotalCostUSD(),
    totalORCost: getOpenRouterActualCostUSD(),
  }
}
