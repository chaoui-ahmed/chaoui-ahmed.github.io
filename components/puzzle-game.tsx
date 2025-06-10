"use client"

import { useState } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"

interface PuzzleGameProps {
  onNavigate: (state: GameState) => void
}

// Système de puzzle avec swipe comme Tinder
class OthelloPuzzle {
  board: number[][]
  size: number
  targetMove: [number, number] | null
  validMoves: [number, number][]
  score: number
  currentLevel: number
  showingSolution: boolean

  constructor(level: number) {
    this.size = 8
    this.targetMove = null
    this.validMoves = []
    this.score = 0
    this.currentLevel = level
    this.showingSolution = false
    this.generateRandomBoard(level)
  }

  generateRandomBoard(level: number) {
    // Initialise un plateau Othello standard
    this.board = Array(this.size)
      .fill(0)
      .map(() => Array(this.size).fill(0))

    // Position initiale standard
    this.board[3][3] = 2 // Blanc
    this.board[3][4] = 1 // Noir
    this.board[4][3] = 1 // Noir
    this.board[4][4] = 2 // Blanc

    // Nombre de coups aléatoires basé sur le niveau
    const numMoves = Math.min(4 + level * 2, 20)
    let currentPlayer = 1 // Commence par noir

    // Joue des coups aléatoires pour créer une position intéressante
    for (let i = 0; i < numMoves; i++) {
      const moves = this.getValidMovesForPlayer(currentPlayer)
      if (moves.length === 0) {
        currentPlayer = currentPlayer === 1 ? 2 : 1
        const newMoves = this.getValidMovesForPlayer(currentPlayer)
        if (newMoves.length === 0) break
        continue
      }

      const randomMove = moves[Math.floor(Math.random() * moves.length)]
      this.makeMove(randomMove[0], randomMove[1], currentPlayer)
      currentPlayer = currentPlayer === 1 ? 2 : 1
    }

    // Génère les coups valides pour le joueur noir (joueur humain)
    this.validMoves = this.getValidMovesForPlayer(1)

    // Calcule le meilleur coup selon l'IA
    this.targetMove = this.calculateBestMove()
    this.showingSolution = false
  }

  getValidMovesForPlayer(player: number): [number, number][] {
    const moves: [number, number][] = []

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.isValidMove(row, col, player)) {
          moves.push([row, col])
        }
      }
    }

    return moves
  }

  isValidMove(row: number, col: number, player: number): boolean {
    if (this.board[row][col] !== 0) return false

    const opponent = player === 1 ? 2 : 1
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    for (const [dr, dc] of directions) {
      let r = row + dr
      let c = col + dc
      let foundOpponent = false

      while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === opponent) {
        foundOpponent = true
        r += dr
        c += dc
      }

      if (foundOpponent && r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
        return true
      }
    }

    return false
  }

  makeMove(row: number, col: number, player: number): boolean {
    if (!this.isValidMove(row, col, player)) return false

    this.board[row][col] = player
    const opponent = player === 1 ? 2 : 1
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    for (const [dr, dc] of directions) {
      const toFlip: [number, number][] = []
      let r = row + dr
      let c = col + dc

      while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === opponent) {
        toFlip.push([r, c])
        r += dr
        c += dc
      }

      if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
        for (const [fr, fc] of toFlip) {
          this.board[fr][fc] = player
        }
      }
    }

    return true
  }

  calculateBestMove(): [number, number] | null {
    if (this.validMoves.length === 0) return null

    // IA simplifiée : priorité aux coins, puis maximum de pièces capturées
    let bestMove = this.validMoves[0]
    let bestScore = -1

    for (const [row, col] of this.validMoves) {
      let score = this.evaluateMove(row, col, 1)

      // Bonus pour les coins
      if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
        score += 10
      }

      // Bonus pour les bords
      if (row === 0 || row === 7 || col === 0 || col === 7) {
        score += 2
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = [row, col]
      }
    }

    return bestMove
  }

  evaluateMove(row: number, col: number, player: number): number {
    const opponent = player === 1 ? 2 : 1
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    let score = 0

    for (const [dr, dc] of directions) {
      let r = row + dr
      let c = col + dc
      let count = 0

      while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === opponent) {
        count++
        r += dr
        c += dc
      }

      if (count > 0 && r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
        score += count
      }
    }

    return score
  }

  checkPlayerMove(row: number, col: number): boolean {
    if (this.targetMove && this.targetMove[0] === row && this.targetMove[1] === col) {
      this.score++
      return true
    }
    return false
  }

  showSolution() {
    this.showingSolution = true
  }

  nextPuzzle() {
    this.generateRandomBoard(this.currentLevel)
  }
}

