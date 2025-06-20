"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Users, Puzzle, Wifi } from "lucide-react"

interface ModeSelectProps {
  onModeSelect: (mode: string) => void
}

export function ModeSelect({ onModeSelect }: ModeSelectProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)

  const modes = [
    {
      id: "ai",
      title: "AI MODE",
      description: "Battle against advanced AI opponents",
      icon: Bot,
      color: "from-red-600 to-red-800",
      characters: ["Obi-Wan", "Vader"],
    },
    {
      id: "puzzle",
      title: "PUZZLE MODE",
      description: "Solve challenging Othello puzzles",
      icon: Puzzle,
      color: "from-blue-600 to-blue-800",
      characters: ["Anakin"],
    },
    {
      id: "duo",
      title: "DUO MODE",
      description: "Multiplayer battles with friends",
      icon: Users,
      color: "from-green-600 to-green-800",
      characters: ["R2-D2", "C-3PO"],
    },
    {
      id: "ai-network",
      title: "AI NETWORK BATTLE",
      description: "Watch AIs battle across the network",
      icon: Wifi,
      color: "from-purple-600 to-purple-800",
      characters: ["Network AIs"],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="text-center mb-12 z-10">
        <h1
          className="text-6xl font-bold text-yellow-400 mb-4 tracking-wider"
          style={{
            fontFamily: "Orbitron, monospace",
            textShadow: "0 0 20px rgba(255, 255, 0, 0.5)",
          }}
        >
          SELECT MODE
        </h1>
        <p className="text-xl text-white opacity-80">Choose your path to victory</p>
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        {modes.map((mode) => {
          const IconComponent = mode.icon
          return (
            <Card
              key={mode.id}
              className={`relative overflow-hidden border-2 border-yellow-400 bg-gradient-to-br ${mode.color} hover:scale-105 transition-all duration-300 cursor-pointer group`}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => onModeSelect(mode.id)}
            >
              <CardContent className="p-8 text-center relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-yellow-400/20 border-2 border-yellow-400">
                    <IconComponent className="w-12 h-12 text-yellow-400" />
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="text-3xl font-bold text-yellow-400 mb-4 tracking-wider"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  {mode.title}
                </h2>

                {/* Description */}
                <p className="text-white text-lg mb-6 opacity-90">{mode.description}</p>

                {/* Characters */}
                <div className="flex justify-center gap-2 mb-6">
                  {mode.characters.map((character, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-black/30 rounded-full text-yellow-400 text-sm border border-yellow-400/50"
                    >
                      {character}
                    </div>
                  ))}
                </div>

                {/* Hover effect */}
                {hoveredMode === mode.id && (
                  <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-pulse" />
                )}

                {/* Select Button */}
                <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform group-hover:scale-110"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  SELECT
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center z-10">
        <p className="text-gray-400 text-sm">May the Force be with you in your choice...</p>
      </div>
    </div>
  )
}
