"use client"

import { useEffect, useState } from "react"
import { getPlayerHistory } from "@/app/actions"
import type { GameHistory } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GameHistoryProps {
  username: string
}

export default function GameHistoryComponent({ username }: GameHistoryProps) {
  const [history, setHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!username) return

      try {
        const data = await getPlayerHistory(username)
        setHistory(data)
      } catch (error) {
        console.error("Error fetching game history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [username])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-pixel text-center">GAME HISTORY</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center font-pixel">Loading...</p>
        ) : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-center font-pixel">No game history yet!</p>
            ) : (
              history.map((game) => (
                <div key={game.id} className="flex justify-between items-center bg-green-900 p-2 rounded">
                  <div className="font-pixel text-white">
                    You: {game.player_score} | Dealer: {game.dealer_score}
                  </div>
                  <span
                    className={`font-pixel ${
                      game.result.includes("win")
                        ? "text-green-400"
                        : game.result.includes("tie")
                          ? "text-yellow-300"
                          : "text-red-400"
                    }`}
                  >
                    {game.result}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
