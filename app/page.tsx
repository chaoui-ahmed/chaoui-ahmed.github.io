"use client"

import { useState } from "react"
import { StarField } from "@/components/star-field"
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
import { NetworkConnection } from "@/components/network-connection"
import { GameProvider } from "@/contexts/game-context"
import { SoundManager } from "@/components/sound-manager"

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
  | "network-setup"
  | "network-game"

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("main-menu")
  const [isNetworkGame, setIsNetworkGame] = useState(false)
  const [networkGameId, setNetworkGameId] = useState("")
  const [isHost, setIsHost] = useState(false)

  const handleNetworkConnect = (gameId: string, hostStatus: boolean) => {
    setNetworkGameId(gameId)
    setIsHost(hostStatus)
    setIsNetworkGame(true)
    setGameState("network-game")
  }

  const renderCurrentState = () => {
    switch (gameState) {
      case "main-menu":
        return <MainMenu onNavigate={setGameState} />
      case "mode-select":
        return <ModeSelect onNavigate={setGameState} />
      case "ai-character-select":
        return <AICharacterSelect onNavigate={setGameState} />
      case "ai-difficulty":
        return <AIDifficulty onNavigate={setGameState} />
      case "ai-game":
        return <AIGame onNavigate={setGameState} />
      case "puzzle-levels":
        return <PuzzleLevels onNavigate={setGameState} />
      case "puzzle-game":
        return <PuzzleGame onNavigate={setGameState} />
      case "duo-select":
        return <DuoSelect onNavigate={setGameState} />
      case "duo-create":
        return <DuoCreate onNavigate={setGameState} />
      case "duo-join":
        return <DuoJoin onNavigate={setGameState} />
      case "duo-lobby":
        return <DuoLobby onNavigate={setGameState} />
      case "duo-game":
        return <DuoGame onNavigate={setGameState} />
      case "network-setup":
        return <NetworkConnection onConnect={handleNetworkConnect} onBack={() => setGameState("duo-select")} />
      case "network-game":
        return (
          <DuoGame
            onNavigate={setGameState}
            networkMode={{
              gameId: networkGameId,
              isHost,
              isNetworkGame: true,
            }}
          />
        )
      default:
        return <MainMenu onNavigate={setGameState} />
    }
  }

  return (
    <GameProvider>
      <div className="relative min-h-screen bg-black overflow-hidden">
        <StarField />
        <SoundManager />
        {renderCurrentState()}
      </div>
    </GameProvider>
  )
}