export function PuzzleGame({ onNavigate }: PuzzleGameProps) {
  const { gameState } = useGame()
  const [puzzle, setPuzzle] = useState<OthelloPuzzle>(new OthelloPuzzle(gameState.puzzleLevel || 1))
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [score, setScore] = useState(0)

  const handleCellClick = (row: number, col: number) => {
    if (isProcessing || puzzle.showingSolution) return

    // Vérifie si c'est un coup valide
    if (!puzzle.validMoves.some(([r, c]) => r === row && c === col)) {
      return
    }

    setIsProcessing(true)
    const isCorrect = puzzle.checkPlayerMove(row, col)

    if (isCorrect) {
      setFeedback("correct")
      setScore((prevScore) => prevScore + 1)

      // Coup correct ! Passe au puzzle suivant après 1.5s
      setTimeout(() => {
        const newPuzzle = new OthelloPuzzle(gameState.puzzleLevel || 1)
        setPuzzle(newPuzzle)
        setFeedback(null)
        setIsProcessing(false)
      }, 1500)
    } else {
      setFeedback("incorrect")
      // Coup incorrect, montre la solution
      puzzle.showSolution()
      setPuzzle({ ...puzzle })

      // Passe au puzzle suivant après 3s
      setTimeout(() => {
        const newPuzzle = new OthelloPuzzle(gameState.puzzleLevel || 1)
        setPuzzle(newPuzzle)
        setFeedback(null)
        setIsProcessing(false)
      }, 3000)
    }
  }

  const handleNextPuzzle = () => {
    const newPuzzle = new OthelloPuzzle(gameState.puzzleLevel || 1)
    setPuzzle(newPuzzle)
    setFeedback(null)
    setIsProcessing(false)
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-6">
        <h1
          className="text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{
            fontFamily: "Orbitron, monospace",
          }}
        >
          JEDI TRAINING
        </h1>
        <p className="text-white text-lg">Level {gameState.puzzleLevel || 1}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="text-center mb-4">
          {feedback === "correct" ? (
            <p className="text-green-400 text-2xl font-bold">✓ EXCELLENT!</p>
          ) : (
            <p className="text-red-400 text-xl font-bold">✗ The correct move is highlighted</p>
          )}
        </div>
      )}

      {/* Othello board with coordinates */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-4 mb-6">
        {/* Top column labels (A-H) */}
        <div className="flex justify-center mb-2">
          <div className="w-12"></div> {/* Space for alignment */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="w-12 h-6 flex items-center justify-center text-yellow-400 font-bold text-sm">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
        </div>

        {/* Board with side row numbers */}
        <div className="flex items-center">
          {/* Left row numbers (1-8) */}
          <div className="flex flex-col mr-2">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="w-6 h-12 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {i + 1}
                </div>
              ))}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-8 gap-1">
            {puzzle.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValidMove = puzzle.validMoves.some(([r, c]) => r === rowIndex && c === colIndex)
                const isTargetMove =
                  puzzle.showingSolution &&
                  puzzle.targetMove &&
                  puzzle.targetMove[0] === rowIndex &&
                  puzzle.targetMove[1] === colIndex

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
  w-12 h-12 flex items-center justify-center cursor-pointer rounded-lg
  ${isValidMove ? "bg-yellow-400/20 border border-yellow-400/50" : "bg-green-800"}
  ${isTargetMove ? "bg-red-500/50 border-2 border-red-400" : ""}
`}
                  >
                    {cell !== 0 && (
                      <div
                        className={`w-5/6 h-5/6 rounded-full border-2 ${
                          cell === 1 ? "bg-blue-600 border-blue-300" : "bg-red-600 border-red-300"
                        }`}
                      />
                    )}
                    {isValidMove && cell === 0 && !puzzle.showingSolution && (
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    )}
                  </div>
                )
              }),
            )}
          </div>

          {/* Right row numbers (1-8) */}
          <div className="flex flex-col ml-2">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="w-6 h-12 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {i + 1}
                </div>
              ))}
          </div>
        </div>

        {/* Bottom column labels (A-H) */}
        <div className="flex justify-center mt-2">
          <div className="w-12"></div> {/* Space for alignment */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="w-12 h-6 flex items-center justify-center text-yellow-400 font-bold text-sm">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-white text-lg mb-2">
          {puzzle.showingSolution
            ? "Study the correct move, then swipe to next puzzle"
            : "Find the best move for the blue pieces"}
        </p>
      </div>

      {/* Score et boutons */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-yellow-400 text-2xl font-bold">{score}</p>
          <p className="text-gray-300 text-sm">Problems Solved</p>
        </div>

        <StarWarsButton onClick={handleNextPuzzle} variant="secondary" disabled={isProcessing}>
          NEXT PUZZLE →
        </StarWarsButton>
      </div>

      {/* Back button */}
      <div className="absolute bottom-8 left-8">
        <StarWarsButton onClick={() => onNavigate("puzzle-levels")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
