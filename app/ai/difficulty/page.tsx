"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function AIDifficultyPage() {
  const router = useRouter()
  const { gameState, updateGameState } = useGame()

  const handleDifficultySelection = (difficulty: string) => {
    updateGameState({ aiDifficulty: difficulty as any })
    router.push("/ai/game")
  }

  const difficulties = [
    {
      level: "Greedy Algorithm",
      name: "Greedy AI",
      power: 25,
      description: "Quick decisions, captures most pieces immediately",
    },
    {
      level: "Minimax (Depth 3)",
      name: "Tactical AI",
      power: 60,
      description: "Strategic thinking, 3 moves ahead",
    },
    {
      level: "Minimax (Depth 4)",
      name: "Strategic AI",
      power: 75,
      description: "Advanced planning, 4 moves ahead",
    },
    {
      level: "Monte Carlo",
      name: "Simulation AI",
      power: 80,
      description: "Uses probability and random sampling",
    },
    {
      level: "Hybrid AI",
      name: "Master AI",
      power: 95,
      description: "Adaptive intelligence, switches strategies",
    },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Sélection de la Difficulté</h2>
          <p className="text-white">Personnage sélectionné: {gameState.selectedCharacter}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
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
