"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function PuzzleLevelsPage() {
  const router = useRouter()
  const { gameState, updateGameState } = useGame()

  const handleLevelSelection = (level: number) => {
    updateGameState({ puzzleLevel: level })
    router.push("/puzzle/game")
  }

  const levels = [
    { level: 1, stars: 1, power: 25, unlocked: true },
    { level: 2, stars: 2, power: 50, unlocked: gameState.puzzleLevel >= 1 },
    { level: 3, stars: 3, power: 75, unlocked: gameState.puzzleLevel >= 2 },
    { level: 4, stars: 4, power: 100, unlocked: gameState.puzzleLevel >= 3 },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Sélection du Niveau</h2>
          <p className="text-white">Progression avec Anakin Skywalker</p>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {levels.map((level) => (
            <div
              key={level.level}
              className={`cursor-pointer ${!level.unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => level.unlocked && handleLevelSelection(level.level)}
            >
              <GameCard
                title={`NIVEAU ${level.level}`}
                character="Anakin"
                showStars={true}
                starCount={level.stars}
                showPowerGauge={true}
                powerLevel={level.power}
                showButtons={level.unlocked}
                buttons={[{ label: level.unlocked ? "JOUER" : "VERROUILLÉ", action: "play" }]}
                onButtonClick={() => level.unlocked && handleLevelSelection(level.level)}
                className={level.unlocked ? "hover:border-[#e3b700]" : ""}
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push("/puzzle/character-select")}
            className="text-[#e2af00] hover:text-[#e3b700] underline"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  )
}
