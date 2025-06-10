"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function AIDifficultyPage() {
  const router = useRouter()
  const { gameState, updateGameState } = useGame()

  const handleDifficultySelection = (difficulty: number) => {
    updateGameState({ aiDifficulty: difficulty as 1 | 2 | 3 })
    router.push("/ai/game")
  }

  const difficulties = [
    { level: 1, name: "Padawan", power: 33, description: "Niveau débutant" },
    { level: 2, name: "Chevalier Jedi", power: 66, description: "Niveau intermédiaire" },
    { level: 3, name: "Maître Jedi", power: 100, description: "Niveau expert" },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Sélection de la Difficulté</h2>
          <p className="text-white">Personnage sélectionné: {gameState.selectedCharacter}</p>
        </div>

        <div className="flex gap-6 justify-center">
          {difficulties.map((diff) => (
            <div key={diff.level} className="cursor-pointer" onClick={() => handleDifficultySelection(diff.level)}>
              <GameCard
                title={diff.name}
                character={gameState.selectedCharacter || ""}
                showPowerGauge={true}
                powerLevel={diff.power}
                showButtons={true}
                buttons={[{ label: "CHOISIR", action: "select" }]}
                onButtonClick={() => handleDifficultySelection(diff.level)}
                className="hover:border-[#e3b700]"
              />
              <p className="text-white text-sm mt-2">{diff.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push("/ai/character-select")}
            className="text-[#e2af00] hover:text-[#e3b700] underline"
          >
            ← Changer de personnage
          </button>
        </div>
      </div>
    </div>
  )
}
