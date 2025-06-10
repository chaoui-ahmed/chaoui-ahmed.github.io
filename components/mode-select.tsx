"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import Image from "next/image"

interface ModeSelectProps {
  onNavigate: (state: GameState) => void
}

export function ModeSelect({ onNavigate }: ModeSelectProps) {
  const modes = [
    {
      id: "ai",
      title: "AI BATTLE",
      description: "Challenge the computer in a strategic duel",
      icon: "/images/vader.png", // Changed to Darth Vader
      color: "from-blue-600 to-blue-800",
      action: () => onNavigate("ai-character-select"),
    },
    {
      id: "puzzle",
      title: "PUZZLE MODE",
      description: "Solve strategic challenges to improve your skills",
      icon: "/images/luke.png", // Changed to Luke Skywalker
      color: "from-amber-500 to-amber-700",
      action: () => onNavigate("puzzle-levels"),
    },
    {
      id: "duo",
      title: "MULTIPLAYER",
      description: "Battle against other players online",
      icon: "/images/c3po.png",
      color: "from-purple-600 to-purple-800",
      action: () => onNavigate("duo-select"),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1
          className="text-5xl font-bold text-yellow-400 mb-4"
          style={{
            textShadow: "0 0 20px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          SELECT MODE
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Choose your path in the galaxy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-12">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={mode.action}
            className={`bg-gradient-to-br ${mode.color} rounded-xl p-1 cursor-pointer`}
          >
            <div className="bg-gray-900 rounded-lg p-3 flex flex-col items-center text-center h-full">
              <div className="relative w-96 h-96 mb-2">
                <Image
                  src={mode.icon || "/placeholder.svg"}
                  alt={mode.title}
                  fill
                  className="object-contain"
                  sizes="384px"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Orbitron, monospace" }}>
                {mode.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3 flex-grow">{mode.description}</p>
              <StarWarsButton onClick={mode.action} className="w-full">
                SELECT
              </StarWarsButton>
            </div>
          </div>
        ))}
      </div>

      <div>
        <StarWarsButton onClick={() => onNavigate("main-menu")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
