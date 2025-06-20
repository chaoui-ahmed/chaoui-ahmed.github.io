"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import Image from "next/image"

interface AICharacterSelectProps {
  onNavigate: (state: GameState) => void
}

export function AICharacterSelect({ onNavigate }: AICharacterSelectProps) {
  const { updateGameState } = useGame()

  const characters = [
    {
      id: "jedi",
      name: "JEDI MASTER",
      description: "Master of the Light Side",
      image: "/images/obi-wan.png",
      alt: "Obi-Wan Kenobi",
      color: "from-blue-500 to-cyan-600",
      variant: "primary" as const,
    },
    {
      id: "sith",
      name: "SITH LORD",
      description: "Master of the Dark Side",
      image: "/images/vader.png",
      alt: "Darth Vader",
      color: "from-red-500 to-red-700",
      variant: "danger" as const,
    },
  ]

  const handleCharacterSelect = (character: (typeof characters)[0]) => {
    updateGameState({ selectedCharacter: character.id as any })
    onNavigate("ai-difficulty")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
      {/* Title */}
      <div className="text-center mb-20">
        <h1
          className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
          style={{
            textShadow: "0 0 20px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          CHOOSE YOUR CHAMPION
        </h1>
        <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Select your side in the eternal struggle
        </p>
      </div>

      {/* Character cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
        {characters.map((character, index) => (
          <div
            key={character.id}
            onClick={() => handleCharacterSelect(character)}
            className={`
              relative w-80 h-96 rounded-3xl cursor-pointer overflow-hidden
              bg-gradient-to-br ${character.color} p-1
            `}
            style={{
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Inner content */}
            <div className="w-full h-full bg-black/85 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              {/* Character Image - Increased size */}
              <div className="relative w-64 h-64 mb-4">
                <Image
                  src={character.image || "/placeholder.svg"}
                  alt={character.alt}
                  fill
                  className="object-contain"
                  sizes="256px"
                  priority
                />
              </div>

              {/* Name */}
              <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Orbitron, monospace" }}>
                {character.name}
              </h3>

              {/* Description */}
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">{character.description}</p>

              {/* Select button */}
              <StarWarsButton
                onClick={() => handleCharacterSelect(character)}
                variant={character.variant}
                className="w-full"
                size="lg"
              >
                CHOOSE {character.name.split(" ")[0]}
              </StarWarsButton>
            </div>
          </div>
        ))}
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
