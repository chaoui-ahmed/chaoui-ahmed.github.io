"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import Image from "next/image"

interface PuzzleLevelsProps {
  onNavigate: (state: GameState) => void
}

export function PuzzleLevels({ onNavigate }: PuzzleLevelsProps) {
  const { gameState, updateGameState } = useGame()

  const handleLevelSelect = (level: number) => {
    updateGameState({ puzzleLevel: level })
    onNavigate("puzzle-game")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Title */}
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 tracking-wider"
          style={{
            textShadow: "0 0 20px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          TRAINING ACADEMY
        </h1>
        <div className="relative w-16 h-16 mx-auto mb-4">
          <Image src="/images/jedi-symbol.png" alt="Jedi Symbol" fill className="object-contain" sizes="64px" />
        </div>
      </div>

      {/* Levels grid */}
      <div className="grid grid-cols-5 gap-4 md:gap-6 mb-12 max-w-2xl">
        {Array.from({ length: 15 }, (_, index) => {
          const level = index + 1
          const completed = gameState.puzzleLevelsCompleted[index]

          return (
            <div key={level} className="flex flex-col items-center">
              {/* Star */}
              <div
                onClick={() => handleLevelSelect(level)}
                className={`
                  w-12 h-12 md:w-16 md:h-16 cursor-pointer flex items-center justify-center text-2xl md:text-3xl
                  rounded-full border-2
                  ${
                    completed
                      ? "bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/30"
                      : "bg-gray-800/50 border-gray-600 text-gray-500 hover:border-gray-400"
                  }
                `}
              >
                {completed ? "★" : "☆"}
              </div>

              {/* Level number */}
              <div
                className="text-white text-sm font-bold mt-2 bg-gray-800/80 rounded-full w-6 h-6 flex items-center justify-center border border-yellow-400/50"
                style={{ fontFamily: "Orbitron, monospace" }}
              >
                {level}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress indicator */}
      <div className="text-center mb-8">
        <div className="text-yellow-400 text-lg font-bold mb-2">
          Progress: {gameState.puzzleLevelsCompleted.filter(Boolean).length}/15
        </div>
        <div className="w-64 bg-gray-800 rounded-full h-2 mx-auto">
          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${(gameState.puzzleLevelsCompleted.filter(Boolean).length / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Back button */}
      <div className="absolute bottom-8 left-8">
        <StarWarsButton onClick={() => onNavigate("mode-select")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
