"use client"

import { useEffect, useState } from "react"
import { getLeaderboard } from "@/app/actions"
import type { Player } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "ST"
    if (rank === 2) return "ND"
    if (rank === 3) return "RD"
    return "TH"
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-300" // Gold
    if (rank === 2) return "text-gray-300" // Silver
    if (rank === 3) return "text-orange-400" // Bronze
    return "text-white"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-pixel text-center">LEADERBOARD - ALL PLAYERS</CardTitle>
        {!loading && (
          <p className="text-center font-pixel text-sm text-gray-400">
            Showing {leaderboard.length} player{leaderboard.length !== 1 ? "s" : ""}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center font-pixel">Loading...</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leaderboard.length === 0 ? (
              <p className="text-center font-pixel">No scores yet!</p>
            ) : (
              leaderboard.map((player, index) => {
                const rank = index + 1
                return (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded transition-colors ${
                      rank <= 3 ? "bg-green-800" : "bg-green-900"
                    } ${rank === 1 ? "border-2 border-yellow-300" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center min-w-[3rem]">
                        <span className={`font-pixel text-lg font-bold ${getRankColor(rank)}`}>{rank}</span>
                        <span className={`font-pixel text-xs ${getRankColor(rank)}`}>{getRankSuffix(rank)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-pixel text-white text-lg">{player.username}</span>
                        <span className="font-pixel text-xs text-gray-400">
                          Joined {new Date(player.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-pixel text-xl font-bold ${getRankColor(rank)}`}>{player.high_score}</span>
                      <span className="font-pixel text-xs text-gray-400">HIGH SCORE</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
