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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-pixel text-center">LEADERBOARD</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center font-pixel">Loading...</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-center font-pixel">No scores yet!</p>
            ) : (
              leaderboard.map((player, index) => (
                <div key={player.id} className="flex justify-between items-center bg-green-900 p-2 rounded">
                  <div className="flex items-center">
                    <span className="font-pixel text-yellow-300 w-8">{index + 1}.</span>
                    <span className="font-pixel text-white">{player.username}</span>
                  </div>
                  <span className="font-pixel text-yellow-300">{player.high_score}</span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
