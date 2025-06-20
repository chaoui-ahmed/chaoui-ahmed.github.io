"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useGame } from "@/contexts/game-context"

export default function BattlePage() {
  const router = useRouter()
  const { gameState, resetGame } = useGame()

  const handleEndGame = () => {
    resetGame()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Bataille Finale</h2>
        </div>

        <div className="flex gap-8 justify-center mb-8">
          {/* Score Card */}
          <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-64 h-48">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="bg-[#e2af00] text-[#071b3f] px-2 py-1 rounded text-xs font-bold">Alliance Rebelle</div>
                <div className="bg-[#444444] text-white px-2 py-1 rounded text-xs font-bold">Empire</div>
              </div>
              <div className="bg-[#d9d9d9] h-24 rounded mb-4 flex items-center justify-center">
                <span className="text-[#071b3f] font-bold">Score Final: {gameState.score}</span>
              </div>
              <div className="flex gap-1 justify-center">
                <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
                <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
                <div className="bg-[#e2af00] h-4 w-8 rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Lightsaber Battle */}
          <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-64 h-48">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <div className="bg-[#e2af00] text-[#071b3f] px-3 py-1 rounded text-sm font-bold inline-block">
                  THE STARS
                </div>
              </div>
              <div className="bg-[#d9d9d9] h-24 rounded mb-4"></div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-1 h-12 bg-[#65ddfe] rounded-full shadow-lg shadow-[#65ddfe]/50"></div>
                  <div className="w-1 h-12 bg-[#e2af00] rounded-full absolute top-0 left-4 shadow-lg shadow-[#e2af00]/50"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <p className="text-white text-lg">Félicitations ! Vous avez terminé votre parcours dans The Stars.</p>
          <p className="text-[#e2af00]">
            Mode: {gameState.gameMode} | Personnage: {gameState.selectedCharacter}
          </p>

          <button
            onClick={handleEndGame}
            className="bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] px-6 py-2 rounded font-bold transition-colors"
          >
            Nouvelle Partie
          </button>
        </div>
      </div>
    </div>
  )
}
