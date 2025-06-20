"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function CharacterSelectPage() {
  const router = useRouter()
  const { gameState, updateGameState } = useGame()

  const handleCharacterSelection = (character: string) => {
    updateGameState({ selectedCharacter: character as "obi-wan" | "luke" | "droids" })
    router.push("/game")
  }

  const characters = [
    { id: "obi-wan", name: "Obi-Wan Kenobi", showButtons: true },
    { id: "luke", name: "Luke Skywalker", showLightsaber: true },
    { id: "droids", name: "R2-D2 & C-3PO", showButtons: true },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Sélection du Personnage</h2>
          <p className="text-white">Mode sélectionné: {gameState.selectedPath?.toUpperCase()}</p>
        </div>

        <div className="flex gap-8 justify-center">
          {characters.map((char) => (
            <div key={char.id} className="cursor-pointer" onClick={() => handleCharacterSelection(char.id)}>
              <GameCard
                character={char.name}
                showButtons={char.showButtons}
                showLightsaber={char.showLightsaber}
                className="hover:border-[#e3b700] cursor-pointer"
                onButtonClick={() => handleCharacterSelection(char.id)}
                buttons={[{ label: "SÉLECTIONNER", action: "select" }]}
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button onClick={() => router.push("/menu")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour au menu
          </button>
        </div>
      </div>
    </div>
  )
}
