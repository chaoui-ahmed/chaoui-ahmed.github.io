"use client"

import { useRouter } from "next/navigation"
import { GameCard } from "@/components/game-card"
import { useGame } from "@/contexts/game-context"
import { useState } from "react"

export default function ModeSelectPage() {
  const router = useRouter()
  const { updateGameState } = useGame()
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)

  const handleModeSelection = (mode: string) => {
    updateGameState({ selectedMode: mode as "ai" | "puzzle" | "duo" })
    router.push(`/${mode}/character-select`)
  }

  const modes = [
    {
      id: "ai",
      label: "AI",
      characters: ["Obi-Wan", "Dark Vador"],
      description: "Affrontez l'IA dans un jeu d'Othello",
    },
    {
      id: "puzzle",
      label: "PUZZLE",
      characters: ["Luke Skywalker"],
      description: "Résolvez des puzzles avec Luke",
    },
    {
      id: "duo",
      label: "DUO",
      characters: ["R2-D2", "C-3PO"],
      description: "Jouez en multijoueur",
    },
  ]

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#e2af00] mb-4">CHOOSE YOUR PATH</h2>
          <p className="text-white">{/* Empty string as requested */}</p>
        </div>

        <div className="flex gap-8 justify-center">
          {modes.map((mode) => (
            <div key={mode.id} className="relative">
              <GameCard
                title="THE STARS"
                showButtons={true}
                buttons={[{ label: mode.label, action: mode.id }]}
                onButtonClick={handleModeSelection}
                hoverCharacters={hoveredMode === mode.id ? mode.characters : []}
                onHover={(isHovering) => setHoveredMode(isHovering ? mode.id : null)}
                className="cursor-pointer"
              />
              {hoveredMode === mode.id && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-[#071b3f] border border-[#e2af00] rounded px-3 py-2 text-white text-sm whitespace-nowrap">
                  {mode.description}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button onClick={() => router.push("/")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
