"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"

export default function AICharacterSelectPage() {
  const router = useRouter()
  const { updateGameState } = useGame()

  const handleCharacterSelection = (character: string) => {
    updateGameState({ selectedCharacter: character })
    router.push("/ai/difficulty")
  }

  const characters = [
    { id: "obi-wan", name: "Obi-Wan Kenobi", side: "light" },
    { id: "vader", name: "Dark Vador", side: "dark" },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Mode IA - Choix du Personnage</h2>
          <p className="text-white">Choisissez votre champion pour affronter l'IA</p>
        </div>

        <div className="flex gap-8 justify-center">
          {characters.map((char) => (
            <div key={char.id} className="cursor-pointer" onClick={() => handleCharacterSelection(char.id)}>
              <GameCard
                character={char.name}
                showButtons={true}
                buttons={[{ label: "SÉLECTIONNER", action: "select" }]}
                onButtonClick={() => handleCharacterSelection(char.id)}
                className="hover:border-[#e3b700]"
              />
              <p className="text-white text-sm mt-2">{char.side === "light" ? "Côté Lumineux" : "Côté Obscur"}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button onClick={() => router.push("/mode-select")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour aux modes
          </button>
        </div>
      </div>
    </div>
  )
}
