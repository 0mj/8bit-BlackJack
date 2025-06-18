"use client"

interface DebugPanelProps {
  playerScore: number
  dealerScore: number
  result: string
  dealerExpression: string
  visible?: boolean
}

export default function DebugPanel({
  playerScore,
  dealerScore,
  result,
  dealerExpression,
  visible = false,
}: DebugPanelProps) {
  if (!visible) return null

  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-80 text-white p-2 text-xs font-mono">
      <div>Player Score: {playerScore}</div>
      <div>Dealer Score: {dealerScore}</div>
      <div>Result: {result}</div>
      <div>Dealer Expression: {dealerExpression}</div>
    </div>
  )
}
