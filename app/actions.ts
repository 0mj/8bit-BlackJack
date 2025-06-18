"use server"

import { createClient } from "@supabase/supabase-js"
import type { Player, GameHistory } from "@/lib/supabase"

// Create server-side Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serverSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function saveGameResult(username: string, playerScore: number, dealerScore: number, result: string) {
  // Get or create player
  let { data: player, error: playerError } = await serverSupabase
    .from("players")
    .select("*")
    .eq("username", username)
    .single()

  if (playerError || !player) {
    // Create new player
    const { data: newPlayer, error: createError } = await serverSupabase
      .from("players")
      .insert({ username, high_score: 0 })
      .select()
      .single()

    if (createError) {
      console.error("Error creating player:", createError)
      return { success: false, error: createError.message }
    }

    player = newPlayer
  }

  // Update high score if needed
  if (result.includes("win") && playerScore > player.high_score) {
    await serverSupabase.from("players").update({ high_score: playerScore }).eq("id", player.id)
  }

  // Save game history
  const { error: historyError } = await serverSupabase.from("game_history").insert({
    player_id: player.id,
    player_score: playerScore,
    dealer_score: dealerScore,
    result,
  })

  if (historyError) {
    console.error("Error saving game history:", historyError)
    return { success: false, error: historyError.message }
  }

  return { success: true }
}

export async function getLeaderboard(): Promise<Player[]> {
  const { data, error } = await serverSupabase.from("players").select("*").order("high_score", { ascending: false })
  // Removed .limit(10) to show all records

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return data || []
}

export async function getPlayerHistory(username: string): Promise<GameHistory[]> {
  // Get player
  const { data: player, error: playerError } = await serverSupabase
    .from("players")
    .select("*")
    .eq("username", username)
    .single()

  if (playerError || !player) {
    return []
  }

  // Get player's game history
  const { data, error } = await serverSupabase
    .from("game_history")
    .select("*")
    .eq("player_id", player.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching player history:", error)
    return []
  }

  return data || []
}
