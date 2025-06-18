"use client"

import { useState, useEffect } from "react"
import { type Card as CardType, deal } from "@/lib/blackjack"
import { saveGameResult } from "@/app/actions"
import Card from "@/components/card"
import Dealer from "@/components/dealer"
import Leaderboard from "@/components/leaderboard"
import GameHistory from "@/components/game-history"
import DebugPanel from "@/components/debug-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BlackjackGame() {
  // Initialize with empty arrays to prevent undefined errors
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [dealerHand, setDealerHand] = useState<CardType[]>([])
  const [gameState, setGameState] = useState<"idle" | "playing" | "dealerTurn" | "gameOver">("idle")
  const [result, setResult] = useState<string>("")
  const [dealerCardHidden, setDealerCardHidden] = useState(true)
  const [username, setUsername] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState("game")
  const [showDebug, setShowDebug] = useState(false)
  const [gameLog, setGameLog] = useState<string[]>([])

  // Check for saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem("blackjack_username")
    if (savedUsername) {
      setUsername(savedUsername)
      setIsLoggedIn(true)
    }

    // Enable debug mode with keyboard shortcut (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebug((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const addToLog = (message: string) => {
    setGameLog((prev) => [...prev, message])
  }

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem("blackjack_username", username)
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("blackjack_username")
    setIsLoggedIn(false)
    setUsername("")
  }

  const startGame = () => {
    setGameLog([])
    const newPlayerHand = [deal(), deal()]
    const newDealerHand = [deal(), deal()]

    setPlayerHand(newPlayerHand)
    setDealerHand(newDealerHand)
    setGameState("playing")
    setResult("")
    setDealerCardHidden(true)

    addToLog(
      `Game started: Player dealt ${newPlayerHand[0].getRank()} of ${newPlayerHand[0].getSuit()} and ${newPlayerHand[1].getRank()} of ${newPlayerHand[1].getSuit()}`,
    )
    addToLog(`Dealer shows ${newDealerHand[0].getRank()} of ${newDealerHand[0].getSuit()}`)
  }

  const hit = () => {
    if (gameState !== "playing") return

    const newCard = deal()
    const newHand = [...playerHand, newCard]
    setPlayerHand(newHand)

    addToLog(`Player hit: ${newCard.getRank()} of ${newCard.getSuit()}`)

    const score = calculateScore(newHand)
    addToLog(`Player score: ${score}`)

    if (score > 21) {
      addToLog(`Player busts with ${score}`)
      endGame()
    }
  }

  const stand = () => {
    if (gameState !== "playing") return
    setGameState("dealerTurn")
    setDealerCardHidden(false)

    addToLog(`Player stands with ${calculateScore(playerHand)}`)
    addToLog(`Dealer reveals ${dealerHand[1].getRank()} of ${dealerHand[1].getSuit()}`)

    // Dealer's turn logic
    setTimeout(() => {
      let currentDealerHand = [...dealerHand]
      let dealerScore = calculateScore(currentDealerHand)
      addToLog(`Dealer score: ${dealerScore}`)

      const dealerPlay = () => {
        if (dealerScore < 17) {
          const newCard = deal()
          currentDealerHand = [...currentDealerHand, newCard]
          setDealerHand(currentDealerHand)
          dealerScore = calculateScore(currentDealerHand)

          addToLog(`Dealer hit: ${newCard.getRank()} of ${newCard.getSuit()}`)
          addToLog(`Dealer score: ${dealerScore}`)

          setTimeout(() => {
            dealerPlay()
          }, 800)
        } else {
          addToLog(`Dealer stands with ${dealerScore}`)
          endGame()
        }
      }

      dealerPlay()
    }, 800)
  }

  const endGame = async () => {
    setGameState("gameOver")
    setDealerCardHidden(false)

    const playerScore = calculateScore(playerHand)
    const dealerScore = calculateScore(dealerHand)

    addToLog(`Final scores - Player: ${playerScore}, Dealer: ${dealerScore}`)

    let resultText = ""

    // Fixed game logic for determining winner
    if (playerScore > 21) {
      resultText = "BUST! You lose!"
      addToLog(`Result: Player busts - ${resultText}`)
    } else if (dealerScore > 21) {
      resultText = "Dealer busts! You win!"
      addToLog(`Result: Dealer busts - ${resultText}`)
    } else if (playerScore > dealerScore) {
      resultText = "You win!"
      addToLog(`Result: Player score higher - ${resultText}`)
    } else if (playerScore < dealerScore) {
      resultText = "You lose!"
      addToLog(`Result: Dealer score higher - ${resultText}`)
    } else {
      resultText = "Push! It's a tie!"
      addToLog(`Result: Equal scores - ${resultText}`)
    }

    setResult(resultText)

    // Save game result to Supabase if logged in
    if (isLoggedIn) {
      try {
        await saveGameResult(username, playerScore, dealerScore, resultText)
      } catch (error) {
        console.error("Error saving game result:", error)
      }
    }
  }

  // Fixed calculateScore function to handle empty or undefined hands
  const calculateScore = (hand: CardType[] | undefined) => {
    if (!hand || hand.length === 0) return 0

    let score = 0
    let aces = 0

    for (const card of hand) {
      // Add null check for card
      if (!card) continue

      if (card.getValue() === 11) {
        aces++
      }
      score += card.getValue()
    }

    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    return score
  }

  // Determine dealer expression based on game result
  const getDealerExpression = () => {
    if (result === "Dealer busts! You win!" || result === "You win!") {
      return "angry"
    } else if (result === "BUST! You lose!" || result === "You lose!") {
      return "happy"
    } else {
      return "neutral"
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-green-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-center text-4xl font-bold text-yellow-300 mb-8 font-pixel">8-BIT BLACKJACK</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-white font-pixel mb-2">
                ENTER USERNAME
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black text-white font-pixel"
                placeholder="USERNAME"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={!username.trim()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-pixel py-4"
            >
              START
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Only calculate scores when in a valid game state
  const playerScore = gameState !== "idle" ? calculateScore(playerHand) : 0
  const visibleDealerScore =
    gameState !== "idle"
      ? dealerCardHidden && dealerHand.length > 0
        ? calculateScore([dealerHand[0]])
        : calculateScore(dealerHand)
      : 0
  const dealerExpression = getDealerExpression()

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-yellow-300 font-pixel">8-BIT BLACKJACK</h1>
          <div className="flex items-center gap-4">
            <span className="text-white font-pixel">PLAYER: {username}</span>
            <Button onClick={handleLogout} variant="outline" className="font-pixel">
              LOGOUT
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-green-900">
            <TabsTrigger value="game" className="font-pixel flex-1">
              GAME
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-pixel flex-1">
              LEADERBOARD
            </TabsTrigger>
            <TabsTrigger value="history" className="font-pixel flex-1">
              HISTORY
            </TabsTrigger>
            {showDebug && (
              <TabsTrigger value="debug" className="font-pixel flex-1">
                DEBUG
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="game" className="mt-4">
            {/* Dealer section */}
            <div className="bg-green-900 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <h2 className="text-white text-xl font-pixel">DEALER</h2>
                {gameState !== "idle" && (
                  <div className="ml-4 bg-black text-white px-2 py-1 rounded font-pixel">
                    SCORE: {visibleDealerScore}
                  </div>
                )}
              </div>

              <div className="flex items-end">
                <Dealer expression={dealerExpression} />

                <div className="flex ml-4 gap-2">
                  {dealerHand.map((card, index) => (
                    <Card key={`dealer-${index}`} card={card} hidden={index === 1 && dealerCardHidden} />
                  ))}
                </div>
              </div>
            </div>

            {/* Player section */}
            <div className="bg-green-900 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <h2 className="text-white text-xl font-pixel">PLAYER</h2>
                {gameState !== "idle" && (
                  <div className="ml-4 bg-black text-white px-2 py-1 rounded font-pixel">SCORE: {playerScore}</div>
                )}
              </div>

              <div className="flex gap-2">
                {playerHand.map((card, index) => (
                  <Card key={`player-${index}`} card={card} />
                ))}
              </div>
            </div>

            {/* Game controls */}
            <div className="flex justify-center gap-4 mt-4">
              {gameState === "idle" || gameState === "gameOver" ? (
                <Button
                  onClick={startGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-pixel px-8 py-4 text-xl"
                >
                  {gameState === "idle" ? "START GAME" : "PLAY AGAIN"}
                </Button>
              ) : gameState === "playing" ? (
                <>
                  <Button onClick={hit} className="bg-red-600 hover:bg-red-700 text-white font-pixel px-8 py-4">
                    HIT
                  </Button>
                  <Button onClick={stand} className="bg-blue-600 hover:bg-blue-700 text-white font-pixel px-8 py-4">
                    STAND
                  </Button>
                </>
              ) : null}
            </div>

            {/* Result message */}
            {result && (
              <div className="mt-6 text-center">
                <div className="bg-black text-white text-2xl p-4 rounded-lg font-pixel inline-block">{result}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <GameHistory username={username} />
          </TabsContent>

          <TabsContent value="debug" className="mt-4">
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              <h3 className="text-white font-pixel mb-2">GAME LOG</h3>
              {gameLog.length === 0 ? (
                <p>No game log yet. Start a game to see debug information.</p>
              ) : (
                <ul className="space-y-1">
                  {gameLog.map((log, index) => (
                    <li key={index}>&gt; {log}</li>
                  ))}
                </ul>
              )}

              <h3 className="text-white font-pixel mt-4 mb-2">CURRENT STATE</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Game State:</div>
                <div className="text-yellow-300">{gameState}</div>

                <div>Player Score:</div>
                <div className="text-yellow-300">{playerScore}</div>

                <div>Dealer Score:</div>
                <div className="text-yellow-300">{calculateScore(dealerHand)}</div>

                <div>Visible Dealer Score:</div>
                <div className="text-yellow-300">{visibleDealerScore}</div>

                <div>Result:</div>
                <div className="text-yellow-300">{result || "None"}</div>

                <div>Dealer Expression:</div>
                <div className="text-yellow-300">{dealerExpression}</div>
              </div>

              <h3 className="text-white font-pixel mt-4 mb-2">PLAYER HAND</h3>
              <ul>
                {playerHand.map((card, index) => (
                  <li key={index}>
                    {card.getRank()} of {card.getSuit()} (Value: {card.getValue()})
                  </li>
                ))}
              </ul>

              <h3 className="text-white font-pixel mt-4 mb-2">DEALER HAND</h3>
              <ul>
                {dealerHand.map((card, index) => (
                  <li key={index}>
                    {card.getRank()} of {card.getSuit()} (Value: {card.getValue()})
                    {index === 1 && dealerCardHidden ? " - HIDDEN" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DebugPanel
        playerScore={playerScore}
        dealerScore={visibleDealerScore}
        result={result}
        dealerExpression={dealerExpression}
        visible={showDebug}
      />
    </div>
  )
}
