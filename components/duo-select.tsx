"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import Image from "next/image"

interface DuoSelectProps {
  onNavigate: (state: GameState) => void
}

export function DuoSelect({ onNavigate }: DuoSelectProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Title */}
      <div className="text-center mb-16">
        <h1
          className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 tracking-wider"
          style={{
            textShadow: "0 0 20px #fbbf24",
            fontFamily: "Orbitron, monospace",
          }}
        >
          MULTIPLAYER ARENA
        </h1>
        <p className="text-lg text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Choose your multiplayer experience
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Create Lobby */}
        <div
          onClick={() => onNavigate("duo-create")}
          className="relative bg-gradient-to-br from-blue-900/80 to-cyan-700/80 backdrop-blur-sm rounded-2xl p-8 cursor-pointer border border-blue-500/30 hover:border-blue-400/60"
        >
          <div className="text-center">
            {/* Image */}
            <div className="mb-6 relative w-20 h-20 mx-auto">
              <Image
                src="/images/millennium-falcon.webp"
                alt="Millennium Falcon"
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>

            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
              CREATE LOBBY
            </h3>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Host a new multiplayer battle and invite others to join your arena
            </p>

            <StarWarsButton onClick={() => onNavigate("duo-create")} className="w-full">
              CREATE
            </StarWarsButton>
          </div>
        </div>

        {/* Join Lobby */}
        <div
          onClick={() => onNavigate("duo-join")}
          className="relative bg-gradient-to-br from-purple-900/80 to-pink-700/80 backdrop-blur-sm rounded-2xl p-8 cursor-pointer border border-purple-500/30 hover:border-purple-400/60"
        >
          <div className="text-center">
            {/* Image */}
            <div className="mb-6 relative w-20 h-20 mx-auto">
              <Image src="/images/death-star.png" alt="Death Star" fill className="object-contain" sizes="80px" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
              JOIN LOBBY
            </h3>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Enter a lobby code to join an existing battle arena
            </p>

            <StarWarsButton onClick={() => onNavigate("duo-join")} variant="secondary" className="w-full">
              JOIN
            </StarWarsButton>
          </div>
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
