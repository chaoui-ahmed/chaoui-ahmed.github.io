"use client"

import { useRouter } from "next/navigation"
import { useGame } from "@/contexts/game-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function PuzzleGamePage() {
  const router = useRouter()
  const { gameState, updateGameState } = useGame()
  const [puzzle, setPuzzle] = useState<number[]>([])
  const [solution, setSolution] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    generatePuzzle()
  }, [gameState.puzzleLevel])

  const generatePuzzle = () => {
    const size = 3 + gameState.puzzleLevel // Taille croissante
    const numbers = Array.from({ length: size * size - 1 }, (_, i) => i + 1)
    numbers.push(0) // Case vide

    // Mélange simple
    const shuffled = [...numbers].sort(() => Math.random() - 0.5)
    setPuzzle(shuffled)
    setSolution(numbers)
    setMoves(0)
    setCompleted(false)
  }

  const handleTileClick = (index: number) => {
    if (completed) return

    const emptyIndex = puzzle.indexOf(0)
    const size = Math.sqrt(puzzle.length)

    // Vérifier si le mouvement est valide
    const canMove =
      (Math.abs(index - emptyIndex) === 1 && Math.floor(index / size) === Math.floor(emptyIndex / size)) ||
      Math.abs(index - emptyIndex) === size

    if (canMove) {
      const newPuzzle = [...puzzle]
      newPuzzle[emptyIndex] = newPuzzle[index]
      newPuzzle[index] = 0
      setPuzzle(newPuzzle)
      setMoves(moves + 1)

      // Vérifier si le puzzle est résolu
      if (JSON.stringify(newPuzzle) === JSON.stringify(solution)) {
        setCompleted(true)
        updateGameState({
          stars: Math.max(gameState.stars, gameState.puzzleLevel),
          powerGauge: Math.min(100, gameState.powerGauge + 25),
        })
      }
    }
  }

  const size = Math.sqrt(puzzle.length)

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-2">Puzzle Niveau {gameState.puzzleLevel}</h2>
          <p className="text-white">Mouvements: {moves}</p>
          {completed && <p className="text-[#e2af00] font-bold">Puzzle Résolu ! 🎉</p>}
        </div>

        <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-80 h-80 mx-auto mb-6">
          <CardContent className="p-4 h-full">
            <div className="grid gap-1 h-full" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
              {puzzle.map((number, index) => (
                <div
                  key={index}
                  className={`border border-[#e2af00] cursor-pointer hover:bg-[#555555] flex items-center justify-center text-white font-bold ${
                    number === 0 ? "bg-[#444444]" : "bg-[#071b3f]"
                  }`}
                  onClick={() => handleTileClick(index)}
                >
                  {number !== 0 && number}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={generatePuzzle}
              className="bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] px-6 py-2 rounded font-bold"
            >
              Nouveau Puzzle
            </Button>

            {completed && (
              <Button
                onClick={() => router.push("/puzzle/levels")}
                className="bg-[#65ddfe] hover:bg-[#55ccee] text-[#071b3f] px-6 py-2 rounded font-bold"
              >
                Niveau Suivant
              </Button>
            )}
          </div>

          <div>
            <button
              onClick={() => router.push("/puzzle/levels")}
              className="text-[#e2af00] hover:text-[#e3b700] underline"
            >
              ← Retour aux niveaux
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
