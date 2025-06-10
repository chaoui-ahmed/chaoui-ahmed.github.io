"use client"

import { motion } from "framer-motion"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"

interface DuoSelectProps {
  onNavigate: (state: GameState) => void
}

export function DuoSelect({ onNavigate }: DuoSelectProps) {
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
          MULTIPLAYER MODE
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Choose your multiplayer option
        </p>
      </motion.div>

      {/* Game Mode Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
      >
        {/* Local Multiplayer */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative group cursor-pointer"
          onClick={() => onNavigate("duo-create")}
        >
          <div
            className="bg-gradient-to-br from-blue-900/80 to-blue-700/80 border-2 border-yellow-400 rounded-2xl p-8 text-center h-80"
            style={{
              boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -5, 0],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 text-3xl">🏠</span>
              </div>
            </motion.div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
              LOCAL GAME
            </h3>
            <p className="text-gray-300 mb-6">Play on the same device with a friend</p>
            <div className="text-yellow-400 text-sm">• Same device • Turn-based gameplay • Instant setup</div>
          </div>
        </motion.div>

        {/* Network Multiplayer */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative group cursor-pointer"
          onClick={() => onNavigate("network-setup")}
        >
          <div
            className="bg-gradient-to-br from-red-900/80 to-red-700/80 border-2 border-yellow-400 rounded-2xl p-8 text-center h-80"
            style={{
              boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
            }}
          >
            <motion.div
              animate={{
                x: [0, 10, -10, 0],
                y: [0, -5, 0],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 text-3xl">🌐</span>
              </div>
            </motion.div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
              NETWORK GAME
            </h3>
            <p className="text-gray-300 mb-6">Connect with players on your local network</p>
            <div className="text-yellow-400 text-sm">• Different devices • Real-time sync • LAN connection</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-8"
      >
        <StarWarsButton onClick={() => onNavigate("mode-select")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </motion.div>
    </div>
  )
}
