"use client"

import { useState, useEffect } from "react"
import { StarWarsButton } from "@/components/star-wars-button"

interface PythonBridgeProps {
  onBack: () => void
}

interface GameState {
  board: string[][]
  currentPlayer: "B" | "W"
  myColor: "B" | "W"
  gameStatus: "waiting" | "playing" | "ended"
  winner: string | null
  pythonConnected: boolean
}

export function PythonBridge({ onBack }: PythonBridgeProps) {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(8).fill(Array(8).fill(".")),
    currentPlayer: "B",
    myColor: "W", // Web client is always white
    gameStatus: "waiting",
    winner: null,
    pythonConnected: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [bridgeUrl, setBridgeUrl] = useState("http://localhost:5000")
  const [isConnected, setIsConnected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  // Connect to Python bridge
  const connectToBridge = async () => {
    try {
      setError(null)

      // Try to connect to the Next.js API route instead
      const response = await fetch("/api/python-bridge/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bridgeUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to connect to Python bridge")
      }

      const data = await response.json()
      setGameState((prev) => ({
        ...prev,
        board: data.board || prev.board,
      }))

      setIsConnected(true)
      setIsPolling(true)
    } catch (err) {
      console.error("Bridge connection error:", err)
      setError(`Connection failed. Please check: 
    1. Python bridge is running (python scripts/network_bridge.py)
    2. Bridge URL is correct: ${bridgeUrl}
    3. No firewall blocking the connection`)
      setIsConnected(false)
    }
  }

  // Poll for game state updates
  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        // Use Next.js API routes
        const statusRes = await fetch("/api/python-bridge/status")
        if (!statusRes.ok) throw new Error("Failed to get status")
        const statusData = await statusRes.json()

        const boardRes = await fetch("/api/python-bridge/board")
        if (!boardRes.ok) throw new Error("Failed to get board")
        const boardData = await boardRes.json()

        setGameState((prev) => ({
          ...prev,
          board: boardData.board || prev.board,
          currentPlayer: boardData.current_player || prev.currentPlayer,
          gameStatus: boardData.game_status || prev.gameStatus,
          pythonConnected: statusData.python_connected || false,
        }))

        if (!statusData.python_connected && gameState.pythonConnected) {
          setError("Python client disconnected")
        }
      } catch (err) {
        console.error("Polling error:", err)
        setError("Lost connection to bridge. Make sure Python bridge is running.")
        setIsPolling(false)
        setIsConnected(false)
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [isPolling, gameState.pythonConnected])

  // Make a move
  const makeMove = async (row: number, col: number) => {
    if (gameState.currentPlayer !== gameState.myColor || !isConnected) return

    const move = `${String.fromCharCode(65 + col)}${row + 1}`

    try {
      const response = await fetch("/api/python-bridge/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          move,
          player: gameState.myColor,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to make move")
      }

      const data = await response.json()
      setGameState((prev) => ({
        ...prev,
        board: data.board || prev.board,
        currentPlayer: data.current_player || prev.currentPlayer,
      }))
    } catch (err) {
      console.error("Move error:", err)
      setError(`Failed to make move: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Get valid moves
  const getValidMoves = (): [number, number][] => {
    if (gameState.currentPlayer !== gameState.myColor) return []

    const moves: [number, number][] = []
    const board = gameState.board
    const color = gameState.myColor
    const opponent = color === "B" ? "W" : "B"

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] !== ".") continue

        // Check if this move would capture opponent pieces
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

        let isValid = false

        for (const [dx, dy] of directions) {
          let x = row + dx
          let y = col + dy
          let foundOpponent = false

          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[x][y] === opponent) {
              foundOpponent = true
            } else if (board[x][y] === color && foundOpponent) {
              isValid = true
              break
            } else {
              break
            }
            x += dx
            y += dy
          }

          if (isValid) break
        }

        if (isValid) {
          moves.push([row, col])
        }
      }
    }

    return moves
  }

  const validMoves = getValidMoves()
  const isMyTurn = gameState.currentPlayer === gameState.myColor

  // Connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Connect to Python Bridge</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4 text-white text-sm">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Bridge URL:</label>
            <input
              type="text"
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
              placeholder="http://localhost:5000"
            />
            <p className="text-xs text-gray-400 mt-1">Make sure to run: python scripts/network_bridge.py</p>
          </div>

          <div className="flex flex-col space-y-3">
            <StarWarsButton onClick={connectToBridge}>Connect to Bridge</StarWarsButton>
            <StarWarsButton onClick={onBack} variant="secondary">
              Back to Menu
            </StarWarsButton>
          </div>
        </div>
      </div>
    )
  }

  // Waiting for Python client
  if (!gameState.pythonConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Waiting for Python Player...</h1>
          <p className="text-white mb-6">Run your Python script to connect!</p>
          <p className="text-gray-400 mb-2">Bridge running at: {bridgeUrl}</p>
          <p className="text-gray-400 mb-6">Python should connect to port 4321</p>

          <div className="flex justify-center">
            <StarWarsButton onClick={onBack} variant="secondary">
              Back to Menu
            </StarWarsButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">PYTHON VS WEB BATTLE</h1>
        <p className="text-lg text-gray-300">{isMyTurn ? "Your Turn (White)" : "Python's Turn (Black)"}</p>
      </div>

      {/* Game board */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 w-full max-w-md mb-4">
        <div className="grid grid-cols-8 gap-1 aspect-square">
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isValidMove = isMyTurn && validMoves.some(([r, c]) => r === rowIndex && c === colIndex)

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => isValidMove && makeMove(rowIndex, colIndex)}
                  className={`aspect-square border border-yellow-400/30 flex items-center justify-center relative
                    ${isValidMove ? "bg-yellow-400/20 cursor-pointer" : "bg-gray-700/50 cursor-default"}
                  `}
                >
                  {/* Coordinates */}
                  <div className="absolute top-0 left-0 text-[8px] text-gray-400 opacity-70 p-0.5">
                    {String.fromCharCode(65 + colIndex)}
                    {rowIndex + 1}
                  </div>

                  {/* Piece */}
                  {cell !== "." && (
                    <div
                      className={`w-4/5 h-4/5 rounded-full border-2 ${
                        cell === "B" ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"
                      }`}
                    />
                  )}

                  {/* Valid move indicator */}
                  {isValidMove && <div className="absolute w-2 h-2 rounded-full bg-yellow-400"></div>}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4 text-white text-sm max-w-md">{error}</div>
      )}

      {/* Back button */}
      <div className="mt-4">
        <StarWarsButton onClick={onBack} variant="secondary">
          Back to Menu
        </StarWarsButton>
      </div>
    </div>
  )
}
