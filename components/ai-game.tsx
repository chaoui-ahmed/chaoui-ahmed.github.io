"use client"

import { useState, useEffect, useRef } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import type { GameState } from "@/app/page"
import { useGame } from "@/contexts/game-context"
import VoiceRecognition from "@/components/voice-recognition"
import { AlertCircle, Wifi, WifiOff, Users, Bot } from "lucide-react"
import { AIBattleController } from "@/components/ai-battle-controller"
import { AIBattleVisualizer } from "@/components/ai-battle-visualizer"

interface AIGameProps {
  onNavigate: (state: GameState) => void
}

// Simple Othello game logic (keeping for local play)
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

  // Convert board to string format for TCP communication
  toBoardString(): string {
    return this.board.map((row) => row.map((cell) => (cell === 0 ? "." : cell === 1 ? "B" : "W")).join("")).join("")
  }

  // Update board from TCP message
  fromBoardString(boardStr: string) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const char = boardStr[i * 8 + j]
        this.board[i][j] = char === "." ? 0 : char === "B" ? 1 : 2
      }
    }
  }
}

export function AIGame({ onNavigate }: AIGameProps) {
  const { gameState } = useGame()
  const [game, setGame] = useState<OthelloGame>(new OthelloGame())
  const [isAIThinking, setIsAIThinking] = useState(false)

  // TCP Connection state
  const [showTcpModal, setShowTcpModal] = useState(false)
  const [tcpStatus, setTcpStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected")
  const [tcpMessage, setTcpMessage] = useState("")
  const [hostAddress, setHostAddress] = useState("localhost")
  const [hostPort, setHostPort] = useState("14010")
  const [networkMode, setNetworkMode] = useState(false)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [myColor, setMyColor] = useState<"B" | "W">("B")
  const [gameLog, setGameLog] = useState<string[]>([])

  // AI vs AI Battle state
  const [aiVsAiMode, setAiVsAiMode] = useState(false)
  const [myAiAlgorithm, setMyAiAlgorithm] = useState("Hybrid AI")
  const [opponentAiAlgorithm, setOpponentAiAlgorithm] = useState("Unknown")
  const [battleStats, setBattleStats] = useState({
    movesPlayed: 0,
    averageThinkTime: 0,
    myAiWins: 0,
    opponentWins: 0,
    draws: 0,
  })
  const [isAiBattleActive, setIsAiBattleActive] = useState(false)
  const [aiThinkingTime, setAiThinkingTime] = useState(0)
  const [showAiModal, setShowAiModal] = useState(false)
  const [moveHistory, setMoveHistory] = useState<
    Array<{
      player: string
      move: string
      timestamp: number
      evaluation?: number
    }>
  >([])

  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket connection to bridge server
  const connectToTcpServer = async () => {
    try {
      setTcpStatus("connecting")
      setTcpMessage("Connecting to bridge server...")

      const ws = new WebSocket("ws://localhost:3001")
      wsRef.current = ws

      ws.onopen = () => {
        setTcpMessage("Connected to bridge server. Connecting to TCP...")
        // Request TCP connection
        ws.send(
          JSON.stringify({
            type: "connect_tcp",
            data: { host: hostAddress, port: Number.parseInt(hostPort) },
          }),
        )
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleTcpMessage(message)
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setTcpStatus("error")
        setTcpMessage("Failed to connect to bridge server")
      }

      ws.onclose = () => {
        setTcpStatus("disconnected")
        setNetworkMode(false)
        setTcpMessage("Connection closed")
      }
    } catch (error) {
      setTcpStatus("error")
      setTcpMessage(`Connection error: ${error}`)
    }
  }

  const handleTcpMessage = (message: any) => {
    console.log("Received TCP message:", message)

    switch (message.type) {
      case "tcp_connected":
        setTcpStatus("connected")
        setTcpMessage("Connected to TCP server! Ready to play.")
        setNetworkMode(true)
        break

      case "tcp_error":
        setTcpStatus("error")
        setTcpMessage(message.message)
        break

      case "tcp_message":
        handleGameMessage(message.data)
        break

      case "tcp_disconnected":
        setTcpStatus("disconnected")
        setNetworkMode(false)
        setTcpMessage("Disconnected from TCP server")
        break
    }
  }

  const handleGameMessage = (data: any) => {
    const logEntry = `${new Date().toLocaleTimeString()}: ${data.message}`
    setGameLog((prev) => [...prev, logEntry])

    switch (data.type) {
      case "game_init":
        setIsMyTurn(true) // Server starts first
        setMyColor("B")
        break

      case "move":
        if (data.move !== "NONE") {
          // Add to move history
          setMoveHistory((prev) => [
            ...prev,
            {
              player: data.player === myColor ? "you" : "opponent",
              move: data.move,
              timestamp: Date.now(),
            },
          ])

          // Parse move and update board
          const col = data.move.charCodeAt(0) - 65
          const row = Number.parseInt(data.move[1]) - 1
          const newGame = new OthelloGame()
          newGame.board = game.board.map((row) => [...row])
          newGame.currentPlayer = data.player === "B" ? 1 : 2
          newGame.makeMove(row, col, data.player === "B" ? 1 : 2)
          setGame(newGame)
        }
        setIsMyTurn(!isMyTurn)
        break

      case "game_end":
        setTcpMessage(`Game Over! Winner: ${data.winner}`)
        setIsMyTurn(false)

        // Update battle stats
        if (aiVsAiMode) {
          setBattleStats((prev) => ({
            ...prev,
            ...(data.winner === myColor
              ? { myAiWins: prev.myAiWins + 1 }
              : data.winner === "NONE"
                ? { draws: prev.draws + 1 }
                : { opponentWins: prev.opponentWins + 1 }),
          }))
        }
        break

      case "illegal_move":
        setTcpMessage("Illegal move detected. Try again.")
        break

      case "timeout":
        setTcpMessage("Move timeout. Game continues...")
        break
    }
  }

  const makeAiMove = async () => {
    if (!networkMode || !isMyTurn || !isAiBattleActive) return

    const startTime = Date.now()
    setAiThinkingTime(startTime)

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Get valid moves for current player
    const validMoves = game.getValidMoves(myColor === "B" ? 1 : 2)

    if (validMoves.length === 0) {
      // No valid moves, send NONE
      if (wsRef.current && tcpStatus === "connected") {
        wsRef.current.send(
          JSON.stringify({
            type: "make_move",
            data: { move: "NONE", player: myColor },
          }),
        )
      }
      return
    }

    // Select move based on AI algorithm
    let selectedMove = validMoves[0] // fallback

    switch (myAiAlgorithm) {
      case "Greedy Algorithm":
        selectedMove = getGreedyMove(validMoves)
        break
      case "Minimax (Depth 3)":
        selectedMove = getMinimaxMove(validMoves, 3)
        break
      case "Minimax (Depth 4)":
        selectedMove = getMinimaxMove(validMoves, 4)
        break
      case "Monte Carlo":
        selectedMove = getMonteCarloMove(validMoves)
        break
      case "Hybrid AI":
        selectedMove = getHybridMove(validMoves)
        break
      default:
        selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    }

    const thinkTime = Date.now() - startTime
    setBattleStats((prev) => ({
      ...prev,
      movesPlayed: prev.movesPlayed + 1,
      averageThinkTime: (prev.averageThinkTime * (prev.movesPlayed - 1) + thinkTime) / prev.movesPlayed,
    }))

    // Send move to TCP server
    const move = String.fromCharCode(65 + selectedMove[1]) + (selectedMove[0] + 1)
    if (wsRef.current && tcpStatus === "connected") {
      wsRef.current.send(
        JSON.stringify({
          type: "make_move",
          data: { move, player: myColor },
        }),
      )
    }

    setIsMyTurn(false)
    setAiThinkingTime(0)
  }

  // AI Algorithm implementations (simplified versions)
  const getGreedyMove = (validMoves: [number, number][]): [number, number] => {
    let bestMove = validMoves[0]
    let bestScore = 0

    for (const move of validMoves) {
      let score = 0
      // Count pieces that would be flipped
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
      const player = myColor === "B" ? 1 : 2
      const opponent = 3 - player

      for (const [dr, dc] of directions) {
        let r = move[0] + dr
        let c = move[1] + dc
        let count = 0

        while (r >= 0 && r < 8 && c >= 0 && c < 8 && game.board[r][c] === opponent) {
          count++
          r += dr
          c += dc
        }

        if (count > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && game.board[r][c] === player) {
          score += count
        }
      }

      // Bonus for corners
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

  const getMinimaxMove = (validMoves: [number, number][], depth: number): [number, number] => {
    // Simplified minimax - just pick corner if available, otherwise greedy
    const corners = validMoves.filter(([r, c]) => (r === 0 || r === 7) && (c === 0 || c === 7))

    if (corners.length > 0) {
      return corners[0]
    }

    return getGreedyMove(validMoves)
  }

  const getMonteCarloMove = (validMoves: [number, number][]): [number, number] => {
    // Simplified Monte Carlo - random with slight preference for edges
    const edges = validMoves.filter(([r, c]) => r === 0 || r === 7 || c === 0 || c === 7)

    if (edges.length > 0 && Math.random() > 0.3) {
      return edges[Math.floor(Math.random() * edges.length)]
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  const getHybridMove = (validMoves: [number, number][]): [number, number] => {
    const totalPieces = game.board.flat().filter((cell) => cell !== 0).length

    if (totalPieces < 20) {
      return getMonteCarloMove(validMoves)
    } else {
      return getMinimaxMove(validMoves, 4)
    }
  }

  const startAiBattle = () => {
    if (tcpStatus === "connected") {
      setAiVsAiMode(true)
      setIsAiBattleActive(true)
      startNetworkGame()
      setTcpMessage(`AI Battle Started! ${myAiAlgorithm} vs Opponent AI`)
    }
  }

  const stopAiBattle = () => {
    setIsAiBattleActive(false)
    setAiVsAiMode(false)
    setTcpMessage("AI Battle stopped")
  }

  // Local game logic (when not in network mode)
  useEffect(() => {
    if (!networkMode && game.currentPlayer === 2 && !game.gameOver) {
      setIsAIThinking(true)
      const timer = setTimeout(() => {
        const validMoves = game.getValidMoves(2)
        if (validMoves.length > 0) {
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
          const newGame = new OthelloGame()
          newGame.board = game.board.map((row) => [...row])
          newGame.currentPlayer = game.currentPlayer
          newGame.makeMove(randomMove[0], randomMove[1], 2)
          setGame(newGame)
        }
        setIsAIThinking(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [game.currentPlayer, game.gameOver, networkMode])

  // AI vs AI automatic moves
  useEffect(() => {
    if (aiVsAiMode && isAiBattleActive && isMyTurn && networkMode && tcpStatus === "connected") {
      const timer = setTimeout(() => {
        makeAiMove()
      }, 500) // Small delay for visual effect
      return () => clearTimeout(timer)
    }
  }, [isMyTurn, aiVsAiMode, isAiBattleActive, networkMode, tcpStatus])

  const handleCellClick = (row: number, col: number) => {
    if (networkMode) {
      if (isMyTurn && tcpStatus === "connected") {
        makeNetworkMove(row, col)
      }
    } else {
      // Local game logic
      if (game.currentPlayer !== 1 || game.gameOver || isAIThinking) return
      if (game.isValidMove(row, col, 1)) {
        const newGame = new OthelloGame()
        newGame.board = game.board.map((row) => [...row])
        newGame.currentPlayer = game.currentPlayer
        newGame.makeMove(row, col, 1)
        setGame(newGame)
      }
    }
  }

  const handleVoiceMove = (move: string) => {
    const col = move.charCodeAt(0) - 65
    const row = Number.parseInt(move[1]) - 1
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      handleCellClick(row, col)
    }
  }

  const resetGame = () => {
    setGame(new OthelloGame())
    setIsAIThinking(false)
    setIsMyTurn(false)
    setGameLog([])
  }

  const validMoves = game.getValidMoves(1)
  const validMovesStrings = validMoves.map(([row, col]) => {
    const colLetter = String.fromCharCode(65 + col)
    const rowNumber = row + 1
    return `${colLetter}${rowNumber}`
  })

  const blackCount = game.board.flat().filter((cell) => cell === 1).length
  const whiteCount = game.board.flat().filter((cell) => cell === 2).length

  const startNetworkGame = () => {
    setNetworkMode(true)
    resetGame()
  }

  const makeNetworkMove = (row: number, col: number) => {
    const move = String.fromCharCode(65 + col) + (row + 1)
    if (wsRef.current && tcpStatus === "connected") {
      wsRef.current.send(
        JSON.stringify({
          type: "make_move",
          data: { move, player: myColor },
        }),
      )
      setIsMyTurn(false)
    }
  }

  const disconnectTcp = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setTcpStatus("disconnected")
      setNetworkMode(false)
      setTcpMessage("Disconnected from TCP server")
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-4">
        <h1
          className="text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{ fontFamily: "Orbitron, monospace" }}
        >
          {networkMode ? "NETWORK BATTLE" : "BATTLE ARENA"}
        </h1>
        <p className="text-white text-lg">
          {networkMode ? (
            <>
              <Users className="inline w-5 h-5 mr-2" />
              Network Game - {isMyTurn ? "Your Turn" : "Opponent's Turn"}
            </>
          ) : (
            <>
              <Bot className="inline w-5 h-5 mr-2" />
              vs Local AI
            </>
          )}
        </p>
        {tcpMessage && <p className="text-yellow-400 text-sm mt-2">{tcpMessage}</p>}
      </div>

      {/* Game board */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl p-4 mb-4">
        {/* Column labels */}
        <div className="flex justify-center mb-2">
          <div className="w-12"></div>
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="w-12 h-6 flex items-center justify-center text-yellow-400 font-bold text-sm">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
        </div>

        <div className="flex items-center">
          {/* Row numbers */}
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
                    (networkMode ? isMyTurn : game.currentPlayer === 1) && game.isValidMove(rowIndex, colIndex, 1)
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
                  {(networkMode ? isMyTurn : game.currentPlayer === 1) &&
                    validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
                      <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-70" />
                    )}
                </div>
              )),
            )}
          </div>

          {/* Row numbers (right) */}
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

        {/* Column labels (bottom) */}
        <div className="flex justify-center mt-2">
          <div className="w-12"></div>
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
      {!networkMode && game.currentPlayer === 1 && !game.gameOver && (
        <VoiceRecognition onMoveDetected={handleVoiceMove} validMoves={validMovesStrings} isListening={!isAIThinking} />
      )}

      {/* Score */}
      <div className="flex gap-12 mb-6">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-2">
            {networkMode ? (myColor === "B" ? "You" : "Opponent") : "You"}
          </div>
          <div className="text-3xl font-bold text-blue-400 bg-blue-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-blue-400">
            {blackCount}
          </div>
        </div>
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-2">
            {networkMode ? (myColor === "W" ? "You" : "Opponent") : "AI"}
          </div>
          <div className="text-3xl font-bold text-red-400 bg-red-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-red-400">
            {whiteCount}
          </div>
        </div>
      </div>

      {/* AI Battle Controller */}
      {tcpStatus === "connected" && (
        <AIBattleController
          isConnected={tcpStatus === "connected"}
          onStartBattle={(algorithm) => {
            setMyAiAlgorithm(algorithm)
            startAiBattle()
          }}
          onStopBattle={stopAiBattle}
          onResetStats={() => {
            setBattleStats({
              movesPlayed: 0,
              averageThinkTime: 0,
              myAiWins: 0,
              opponentWins: 0,
              draws: 0,
            })
            setMoveHistory([])
          }}
          battleStats={battleStats}
          isActive={isAiBattleActive}
          currentAlgorithm={myAiAlgorithm}
          isThinking={aiThinkingTime > 0}
        />
      )}

      {/* AI Battle Visualizer */}
      {aiVsAiMode && (
        <AIBattleVisualizer
          isActive={isAiBattleActive}
          currentPlayer={isMyTurn ? "you" : "opponent"}
          lastMove={moveHistory[moveHistory.length - 1]?.move || null}
          thinkingTime={aiThinkingTime}
          algorithm={myAiAlgorithm}
          moveHistory={moveHistory}
        />
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <StarWarsButton onClick={resetGame} variant="secondary">
          NEW GAME
        </StarWarsButton>

        {tcpStatus !== "connected" ? (
          <StarWarsButton onClick={() => setShowTcpModal(true)} variant="secondary" className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            CONNECT TCP
          </StarWarsButton>
        ) : (
          <div className="flex gap-2">
            {!networkMode && (
              <StarWarsButton onClick={startNetworkGame} variant="primary">
                START NETWORK GAME
              </StarWarsButton>
            )}
            <StarWarsButton onClick={disconnectTcp} variant="destructive" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              DISCONNECT
            </StarWarsButton>
          </div>
        )}
      </div>

      {/* TCP Modal */}
      {showTcpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Connect to TCP Server</h3>

            {tcpStatus === "error" && (
              <div className="bg-red-900/30 border border-red-500 rounded p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <p className="text-red-200 text-sm">{tcpMessage}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Server Address</label>
                <input
                  type="text"
                  value={hostAddress}
                  onChange={(e) => setHostAddress(e.target.value)}
                  disabled={tcpStatus === "connected" || tcpStatus === "connecting"}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Port</label>
                <input
                  type="text"
                  value={hostPort}
                  onChange={(e) => setHostPort(e.target.value)}
                  disabled={tcpStatus === "connected" || tcpStatus === "connecting"}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <StarWarsButton onClick={() => setShowTcpModal(false)} variant="outline" size="sm">
                CLOSE
              </StarWarsButton>

              <StarWarsButton onClick={connectToTcpServer} disabled={tcpStatus === "connecting"} size="sm">
                {tcpStatus === "connecting" ? "CONNECTING..." : "CONNECT"}
              </StarWarsButton>
            </div>

            {tcpStatus === "connecting" && (
              <div className="mt-4 text-center">
                <p className="text-yellow-400 text-sm animate-pulse">{tcpMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Selection Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Configure AI Battle</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-yellow-400 text-sm mb-2">Your AI Algorithm</label>
                <select
                  value={myAiAlgorithm}
                  onChange={(e) => setMyAiAlgorithm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="Greedy Algorithm">Greedy Algorithm</option>
                  <option value="Minimax (Depth 3)">Minimax (Depth 3)</option>
                  <option value="Minimax (Depth 4)">Minimax (Depth 4)</option>
                  <option value="Monte Carlo">Monte Carlo</option>
                  <option value="Hybrid AI">Hybrid AI</option>
                </select>
              </div>

              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-yellow-400 text-sm mb-1">Battle Info:</p>
                <p className="text-white text-xs">• Your AI will play automatically</p>
                <p className="text-white text-xs">• Opponent's AI will respond</p>
                <p className="text-white text-xs">• Watch the battle unfold in real-time</p>
              </div>
            </div>

            <div className="flex justify-between">
              <StarWarsButton onClick={() => setShowAiModal(false)} variant="outline" size="sm">
                CANCEL
              </StarWarsButton>
              <StarWarsButton
                onClick={() => {
                  setShowAiModal(false)
                  startAiBattle()
                }}
                size="sm"
              >
                START BATTLE
              </StarWarsButton>
            </div>
          </div>
        </div>
      )}

      {/* Game Log */}
      {networkMode && gameLog.length > 0 && (
        <div className="absolute right-8 top-8 bg-gray-800/90 border border-yellow-400 rounded p-4 max-w-xs max-h-64 overflow-y-auto">
          <h4 className="text-yellow-400 font-bold mb-2">Game Log</h4>
          {gameLog.slice(-5).map((entry, index) => (
            <p key={index} className="text-white text-xs mb-1">
              {entry}
            </p>
          ))}
        </div>
      )}

      {/* AI Battle Stats */}
      {aiVsAiMode && (
        <div className="absolute left-8 top-8 bg-gray-800/90 border border-yellow-400 rounded p-4 max-w-xs">
          <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Battle Stats
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-white">
              Algorithm: <span className="text-yellow-400">{myAiAlgorithm}</span>
            </p>
            <p className="text-white">
              Moves: <span className="text-blue-400">{battleStats.movesPlayed}</span>
            </p>
            <p className="text-white">
              Avg Think: <span className="text-green-400">{battleStats.averageThinkTime.toFixed(0)}ms</span>
            </p>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <p className="text-green-400">Wins: {battleStats.myAiWins}</p>
              <p className="text-red-400">Losses: {battleStats.opponentWins}</p>
              <p className="text-yellow-400">Draws: {battleStats.draws}</p>
            </div>
            {aiThinkingTime > 0 && <p className="text-yellow-400 animate-pulse">AI Thinking...</p>}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="absolute bottom-8 left-8">
        <StarWarsButton onClick={() => onNavigate("ai-difficulty")} variant="secondary">
          ← BACK
        </StarWarsButton>
      </div>
    </div>
  )
}
