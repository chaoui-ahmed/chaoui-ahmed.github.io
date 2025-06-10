"use client"

import { useState } from "react"
import { StarField } from "@/components/star-field"
import { GameProvider } from "@/contexts/game-context"
import { MainMenu } from "@/components/main-menu"
import { ModeSelect } from "@/components/mode-select"
import { AICharacterSelect } from "@/components/ai-character-select"
import { AIDifficulty } from "@/components/ai-difficulty"
import { AIGame } from "@/components/ai-game"
import { PuzzleLevels } from "@/components/puzzle-levels"
import { PuzzleGame } from "@/components/puzzle-game"
import { DuoSelect } from "@/components/duo-select"
import { DuoCreate } from "@/components/duo-create"
import { DuoJoin } from "@/components/duo-join"
import { DuoLobby } from "@/components/duo-lobby"
import { DuoGame } from "@/components/duo-game"

export type GameState =
  | "main-menu"
  | "mode-select"
  | "ai-character-select"
  | "ai-difficulty"
  | "ai-game"
  | "puzzle-levels"
  | "puzzle-game"
  | "duo-select"
  | "duo-create"
  | "duo-join"
  | "duo-lobby"
  | "duo-game"

export default function StarWarsGame() {
  const [currentState, setCurrentState] = useState<GameState>("main-menu")

  const renderCurrentScreen = () => {
    switch (currentState) {
      case "main-menu":
        return <MainMenu onNavigate={setCurrentState} />
      case "mode-select":
        return <ModeSelect onNavigate={setCurrentState} />
      case "ai-character-select":
        return <AICharacterSelect onNavigate={setCurrentState} />
      case "ai-difficulty":
        return <AIDifficulty onNavigate={setCurrentState} />
      case "ai-game":
        return <AIGame onNavigate={setCurrentState} />
      case "puzzle-levels":
        return <PuzzleLevels onNavigate={setCurrentState} />
      case "puzzle-game":
        return <PuzzleGame onNavigate={setCurrentState} />
      case "duo-select":
        return <DuoSelect onNavigate={setCurrentState} />
      case "duo-create":
        return <DuoCreate onNavigate={setCurrentState} />
      case "duo-join":
        return <DuoJoin onNavigate={setCurrentState} />
      case "duo-lobby":
        return <DuoLobby onNavigate={setCurrentState} />
      case "duo-game":
        return <DuoGame onNavigate={setCurrentState} />
      default:
        return <MainMenu onNavigate={setCurrentState} />
    }
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <StarField />
        <div className="relative z-10">{renderCurrentScreen()}</div>
      </div>
    </GameProvider>
  )
}
