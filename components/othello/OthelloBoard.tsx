"use client"

import { useState, useEffect } from "react"
import { useGame } from "@/contexts/game-context"
import { type Player, type GameBoard, getValidMoves, makeMove, calculateWinner } from "./othelloLogic"
import VoiceRecognition from "@/components/voice-recognition"

interface OthelloBoardProps {
  initialBoard?: GameBoard
  onGameEnd?: (winner: Player | "DRAW") => void
  aiMode?: boolean
  aiPlayer?: Player
  aiDifficulty?: "padawan" | "knight" | "master"
}

export default function OthelloBoard({
  initialBoard,
  onGameEnd,
  aiMode = false,
  aiPlayer = "LIGHT",
  aiDifficulty = "padawan",
}: OthelloBoardProps) {
  const { gameState } = useGame()
  const [board, setBoard] = useState<GameBoard>(
    initialBoard ||
      Array(8)
        .fill(null)
        .map(() => Array(8).fill("EMPTY")),
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>("DARK")
  const [validMoves, setValidMoves] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "finished">("playing")
  const [winner, setWinner] = useState<Player | "DRAW" | null>(null)
  const [darkCount, setDarkCount] = useState(2)
  const [lightCount, setLightCount] = useState(2)
  const [lastMove, setLastMove] = useState<string | null>(null)

  // Initialize the board
  useEffect(() => {
    const newBoard: GameBoard = initialBoard || [
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "LIGHT", "DARK", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "DARK", "LIGHT", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
    ]
    setBoard(newBoard)
    updateValidMoves(newBoard, "DARK")
    updateCounts(newBoard)
  }, [initialBoard])

  // AI move effect
  useEffect(() => {
    if (aiMode && currentPlayer === aiPlayer && gameStatus === "playing") {
      const timer = setTimeout(() => {
        makeAIMove()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [aiMode, currentPlayer, gameStatus, aiPlayer])

  // Update game status effect
  useEffect(() => {
    const result = calculateWinner(board)
    setDarkCount(result.darkCount)
    setLightCount(result.lightCount)

    if (result.winner) {
      setGameStatus("finished")
      setWinner(result.winner)
      if (onGameEnd) {
        onGameEnd(result.winner)
      }
    } else if (validMoves.length === 0) {
      // No valid moves for current player, switch players
      const nextPlayer = currentPlayer === "DARK" ? "LIGHT" : "DARK"
      const nextValidMoves = getValidMoves(board, nextPlayer)

      if (nextValidMoves.length === 0) {
        // No valid moves for either player, game is over
        const finalResult = calculateWinner(board)
        setGameStatus("finished")
        setWinner(finalResult.winner)
        if (onGameEnd) {
          onGameEnd(finalResult.winner)
        }
      } else {
        setCurrentPlayer(nextPlayer)
        setValidMoves(nextValidMoves)
      }
    }
  }, [board, validMoves, currentPlayer, onGameEnd])

  const updateValidMoves = (currentBoard: GameBoard, player: Player) => {
    const moves = getValidMoves(currentBoard, player)
    setValidMoves(moves)
  }

  const updateCounts = (currentBoard: GameBoard) => {
    let dark = 0
    let light = 0
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (currentBoard[i][j] === "DARK") dark++
        else if (currentBoard[i][j] === "LIGHT") light++
      }
    }
    setDarkCount(dark)
    setLightCount(light)
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus === "finished") return
    if (aiMode && currentPlayer === aiPlayer) return

    const colLetter = String.fromCharCode(65 + col)
    const moveStr = `${colLetter}${row + 1}`

    if (!validMoves.includes(moveStr)) return

    const newBoard = makeMove(board, moveStr, currentPlayer)
    setBoard(newBoard)
    setLastMove(moveStr)

    const nextPlayer = currentPlayer === "DARK" ? "LIGHT" : "DARK"
    setCurrentPlayer(nextPlayer)
    updateValidMoves(newBoard, nextPlayer)
    updateCounts(newBoard)
  }

  const makeAIMove = () => {
    if (validMoves.length === 0) return

    let selectedMove: string

    if (aiDifficulty === "padawan") {
      // Random move
      selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    } else if (aiDifficulty === "knight") {
      // Simple heuristic - pick move that flips the most pieces
      let bestScore = -1
      let bestMove = validMoves[0]

      for (const move of validMoves) {
        const testBoard = makeMove(board, move, currentPlayer)
        let score = 0
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (testBoard[i][j] === currentPlayer && board[i][j] !== currentPlayer) {
              score++
            }
          }
        }
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }
      selectedMove = bestMove
    } else {
      // Master - prioritize corners and edges
      const cornerMoves = validMoves.filter((move) => {
        const [col, row] = [move.charCodeAt(0) - 65, Number.parseInt(move.substring(1)) - 1]
        return (row === 0 || row === 7) && (col === 0 || col === 7)
      })

      if (cornerMoves.length > 0) {
        selectedMove = cornerMoves[Math.floor(Math.random() * cornerMoves.length)]
      } else {
        const edgeMoves = validMoves.filter((move) => {
          const [col, row] = [move.charCodeAt(0) - 65, Number.parseInt(move.substring(1)) - 1]
          return row === 0 || row === 7 || col === 0 || col === 7
        })

        if (edgeMoves.length > 0) {
          selectedMove = edgeMoves[Math.floor(Math.random() * edgeMoves.length)]
        } else {
          selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      }
    }

    const newBoard = makeMove(board, selectedMove, currentPlayer)
    setBoard(newBoard)
    setLastMove(selectedMove)

    const nextPlayer = currentPlayer === "DARK" ? "LIGHT" : "DARK"
    setCurrentPlayer(nextPlayer)
    updateValidMoves(newBoard, nextPlayer)
    updateCounts(newBoard)
  }

  const getCellColor = (row: number, col: number) => {
    // Alternating pattern for the board
    return (row + col) % 2 === 0 ? "bg-green-800" : "bg-green-900"
  }

  const isValidMoveCell = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col)
    const moveStr = `${colLetter}${row + 1}`
    return validMoves.includes(moveStr)
  }

  const isLastMoveCell = (row: number, col: number) => {
    if (!lastMove) return false
    const colLetter = String.fromCharCode(65 + col)
    const moveStr = `${colLetter}${row + 1}`
    return moveStr === lastMove
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Score section - garder tel quel */}
      <div className="flex justify-between w-full max-w-md mb-4">
        <div
          className={`flex items-center space-x-2 p-3 rounded-md ${currentPlayer === "DARK" ? "bg-red-900/20 ring-1 ring-red-500" : ""}`}
        >
          <div className="w-6 h-6 rounded-full bg-red-600 shadow-lg shadow-red-500/50"></div>
          <span className="font-bold text-red-500">{darkCount}</span>
        </div>
        <div className="text-center">
          {gameStatus === "playing" ? (
            <span className="text-yellow-400 font-bold">
              {currentPlayer === "DARK" ? "Sith's Turn" : "Jedi's Turn"}
            </span>
          ) : (
            <span className="text-yellow-400 font-bold">
              {winner === "DARK" ? "Sith Wins!" : winner === "LIGHT" ? "Jedi Wins!" : "Draw!"}
            </span>
          )}
        </div>
        <div
          className={`flex items-center space-x-2 p-3 rounded-md ${currentPlayer === "LIGHT" ? "bg-blue-900/20 ring-1 ring-blue-500" : ""}`}
        >
          <div className="w-6 h-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
          <span className="font-bold text-blue-500">{lightCount}</span>
        </div>
      </div>

      {/* Board with coordinates */}
      <div className="flex flex-col items-center space-y-4">
        {/* Top column labels (A-H) */}
        <div className="flex items-center">
          <div className="w-16"></div> {/* Espace pour aligner */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="w-12 h-10 flex items-center justify-center text-yellow-400 font-bold text-3xl bg-black/30 rounded-md mx-0.5"
                style={{ textShadow: "0 0 10px #fbbf24" }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          <div className="w-16"></div> {/* Espace pour aligner */}
        </div>

        {/* Board with side row numbers */}
        <div className="flex items-center space-x-4">
          {/* Left row numbers (1-8) */}
          <div className="flex flex-col space-y-0.5">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-12 flex items-center justify-center text-yellow-400 font-bold text-3xl bg-black/30 rounded-md"
                  style={{ textShadow: "0 0 10px #fbbf24" }}
                >
                  {i + 1}
                </div>
              ))}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-8 gap-0.5 border-2 border-yellow-600 p-1 bg-yellow-900/20">
            {Array(8)
              .fill(null)
              .map((_, row) =>
                Array(8)
                  .fill(null)
                  .map((_, col) => (
                    <div
                      key={`${row}-${col}`}
                      className={`w-12 h-12 flex items-center justify-center relative cursor-pointer hover:bg-yellow-500/10 transition-colors ${getCellColor(row, col)}`}
                      onClick={() => handleCellClick(row, col)}
                      title={`${String.fromCharCode(65 + col)}${row + 1}`}
                    >
                      {board[row][col] !== "EMPTY" && (
                        <div
                          className={`w-10 h-10 rounded-full ${
                            board[row][col] === "DARK"
                              ? "bg-red-600 shadow-lg shadow-red-500/50"
                              : "bg-blue-500 shadow-lg shadow-blue-500/50"
                          }`}
                        />
                      )}
                      {isValidMoveCell(row, col) && (
                        <div className="absolute w-8 h-8 rounded-full border-2 border-yellow-400 opacity-70" />
                      )}
                      {isLastMoveCell(row, col) && <div className="absolute w-3 h-3 rounded-full bg-yellow-400" />}
                    </div>
                  )),
              )}
          </div>

          {/* Right row numbers (1-8) */}
          <div className="flex flex-col space-y-0.5">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-12 flex items-center justify-center text-yellow-400 font-bold text-3xl bg-black/30 rounded-md"
                  style={{ textShadow: "0 0 10px #fbbf24" }}
                >
                  {i + 1}
                </div>
              ))}
          </div>
        </div>

        {/* Bottom column labels (A-H) */}
        <div className="flex items-center">
          <div className="w-16"></div> {/* Espace pour aligner */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="w-12 h-10 flex items-center justify-center text-yellow-400 font-bold text-3xl bg-black/30 rounded-md mx-0.5"
                style={{ textShadow: "0 0 10px #fbbf24" }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          <div className="w-16"></div> {/* Espace pour aligner */}
        </div>
      </div>

      {/* Voice command instructions - garder tel quel */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-yellow-600/30">
        <h3 className="text-yellow-400 font-bold mb-2 text-center">🎤 Commandes Vocales</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p>
            • Dites la case pour jouer : <span className="text-yellow-400">"A1", "B3", "E4"</span>
          </p>
          <p>
            • Exemple : <span className="text-yellow-400">"Charlie 5"</span> pour C5
          </p>
          <p>
            • Ou : <span className="text-yellow-400">"A comme Alpha, 3"</span>
          </p>
        </div>
      </div>

      {/* Voice Recognition Component - garder tel quel */}
      <VoiceRecognition
        onMoveDetected={(move) => {
          const [col, row] = [move.charCodeAt(0) - 65, Number.parseInt(move.substring(1)) - 1]
          handleCellClick(row, col)
        }}
        validMoves={validMoves}
        isListening={gameStatus === "playing" && (!aiMode || currentPlayer !== aiPlayer)}
      />
    </div>
  )
}
