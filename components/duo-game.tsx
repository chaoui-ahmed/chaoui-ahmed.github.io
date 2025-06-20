"use client"

import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface DuoGameProps {
  onNavigate: (state: GameState) => void
}

interface GameData {
  id: string
  board: number[][]
  currentPlayer: number
  players: { id: string; player: number }[]
  scores: { player1: number; player2: number }
  gameOver: boolean
  winner: number | null
  lastMove: [number, number] | null
}

const EMPTY = 0
const PLAYER1 = 1
const PLAYER2 = 2

export function DuoGame({ onNavigate }: DuoGameProps) {
  const { gameState, resetGame } = useGame()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get the game ID from the lobby code (IP address)
  const gameId = gameState.lobbyCode?.replace(/\./g, "_") || "default"

  useEffect(() => {
    initializeGame()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const initializeGame = async () => {
    try {
      // Try to join existing game first
      const joinResponse = await fetch(`/api/game/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", playerId }),
      })

      let game: GameData

      if (joinResponse.status === 404) {
        // Game doesn't exist, create it
        const createResponse = await fetch(`/api/game/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create" }),
        })

        if (!createResponse.ok) {
          throw new Error("Failed to create game")
        }

        game = await createResponse.json()

        // Join the newly created game
        const rejoinResponse = await fetch(`/api/game/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", playerId }),
        })

        if (!rejoinResponse.ok) {
          throw new Error("Failed to join game")
        }

        game = await rejoinResponse.json()
      } else if (joinResponse.ok) {
        game = await joinResponse.json()
      } else {
        throw new Error("Failed to join game")
      }

      setGameData(game)

      // Find my player number
      const myPlayer = game.players.find((p) => p.id === playerId)
      if (myPlayer) {
        setMyPlayerNumber(myPlayer.player)
      }

      setConnectionStatus("connected")

      // Start polling for game updates
      startPolling()
    } catch (error) {
      console.error("Failed to initialize game:", error)
      setConnectionStatus("error")
      setErrorMessage("Failed to connect to game. Make sure you're on the same network.")
    }
  }

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/game/${gameId}`)
        if (response.ok) {
          const game = await response.json()
          setGameData(game)

          // Update my player number if it changed
          const myPlayer = game.players.find((p) => p.id === playerId)
          if (myPlayer && myPlayerNumber !== myPlayer.player) {
            setMyPlayerNumber(myPlayer.player)
          }
        }
      } catch (error) {
        console.error("Failed to fetch game state:", error)
      }
    }, 1000) // Poll every second
  }

  const handleCellClick = async (row: number, col: number) => {
    if (!gameData || gameData.gameOver || connectionStatus !== "connected") return
    if (myPlayerNumber !== gameData.currentPlayer) return

    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          row,
          col,
          playerId,
        }),
      })

      if (response.ok) {
        const updatedGame = await response.json()
        setGameData(updatedGame)
      } else {
        const error = await response.json()
        console.error("Move failed:", error)
      }
    } catch (error) {
      console.error("Failed to make move:", error)
    }
  }

  const handleRestart = async () => {
    try {
      // Delete old game
      await fetch(`/api/game/${gameId}`, { method: "DELETE" })

      // Reinitialize
      await initializeGame()
    } catch (error) {
      console.error("Failed to restart game:", error)
    }
  }

  const handleEndGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    resetGame()
    onNavigate("main-menu")
  }

  const getValidMoves = (board: number[][], player: number): [number, number][] => {
    const moves: [number, number][] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, row, col, player)) {
          moves.push([row, col])
        }
      }
    }

    return moves
  }

  const isValidMove = (board: number[][], row: number, col: number, player: number): boolean => {
    if (board[row][col] !== EMPTY) return false

    const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1
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

    for (const [dx, dy] of directions) {
      let x = row + dx
      let y = col + dy
      let foundOpponent = false

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === opponent) {
          foundOpponent = true
        } else if (board[x][y] === player && foundOpponent) {
          return true
        } else {
          break
        }
        x += dx
        y += dy
      }
    }

    return false
  }

  if (connectionStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Connection Error</h1>
          <p className="text-white mb-4">{errorMessage}</p>
          <div className="space-y-4">
            <StarWarsButton onClick={initializeGame}>Retry Connection</StarWarsButton>
            <StarWarsButton onClick={handleEndGame} variant="secondary">
              Back to Menu
            </StarWarsButton>
          </div>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Connecting...</h1>
          <p className="text-white">Setting up multiplayer game...</p>
        </div>
      </div>
    )
  }

  const validMoves = myPlayerNumber ? getValidMoves(gameData.board, myPlayerNumber) : []
  const isMyTurn = myPlayerNumber === gameData.currentPlayer
  const waitingForPlayers = gameData.players.length < 2

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h1
          className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{
            fontFamily: "Orbitron, monospace",
          }}
        >
          MULTIPLAYER BATTLE
        </h1>
        <p className="text-lg text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          IP: {gameState.lobbyCode} | Players: {gameData.players.length}/2
        </p>
      </div>

      {waitingForPlayers && (
        <div className="text-center mb-6">
          <p className="text-yellow-400 text-xl font-bold">Waiting for second player...</p>
          <p className="text-gray-300">Share your IP address with a friend!</p>
        </div>
      )}

      {/* Player cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full max-w-2xl">
        {/* Player 1 */}
        <div
          className={`bg-gradient-to-br ${
            gameData.currentPlayer === PLAYER1
              ? "from-blue-900/80 to-blue-700/80 border-blue-500/50"
              : "from-blue-900/40 to-blue-700/40 border-blue-500/20"
          } backdrop-blur-sm rounded-xl p-3 border`}
        >
          <div className="text-center">
            <h3 className="text-yellow-400 text-lg font-bold mb-2" style={{ fontFamily: "Orbitron, monospace" }}>
              PLAYER 1 {myPlayerNumber === PLAYER1 && "(YOU)"} {gameData.currentPlayer === PLAYER1 && "(TURN)"}
            </h3>
            <div className="relative w-12 h-12 mx-auto mb-2">
              <Image src="/images/luke.png" alt="Luke Skywalker" fill className="object-contain" sizes="48px" />
            </div>
            <p className="text-white text-lg font-bold">Score: {gameData.scores.player1}</p>
          </div>
        </div>

        {/* Player 2 */}
        <div
          className={`bg-gradient-to-br ${
            gameData.currentPlayer === PLAYER2
              ? "from-red-900/80 to-red-700/80 border-red-500/50"
              : "from-red-900/40 to-red-700/40 border-red-500/20"
          } backdrop-blur-sm rounded-xl p-3 border`}
        >
          <div className="text-center">
            <h3 className="text-yellow-400 text-lg font-bold mb-2" style={{ fontFamily: "Orbitron, monospace" }}>
              PLAYER 2 {myPlayerNumber === PLAYER2 && "(YOU)"} {gameData.currentPlayer === PLAYER2 && "(TURN)"}
            </h3>
            <div className="relative w-12 h-12 mx-auto mb-2">
              <Image src="/images/vader.png" alt="Darth Vader" fill className="object-contain" sizes="48px" />
            </div>
            <p className="text-white text-lg font-bold">Score: {gameData.scores.player2}</p>
          </div>
        </div>
      </div>

      {/* Game board with coordinates */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-2 md:p-4 w-full max-w-md mb-4">
        {/* Top column labels (A-H) */}
        <div className="flex justify-center mb-2">
          <div className="w-8"></div> {/* Space for alignment */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex-1 h-6 flex items-center justify-center text-yellow-400 font-bold text-xs">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          <div className="w-8"></div> {/* Space for alignment */}
        </div>

        {/* Board with side row numbers */}
        <div className="flex items-center">
          {/* Left row numbers (1-8) */}
          <div className="flex flex-col w-8">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="h-8 flex items-center justify-center text-yellow-400 font-bold text-xs">
                  {i + 1}
                </div>
              ))}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-8 gap-1 flex-1 aspect-square">
            {gameData.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValidMove = isMyTurn && validMoves.some(([r, c]) => r === rowIndex && c === colIndex)
                const isLastMove =
                  gameData.lastMove && gameData.lastMove[0] === rowIndex && gameData.lastMove[1] === colIndex

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`aspect-square border border-yellow-400/30 flex items-center justify-center cursor-pointer rounded relative
                      ${isValidMove ? "bg-yellow-400/20" : "bg-gray-700/50"}
                      ${isLastMove ? "ring-2 ring-yellow-400" : ""}
                      ${!waitingForPlayers && isValidMove ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    {cell !== EMPTY && (
                      <div
                        className={`w-4/5 h-4/5 rounded-full border-2 ${
                          cell === PLAYER1 ? "bg-blue-800 border-blue-400" : "bg-red-800 border-red-400"
                        }`}
                      />
                    )}
                    {isValidMove && <div className="absolute w-2 h-2 rounded-full bg-yellow-400"></div>}
                  </div>
                )
              }),
            )}
          </div>

          {/* Right row numbers (1-8) */}
          <div className="flex flex-col w-8">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="h-8 flex items-center justify-center text-yellow-400 font-bold text-xs">
                  {i + 1}
                </div>
              ))}
          </div>
        </div>

        {/* Bottom column labels (A-H) */}
        <div className="flex justify-center mt-2">
          <div className="w-8"></div> {/* Space for alignment */}
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="flex-1 h-6 flex items-center justify-center text-yellow-400 font-bold text-xs">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          <div className="w-8"></div> {/* Space for alignment */}
        </div>

        {/* Game status */}
        <div className="text-center mt-3">
          {gameData.gameOver ? (
            <p className="text-yellow-400 text-lg font-bold">
              {gameData.winner === PLAYER1
                ? "Player 1 Wins!"
                : gameData.winner === PLAYER2
                  ? "Player 2 Wins!"
                  : "It's a Tie!"}
            </p>
          ) : waitingForPlayers ? (
            <p className="text-white text-sm">Waiting for second player...</p>
          ) : (
            <p className="text-white text-sm">{isMyTurn ? "Your turn" : "Opponent's turn"}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {gameData.gameOver && (
          <StarWarsButton onClick={handleRestart} size="sm">
            New Game
          </StarWarsButton>
        )}
        <StarWarsButton onClick={handleEndGame} size="sm" variant="secondary">
          Return to Menu
        </StarWarsButton>
      </div>

      {/* Back button */}
      <div className="absolute bottom-4 left-4">
        <StarWarsButton onClick={() => onNavigate("duo-lobby")} variant="secondary" size="sm">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
