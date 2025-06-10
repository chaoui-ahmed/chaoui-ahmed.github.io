"use client"

import { motion } from "framer-motion"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import { useState, useEffect } from "react"

interface DuoLobbyProps {
  onNavigate: (state: GameState) => void
}

export function DuoLobby({ onNavigate }: DuoLobbyProps) {
  const { gameState } = useGame()
  const [connectedPlayers, setConnectedPlayers] = useState(1)
  const [gameReady, setGameReady] = useState(false)

  // Get the game ID from the IP address
  const gameId = gameState.lobbyCode?.replace(/\./g, "_") || "default"

  useEffect(() => {
    // Check for connected players periodically
    const checkPlayers = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}`)
        if (response.ok) {
          const game = await response.json()
          setConnectedPlayers(game.players.length)
          setGameReady(game.players.length >= 2)
        }
      } catch (error) {
        console.error("Failed to check players:", error)
      }
    }

    // Check immediately and then every 2 seconds
    checkPlayers()
    const interval = setInterval(checkPlayers, 2000)

    return () => clearInterval(interval)
  }, [gameId])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-16"
      >
        <h1
          className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
          style={{
            textShadow: "0 0 30px #fbbf24, 0 0 60px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          GAME LOBBY
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Server: {gameState.lobbyName}
        </p>
      </motion.div>

      {/* Lobby Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative w-full max-w-md mb-8"
      >
        <div
          className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-8"
          style={{
            boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
          }}
        >
          {/* Connection Status */}
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img src="/images/r2d2.png" alt="R2-D2" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-yellow-400 text-xl font-bold mb-2" style={{ fontFamily: "Orbitron, monospace" }}>
              CONNECTION STATUS
            </h3>
            <p className="text-white text-lg">Players Connected: {connectedPlayers}/2</p>
          </div>

          {/* Server Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <p className="text-gray-300 text-sm mb-1">Server IP:</p>
              <p className="text-yellow-400 font-bold text-lg">{gameState.lobbyCode}</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <p className="text-gray-300 text-sm mb-1">Port:</p>
              <p className="text-yellow-400 font-bold text-lg">14010</p>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            {gameReady ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-green-400 font-bold">
                ✓ Ready to start!
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-yellow-400"
              >
                Waiting for second player...
              </motion.div>
            )}
          </div>

          {/* Start Game Button */}
          <StarWarsButton onClick={() => onNavigate("duo-game")} disabled={!gameReady} className="w-full" size="lg">
            {gameReady ? "START BATTLE" : "WAITING FOR PLAYERS"}
          </StarWarsButton>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center max-w-md"
      >
        <p className="text-gray-400 text-sm">
          Share your IP address ({gameState.lobbyCode}) with a friend so they can join your game!
        </p>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-8"
      >
        <StarWarsButton onClick={() => onNavigate("duo-select")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </motion.div>
    </div>
  )
}
