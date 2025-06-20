"use client"

import { useState, useEffect } from "react"
import OthelloBoard from "@/components/othello/OthelloBoard"
import {
  calculateWinner,
  getValidMoves,
  initializeBoard,
  makeMove as coreMakeMove,
} from "@/components/othello/othelloLogic"

const MultiplayerGame = () => {
  const [board, setBoard] = useState<string[][]>(initializeBoard())
  const [gameState, setGameState] = useState({
    currentPlayer: "DARK" as "DARK" | "LIGHT",
    winner: null as "DARK" | "LIGHT" | null,
    validMoves: getValidMoves(initializeBoard(), "DARK"),
  })
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  // Network communication state
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [gameId, setGameId] = useState<string>("")
  const [playerColor, setPlayerColor] = useState<"DARK" | "LIGHT">("DARK")
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")

  useEffect(() => {
    // Simulate WebSocket connection for multiplayer
    const connectToGame = () => {
      setConnectionStatus("connecting")

      // Simulate connection delay
      setTimeout(() => {
        setConnectionStatus("connected")
        // Set player color based on connection order
        setPlayerColor(Math.random() > 0.5 ? "DARK" : "LIGHT")
      }, 1000)
    }

    connectToGame()
  }, [])

  const updateGameState = (newBoard: string[][], player: "DARK" | "LIGHT") => {
    const nextPlayer = player === "DARK" ? "LIGHT" : "DARK"
    const validMoves = getValidMoves(newBoard, nextPlayer)
    const winner = calculateWinner(newBoard)

    setGameState({
      currentPlayer: nextPlayer,
      winner: winner,
      validMoves: validMoves,
    })
  }

  const makeMove = (move: string) => {
    if (gameState.winner) {
      console.log("Game is over.")
      return false
    }

    const [row, col] = move.split("-").map(Number)

    if (!gameState.validMoves.some((validMove) => validMove.row === row && validMove.col === col)) {
      console.log("Invalid move.")
      return false
    }

    const newBoard = coreMakeMove(board, row, col, gameState.currentPlayer)
    if (newBoard) {
      setBoard(newBoard)
      setMoveHistory([...moveHistory, move])
      updateGameState(newBoard, gameState.currentPlayer)
      return true
    } else {
      return false
    }
  }

  const handleMultiplayerMove = (move: string) => {
    if (gameState.currentPlayer !== playerColor) return

    if (makeMove(move)) {
      // Send move to opponent via WebSocket
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "move",
            move: move,
            player: playerColor,
            gameId: gameId,
          }),
        )
      }
    }
  }

  return (
    <div>
      <h1>Multiplayer Othello</h1>
      <p>Connection Status: {connectionStatus}</p>
      <p>You are playing as: {playerColor}</p>
      <OthelloBoard
        board={board}
        validMoves={gameState.validMoves}
        onMove={handleMultiplayerMove}
        currentPlayer={gameState.currentPlayer}
      />
      {gameState.winner && <p>Winner: {gameState.winner}</p>}
    </div>
  )
}

export default MultiplayerGame
