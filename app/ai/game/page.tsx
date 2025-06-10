"use client"

import { useRouter } from "next/navigation"
import { useGame } from "@/contexts/game-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AIGamePage() {
  const router = useRouter()
  const { gameState } = useGame()
  const [board, setBoard] = useState(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
  )
  const [currentPlayer, setCurrentPlayer] = useState<"player" | "ai">("player")

  // Initialisation du plateau d'Othello
  const initializeBoard = () => {
    const newBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))
    newBoard[3][3] = "white"
    newBoard[3][4] = "black"
    newBoard[4][3] = "black"
    newBoard[4][4] = "white"
    setBoard(newBoard)
  }

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] || currentPlayer !== "player") return

    // Logique simplifiée d'Othello
    const newBoard = [...board]
    newBoard[row][col] = "black" // Joueur = noir
    setBoard(newBoard)
    setCurrentPlayer("ai")

    // Simulation du tour de l'IA
    setTimeout(() => {
      aiMove(newBoard)
    }, 1000)
  }

  const aiMove = (currentBoard: any[][]) => {
    // IA simple : trouve une case vide et joue
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!currentBoard[i][j]) {
          const newBoard = [...currentBoard]
          newBoard[i][j] = "white" // IA = blanc
          setBoard(newBoard)
          setCurrentPlayer("player")
          return
        }
      }
    }
  }

  const getDifficultyName = () => {
    switch (gameState.aiDifficulty) {
      case 1:
        return "Padawan"
      case 2:
        return "Chevalier Jedi"
      case 3:
        return "Maître Jedi"
      default:
        return "Inconnu"
    }
  }

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-2">Othello - Mode IA</h2>
          <p className="text-white">Difficulté: {getDifficultyName()}</p>
          <p className="text-white">Personnage: {gameState.selectedCharacter}</p>
          <p className="text-[#e2af00]">Tour: {currentPlayer === "player" ? "Votre tour" : "Tour de l'IA"}</p>
        </div>

        <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-96 h-96 mx-auto mb-6">
          <CardContent className="p-4 h-full">
            <div className="grid grid-cols-8 gap-1 h-full">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="bg-[#444444] border border-[#e2af00] cursor-pointer hover:bg-[#555555] flex items-center justify-center"
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && <div className={`w-6 h-6 rounded-full ${cell === "black" ? "bg-black" : "bg-white"}`} />}
                  </div>
                )),
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            onClick={initializeBoard}
            className="bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] px-6 py-2 rounded font-bold"
          >
            Nouvelle Partie
          </Button>

          <div>
            <button
              onClick={() => router.push("/ai/difficulty")}
              className="text-[#e2af00] hover:text-[#e3b700] underline"
            >
              ← Changer la difficulté
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
