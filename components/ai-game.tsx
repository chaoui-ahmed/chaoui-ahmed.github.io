"use client"

import { useState, useEffect } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import VoiceRecognition from "@/components/voice-recognition"

interface AIGameProps {
  onNavigate: (state: GameState) => void
}

// Simple Othello game logic
class OthelloGame {
  board: number[][]
  currentPlayer: number
  gameOver: boolean
  winner: number | null

  constructor() {
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0))
    this.currentPlayer = 1 // 1 = human (black), 2 = AI (white)
    this.gameOver = false
    this.winner = null
    this.initializeBoard()
  }

  initializeBoard() {
    this.board[3][3] = 2 // White
    this.board[3][4] = 1 // Black
    this.board[4][3] = 1 // Black
    this.board[4][4] = 2 // White
  }

  isValidMove(row: number, col: number, player: number): boolean {
    if (this.board[row][col] !== 0) return false

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
    const opponent = 3 - player

    for (const [dr, dc] of directions) {
      let r = row + dr
      let c = col + dc
      let foundOpponent = false

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (this.board[r][c] === opponent) {
          foundOpponent = true
        } else if (this.board[r][c] === player && foundOpponent) {
          return true
        } else {
          break
        }
        r += dr
        c += dc
      }
    }
    return false
  }

  makeMove(row: number, col: number, player: number): boolean {
    if (!this.isValidMove(row, col, player)) return false

    this.board[row][col] = player
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
    const opponent = 3 - player

    for (const [dr, dc] of directions) {
      let r = row + dr
      let c = col + dc
      const toFlip: [number, number][] = []

      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (this.board[r][c] === opponent) {
          toFlip.push([r, c])
        } else if (this.board[r][c] === player && toFlip.length > 0) {
          toFlip.forEach(([fr, fc]) => {
            this.board[fr][fc] = player
          })
          break
        } else {
          break
        }
        r += dr
        c += dc
      }
    }

    this.currentPlayer = 3 - this.currentPlayer
    this.checkGameOver()
    return true
  }

  getValidMoves(player: number): [number, number][] {
    const moves: [number, number][] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.isValidMove(row, col, player)) {
          moves.push([row, col])
        }
      }
    }
    return moves
  }

  checkGameOver() {
    const player1Moves = this.getValidMoves(1)
    const player2Moves = this.getValidMoves(2)

    if (player1Moves.length === 0 && player2Moves.length === 0) {
      this.gameOver = true
      const player1Count = this.board.flat().filter((cell) => cell === 1).length
      const player2Count = this.board.flat().filter((cell) => cell === 2).length

      if (player1Count > player2Count) this.winner = 1
      else if (player2Count > player1Count) this.winner = 2
      else this.winner = 0 // Tie
    } else if (this.getValidMoves(this.currentPlayer).length === 0) {
      this.currentPlayer = 3 - this.currentPlayer
    }
  }

  getAIMove(difficulty: string): [number, number] | null {
    const validMoves = this.getValidMoves(2)
    if (validMoves.length === 0) return null

    switch (difficulty) {
      case "greedy":
        return this.getGreedyMove(validMoves)
      case "minimax-3":
        return this.getMinimaxMove(validMoves, 3)
      case "minimax-4":
        return this.getMinimaxMove(validMoves, 4)
      case "monte-carlo":
        return this.getMonteCarloMove(validMoves)
      case "hybrid":
        return this.getHybridMove(validMoves)
      default:
        return validMoves[Math.floor(Math.random() * validMoves.length)]
    }
  }

  getGreedyMove(validMoves: [number, number][]): [number, number] {
    let bestMove = validMoves[0]
    let bestScore = 0

    for (const move of validMoves) {
      const tempGame = new OthelloGame()
      tempGame.board = this.board.map((row) => [...row])
      tempGame.makeMove(move[0], move[1], 2)
      let score = tempGame.board.flat().filter((cell) => cell === 2).length

      // Bonus pour les coins
      if ((move[0] === 0 || move[0] === 7) && (move[1] === 0 || move[1] === 7)) {
        score += 10
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  getMinimaxMove(validMoves: [number, number][], depth: number): [number, number] {
    let bestMove = validMoves[0]
    let bestScore = Number.NEGATIVE_INFINITY

    for (const move of validMoves) {
      const tempGame = new OthelloGame()
      tempGame.board = this.board.map((row) => [...row])
      tempGame.makeMove(move[0], move[1], 2)
      const score = this.minimax(tempGame, depth - 1, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  minimax(game: OthelloGame, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    if (depth === 0 || game.gameOver) {
      return this.evaluateBoard(game.board)
    }

    const player = isMaximizing ? 2 : 1
    const moves = game.getValidMoves(player)

    if (moves.length === 0) {
      return this.minimax(game, depth - 1, !isMaximizing, alpha, beta)
    }

    if (isMaximizing) {
      let maxEvaluation = Number.NEGATIVE_INFINITY
      for (const move of moves) {
        const tempGame = new OthelloGame()
        tempGame.board = game.board.map((row) => [...row])
        tempGame.makeMove(move[0], move[1], player)
        const evaluation = this.minimax(tempGame, depth - 1, false, alpha, beta)
        maxEvaluation = Math.max(maxEvaluation, evaluation)
        alpha = Math.max(alpha, evaluation)
        if (beta <= alpha) break
      }
      return maxEvaluation
    } else {
      let minEvaluation = Number.POSITIVE_INFINITY
      for (const move of moves) {
        const tempGame = new OthelloGame()
        tempGame.board = game.board.map((row) => [...row])
        tempGame.makeMove(move[0], move[1], player)
        const evaluation = this.minimax(tempGame, depth - 1, true, alpha, beta)
        minEvaluation = Math.min(minEvaluation, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) break
      }
      return minEvaluation
    }
  }

  getMonteCarloMove(validMoves: [number, number][]): [number, number] {
    let bestMove = validMoves[0]
    let bestScore = Number.NEGATIVE_INFINITY

    for (const move of validMoves) {
      let totalScore = 0
      const simulations = 50

      for (let i = 0; i < simulations; i++) {
        const tempGame = new OthelloGame()
        tempGame.board = this.board.map((row) => [...row])
        tempGame.makeMove(move[0], move[1], 2)

        // Simulation aléatoire jusqu'à la fin
        while (!tempGame.gameOver) {
          const currentMoves = tempGame.getValidMoves(tempGame.currentPlayer)
          if (currentMoves.length === 0) {
            tempGame.currentPlayer = 3 - tempGame.currentPlayer
            const newMoves = tempGame.getValidMoves(tempGame.currentPlayer)
            if (newMoves.length === 0) break
            continue
          }
          const randomMove = currentMoves[Math.floor(Math.random() * currentMoves.length)]
          tempGame.makeMove(randomMove[0], randomMove[1], tempGame.currentPlayer)
        }

        const aiPieces = tempGame.board.flat().filter((cell) => cell === 2).length
        const humanPieces = tempGame.board.flat().filter((cell) => cell === 1).length
        totalScore += aiPieces - humanPieces
      }

      const avgScore = totalScore / simulations
      if (avgScore > bestScore) {
        bestScore = avgScore
        bestMove = move
      }
    }
    return bestMove
  }

  getHybridMove(validMoves: [number, number][]): [number, number] {
    const totalPieces = this.board.flat().filter((cell) => cell !== 0).length

    // Début de partie : Monte Carlo
    if (totalPieces < 20) {
      return this.getMonteCarloMove(validMoves)
    }
    // Fin de partie : Minimax profond
    else {
      return this.getMinimaxMove(validMoves, 4)
    }
  }

  evaluateBoard(board: number[][]): number {
    let score = 0

    // Comptage des pièces
    const aiPieces = board.flat().filter((cell) => cell === 2).length
    const humanPieces = board.flat().filter((cell) => cell === 1).length
    score += (aiPieces - humanPieces) * 1

    // Bonus pour les coins
    const corners = [
      [0, 0],
      [0, 7],
      [7, 0],
      [7, 7],
    ]
    for (const [r, c] of corners) {
      if (board[r][c] === 2) score += 25
      else if (board[r][c] === 1) score -= 25
    }

    // Mobilité
    const aiMoves = this.getValidMoves(2).length
    const humanMoves = this.getValidMoves(1).length
    score += (aiMoves - humanMoves) * 2

    return score
  }
}

export function AIGame({ onNavigate }: AIGameProps) {
  const { gameState } = useGame()
  const [game, setGame] = useState<OthelloGame>(new OthelloGame())
  const [isAIThinking, setIsAIThinking] = useState(false)

  useEffect(() => {
    if (game.currentPlayer === 2 && !game.gameOver) {
      setIsAIThinking(true)
      const timer = setTimeout(() => {
        const aiMove = game.getAIMove(gameState.aiDifficulty || "greedy")
        if (aiMove) {
          const newGame = new OthelloGame()
          newGame.board = game.board.map((row) => [...row])
          newGame.currentPlayer = game.currentPlayer
          newGame.makeMove(aiMove[0], aiMove[1], 2)
          setGame(newGame)
        }
        setIsAIThinking(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [game.currentPlayer, game.gameOver, gameState.aiDifficulty])

  const handleCellClick = (row: number, col: number) => {
    if (game.currentPlayer !== 1 || game.gameOver || isAIThinking) return

    if (game.isValidMove(row, col, 1)) {
      const newGame = new OthelloGame()
      newGame.board = game.board.map((row) => [...row])
      newGame.currentPlayer = game.currentPlayer
      newGame.makeMove(row, col, 1)
      setGame(newGame)
    }
  }

  const handleVoiceMove = (move: string) => {
    // Convertir le coup vocal (ex: "A1") en coordonnées
    const col = move.charCodeAt(0) - 65 // A=0, B=1, etc.
    const row = Number.parseInt(move[1]) - 1 // 1=0, 2=1, etc.

    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      handleCellClick(row, col)
    }
  }

  const resetGame = () => {
    setGame(new OthelloGame())
    setIsAIThinking(false)
  }

  const validMoves = game.getValidMoves(1)
  const validMovesStrings = validMoves.map(([row, col]) => {
    const colLetter = String.fromCharCode(65 + col)
    const rowNumber = row + 1
    return `${colLetter}${rowNumber}`
  })

  const blackCount = game.board.flat().filter((cell) => cell === 1).length
  const whiteCount = game.board.flat().filter((cell) => cell === 2).length

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case "greedy":
        return "Greedy AI"
      case "minimax-3":
        return "Minimax (Depth 3)"
      case "minimax-4":
        return "Minimax (Depth 4)"
      case "monte-carlo":
        return "Monte Carlo"
      case "hybrid":
        return "Hybrid AI"
      default:
        return "AI"
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-4">
        <h1
          className="text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{
            fontFamily: "Orbitron, monospace",
          }}
        >
          BATTLE ARENA
        </h1>
        <p className="text-white text-lg">
          {gameState.selectedCharacter === "jedi" ? "Jedi Master" : "Sith Lord"} vs{" "}
          {getDifficultyName(gameState.aiDifficulty || "greedy")}
        </p>
        <p className="text-yellow-400 text-sm mt-2">
          {isAIThinking ? "AI is thinking..." : game.currentPlayer === 1 ? "Your turn" : "AI turn"}
        </p>
      </div>

      {/* Game board with coordinates */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-4 mb-4">
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
          <div className="grid grid-cols-8 gap-1 w-96 h-96">
            {game.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`w-12 h-12 border border-yellow-400/50 flex items-center justify-center cursor-pointer rounded-lg ${
                    game.currentPlayer === 1 && game.isValidMove(rowIndex, colIndex, 1)
                      ? "bg-yellow-400/20"
                      : "bg-gray-700/50"
                  }`}
                >
                  {cell !== 0 && (
                    <div
                      className={`w-10 h-10 rounded-full border-2 ${
                        cell === 1 ? "bg-blue-600 border-blue-300" : "bg-red-600 border-red-300"
                      }`}
                    />
                  )}
                  {game.currentPlayer === 1 && validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-70" />
                  )}
                </div>
              )),
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

      {/* Voice Recognition */}
      {game.currentPlayer === 1 && !game.gameOver && (
        <VoiceRecognition onMoveDetected={handleVoiceMove} validMoves={validMovesStrings} isListening={!isAIThinking} />
      )}

      {/* Score */}
      <div className="flex gap-12 mb-6">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-2">You</div>
          <div className="text-3xl font-bold text-blue-400 bg-blue-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-blue-400">
            {blackCount}
          </div>
        </div>
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-2">AI</div>
          <div className="text-3xl font-bold text-red-400 bg-red-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-red-400">
            {whiteCount}
          </div>
        </div>
      </div>

      {/* Game over message */}
      {game.gameOver && (
        <div className="text-center mb-6">
          <h2
            className={`text-4xl font-bold mb-4 ${
              game.winner === 1 ? "text-green-400" : game.winner === 2 ? "text-red-400" : "text-yellow-400"
            }`}
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            {game.winner === 1 ? "VICTORY!" : game.winner === 2 ? "DEFEAT" : "TIE"}
          </h2>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <StarWarsButton onClick={resetGame} variant="secondary">
          NEW GAME
        </StarWarsButton>
      </div>

      {/* Back button */}
      <div className="absolute bottom-8 left-8">
        <StarWarsButton onClick={() => onNavigate("ai-difficulty")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
