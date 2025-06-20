"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"

interface DuoCreateProps {
  onNavigate: (state: GameState) => void
}

export function DuoCreate({ onNavigate }: DuoCreateProps) {
  const [ipAddress, setIpAddress] = useState("")
  const { updateGameState } = useGame()

  const handleCreateLobby = () => {
    if (ipAddress.trim()) {
      // Use consistent naming: IP address as both name and code
      updateGameState({
        lobbyName: ipAddress.trim(),
        lobbyCode: ipAddress.trim(),
      })
      onNavigate("duo-lobby")
    }
  }

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
          CREATE SERVER
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Host a multiplayer game
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative w-full max-w-md"
      >
        <div
          className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-8"
          style={{
            boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
          }}
        >
          {/* Darth Vader */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            className="text-center mb-8"
          >
            <img src="/images/vader.png" alt="Darth Vader" className="h-32 w-auto mx-auto" />
          </motion.div>

          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-bold mb-3" style={{ fontFamily: "Orbitron, monospace" }}>
                Your IP Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: "#fbbf24" }}
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all duration-300"
                style={{ fontFamily: "Orbitron, monospace" }}
                onKeyPress={(e) => e.key === "Enter" && handleCreateLobby()}
              />
              <p className="text-gray-400 text-sm mt-2">Enter your local IP address (e.g., 192.168.1.100)</p>
            </div>

            <StarWarsButton onClick={handleCreateLobby} disabled={!ipAddress.trim()} className="w-full" size="lg">
              START SERVER
            </StarWarsButton>
          </div>
        </div>
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
