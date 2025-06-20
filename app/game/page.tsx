"use client"

import { useGameContext } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

export default function GamePage() {
  const { gameState, makeMove, selectedCharacter } = useGameContext()
  const [selectedMove, setSelectedMove] = useState<string | null>(null)

  const handleCellClick = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col)
    const move = `${colLetter}${row + 1}`

    if (gameState.validMoves.includes(move)) {
      makeMove(move)
    }
  }

  const getCellContent = (row: number, col: number) => {
    const piece = gameState.board[row][col]
    if (piece === "EMPTY") return null

    return (
      <div
        className={`w-8 h-8 rounded-full border-2 ${
          piece === "DARK"
            ? "bg-red-600 border-red-800 shadow-lg shadow-red-500/50"
            : "bg-blue-400 border-blue-600 shadow-lg shadow-blue-400/50"
        }`}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      </div>
    )
  }

  const isValidMove = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col)
    const move = `${colLetter}${row + 1}`
    return gameState.validMoves.includes(move)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Star Wars Othello</h1>
          <p className="text-blue-300">
            Current Player: {gameState.currentPlayer === "DARK" ? "Sith (Dark)" : "Jedi (Light)"}
          </p>
        </div>

        {/* Game Board */}
        <Card className="bg-gray-800/50 border-yellow-400/30 p-6">
          <div className="grid grid-cols-8 gap-1 bg-gray-700 p-2 rounded-lg">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <button
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  className={`
                    w-12 h-12 bg-gray-600 border border-gray-500 rounded
                    flex items-center justify-center
                    hover:bg-gray-500 transition-colors
                    ${isValidMove(row, col) ? "ring-2 ring-yellow-400 bg-yellow-400/20" : ""}
                  `}
                >
                  {getCellContent(row, col)}
                </button>
              )),
            )}
          </div>
        </Card>

        {/* Game Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="bg-red-900/30 border-red-500/50 p-4">
            <h3 className="text-red-400 font-bold mb-2">Sith Empire</h3>
            <p className="text-white">Pieces: {gameState.board.flat().filter((cell) => cell === "DARK").length}</p>
          </Card>
          <Card className="bg-blue-900/30 border-blue-500/50 p-4">
            <h3 className="text-blue-400 font-bold mb-2">Jedi Order</h3>
            <p className="text-white">Pieces: {gameState.board.flat().filter((cell) => cell === "LIGHT").length}</p>
          </Card>
        </div>

        {/* Valid Moves Display */}
        {gameState.validMoves.length > 0 && (
          <Card className="mt-4 bg-gray-800/50 border-yellow-400/30 p-4">
            <h3 className="text-yellow-400 font-bold mb-2">Available Moves:</h3>
            <div className="flex flex-wrap gap-2">
              {gameState.validMoves.map((move) => (
                <Button
                  key={move}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const col = move.charCodeAt(0) - 65
                    const row = Number.parseInt(move.slice(1)) - 1
                    handleCellClick(row, col)
                  }}
                  className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
                >
                  {move}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
