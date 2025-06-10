"use client"

import { useState, useEffect, useRef } from "react"
import { StarWarsButton } from "@/components/star-wars-button"

interface NetworkGameBridgeProps {
  onBack: () => void
}

interface GameState {
  board: string[][]
  currentPlayer: "B" | "W"
  myColor: "B" | "W" | null
  gameStatus: "waiting" | "playing" | "ended"
  winner: string | null
  connected: boolean
}

export function NetworkGameBridge({ onBack }: NetworkGameBridgeProps) {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentPlayer: "B",
    myColor: null,
    gameStatus: "waiting",
    winner: null,
    connected: false,
  })

  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [error, setError] = useState("")
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    connectToBridge()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectToBridge = () => {
    setConnectionStatus("connecting")
    setError("")

    try {
      // Connect to the bridge server
      const ws = new WebSocket("ws://localhost:8080")
      wsRef.current = ws

      ws.onopen = () => {
        console.log("Connected to bridge server")
        setConnectionStatus("connected")

        // Create or join a game
        ws.send(
          JSON.stringify({
            type: "createGame",
            gameId: `web_${Date.now()}`,
          }),
        )
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleBridgeMessage(message)
        } catch (error) {
          console.error("Error parsing bridge message:", error)
        }
      }

      ws.onclose = () => {
        console.log("Disconnected from bridge server")
        setConnectionStatus("disconnected")
        setGameState((prev) => ({ ...prev, connected: false }))
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setError("Failed to connect to game bridge")
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      setError("Failed to connect to bridge server")
      setConnectionStatus("disconnected")
    }
  }

  const handleBridgeMessage = (message: any) => {
    switch (message.type) {
      case "gameCreated":
        setGameState((prev) => ({
          ...prev,
          myColor: message.color,
          board: message.board,
          gameStatus: "waiting",
          connected: true,
        }))
        break

      case "gameStarted":
        setGameState((prev) => ({
          ...prev,
          board: message.board,
          currentPlayer: message.currentPlayer,
          gameStatus: "playing",
        }))
        break

      case "move":
        setGameState((prev) => ({
          ...prev,
          board: message.board,
          currentPlayer: message.currentPlayer,
        }))
        break

      case "moveConfirmed":
        setGameState((prev) => ({
          ...prev,
          board: message.board,
          currentPlayer: message.currentPlayer,
        }))
        break

      case "gameEnd":
        setGameState((prev) => ({
          ...prev,
          gameStatus: "ended",
          winner: message.winner,
        }))
        break

      case "error":
        setError(message.message || "Game error occurred")
        break
    }
  }

  const makeMove = (row: number, col: number) => {
    if (!wsRef.current || gameState.gameStatus !== "playing") return
    if (gameState.currentPlayer !== gameState.myColor) return

    // Convert coordinates to move format (A1, B2, etc.)
    const move = String.fromCharCode(65 + col) + (row + 1)

    wsRef.current.send(
      JSON.stringify({
        type: "move",
        move: move,
        player: gameState.myColor,
      }),
    )
  }

  const getValidMoves = (): [number, number][] => {
    if (!gameState.myColor || gameState.currentPlayer !== gameState.myColor) return []

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

  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Connecting to Bridge...</h1>
          <p className="text-white">Setting up connection with Python clients...</p>
        </div>
      </div>
    )
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Connection Failed</h1>
          <p className="text-white mb-4">{error || "Could not connect to bridge server"}</p>
          <div className="space-y-4">
            <StarWarsButton onClick={connectToBridge}>Retry Connection</StarWarsButton>
            <StarWarsButton onClick={onBack} variant="secondary">
              Back to Menu
            </StarWarsButton>
          </div>
        </div>
      </div>
    )
  }

  if (gameState.gameStatus === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Waiting for Python Player...</h1>
          <p className="text-white mb-4">Run your Python script to connect!</p>
          <p className="text-gray-300 text-sm">
            Your color: {gameState.myColor === "B" ? "Black (Dark Side)" : "White (Light Side)"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h1
          className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{ fontFamily: "Orbitron, monospace" }}
        >
          PYTHON BRIDGE BATTLE
        </h1>
        <p className="text-lg text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
          Connected to Python Client | Your Color: {gameState.myColor === "B" ? "Black" : "White"}
        </p>
      </div>

      {/* Game board */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-2 md:p-4 w-full max-w-md mb-4">
        {/* Game board */}
        <div className="grid grid-cols-8 gap-1 aspect-square">
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isValidMove = isMyTurn && validMoves.some(([r, c]) => r === rowIndex && c === colIndex)

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => makeMove(rowIndex, colIndex)}
                  className={`aspect-square border border-yellow-400/30 flex items-center justify-center cursor-pointer rounded relative
                    ${isValidMove ? "bg-yellow-400/20" : "bg-gray-700/50"}
                    ${isValidMove ? "cursor-pointer" : "cursor-default"}
                  `}
                >
                  {cell !== "." && (
                    <div
                      className={`w-4/5 h-4/5 rounded-full border-2 ${
                        cell === "B" ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"
                      }`}
                    />
                  )}
                  {isValidMove && <div className="absolute w-2 h-2 rounded-full bg-yellow-400"></div>}
                </div>
              )
            }),
          )}
        </div>

        {/* Game status */}
        <div className="text-center mt-3">
          {gameState.gameStatus === "ended" ? (
            <p className="text-yellow-400 text-lg font-bold">
              {gameState.winner === gameState.myColor ? "You Win!" : "Python Player Wins!"}
            </p>
          ) : (
            <p className="text-white text-sm">{isMyTurn ? "Your turn" : "Python player's turn"}</p>
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="absolute bottom-4 left-4">
        <StarWarsButton onClick={onBack} variant="secondary" size="sm">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
