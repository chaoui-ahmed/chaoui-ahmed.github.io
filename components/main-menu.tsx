"use client"

import Image from "next/image"
import { StarWarsButton } from "./star-wars-button"
import type { GameState } from "@/app/page"
import Link from "next/link"

interface MainMenuProps {
  onNavigate: (state: GameState) => void
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900" />

      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-12">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <Image
              src="/images/the-stars-logo.png"
              alt="The Stars Logo"
              fill
              className="object-contain"
              sizes="128px"
              priority
            />
          </div>
          <h1
            className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4 tracking-wider"
            style={{
              textShadow: "0 0 30px #fbbf24, 0 0 60px #fbbf24",
              fontFamily: "Orbitron, monospace",
            }}
          >
            THE STARS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 tracking-wide" style={{ fontFamily: "Orbitron, monospace" }}>
            A long time ago in a galaxy far, far away...
          </p>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="relative w-16 h-16">
            <Image
              src="/images/jedi-symbol.png"
              alt="Jedi Symbol"
              fill
              className="object-contain opacity-70"
              sizes="64px"
            />
          </div>
          <div className="relative w-16 h-16">
            <Image
              src="/images/death-star.png"
              alt="Death Star"
              fill
              className="object-contain opacity-70"
              sizes="64px"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <StarWarsButton onClick={() => onNavigate("mode-select")} size="lg" className="text-2xl px-12 py-6">
            BEGIN YOUR JOURNEY
          </StarWarsButton>

          <div className="mt-6">
            <Link href="/manual">
              <StarWarsButton variant="outline" size="md" className="text-lg px-8 py-4">
                USER MANUAL
              </StarWarsButton>
            </Link>
          </div>
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 right-8 text-gray-500 text-sm" style={{ fontFamily: "Orbitron, monospace" }}>
          v1.0.0
        </div>
      </div>
    </div>
  )
}
