"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import Image from "next/image"

interface AIDifficultyProps {
  onNavigate: (state: GameState) => void
}

export function AIDifficulty({ onNavigate }: AIDifficultyProps) {
  const { gameState, updateGameState } = useGame()

  const difficulties = [
    {
      id: "Greedy Algorithm",
      name: "GREEDY AI",
      description: "Quick decisions, captures most pieces immediately",
      power: 25,
      color: "from-green-400 to-green-600",
      image: "/images/luke.png",
      alt: "Luke Skywalker",
    },
    {
      id: "Minimax (Depth 3)",
      name: "TACTICAL AI",
      description: "Strategic thinking, 3 moves ahead",
      power: 60,
      color: "from-blue-400 to-blue-600",
      image: "/images/obi-wan.png",
      alt: "Obi-Wan Kenobi",
    },
    {
      id: "Minimax (Depth 4)",
      name: "STRATEGIC AI",
      description: "Advanced planning, 4 moves ahead",
      power: 75,
      color: "from-purple-400 to-purple-600",
      image: "/images/obi-wan-classic.png",
      alt: "Obi-Wan Master",
    },
    {
      id: "Monte Carlo",
      name: "SIMULATION AI",
      description: "Uses probability and random sampling",
      power: 80,
      color: "from-orange-400 to-orange-600",
      image: "/images/vader.png",
      alt: "Darth Vader",
    },
    {
      id: "Hybrid AI",
      name: "MASTER AI",
      description: "Adaptive intelligence, switches strategies",
      power: 95,
      color: "from-red-400 to-red-600",
      image: "/images/vader.png",
      alt: "Sith Master",
    },
  ]

  const handleDifficultySelect = (difficulty: (typeof difficulties)[0]) => {
    updateGameState({ aiDifficulty: difficulty.id as any })
    onNavigate("ai-game")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1
          className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
          style={{
            textShadow: "0 0 20px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          SELECT DIFFICULTY
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Character: {gameState.selectedCharacter === "jedi" ? "Jedi Master" : "Sith Lord"}
        </p>
      </div>

      {/* Character display */}
      <div className="mb-16">
        <div className="relative w-24 h-24 mx-auto">
          <Image
            src={gameState.selectedCharacter === "jedi" ? "/images/obi-wan.png" : "/images/vader.png"}
            alt={gameState.selectedCharacter === "jedi" ? "Jedi Master" : "Sith Lord"}
            fill
            className="object-contain"
            sizes="96px"
          />
        </div>
      </div>

      {/* Difficulty cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
        {difficulties.map((difficulty, index) => (
          <div
            key={difficulty.id}
            onClick={() => handleDifficultySelect(difficulty)}
            className={`
              relative w-64 h-80 rounded-2xl cursor-pointer overflow-hidden
              bg-gradient-to-br ${difficulty.color} p-1 hover:scale-105 transition-transform
            `}
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            {/* Inner content */}
            <div className="w-full h-full bg-black/85 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              {/* Character Image */}
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={difficulty.image || "/placeholder.svg"}
                  alt={difficulty.alt}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "Orbitron, monospace" }}>
                {difficulty.name}
              </h3>

              {/* Power gauge */}
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs">Power Level:</span>
                  <span className="text-yellow-400 font-bold text-sm">{difficulty.power}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${difficulty.color}`}
                    style={{ width: `${difficulty.power}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-xs mb-4 leading-relaxed">{difficulty.description}</p>

              {/* Select button */}
              <StarWarsButton onClick={() => handleDifficultySelect(difficulty)} className="w-full text-sm">
                CHOOSE
              </StarWarsButton>
            </div>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="absolute bottom-8 left-8">
        <StarWarsButton onClick={() => onNavigate("ai-character-select")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
