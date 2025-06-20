"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Wifi, WifiOff, Play, Trophy, Zap, Server, Users } from "lucide-react"

interface AIBattleProps {
  onBack: () => void
}

interface MoveHistoryEntry {
  move: string
  player: string
  timestamp: number
}

interface BattleStats {
  totalMoves: number
  averageThinkTime: number
  gameStartTime: number
  gameEndTime?: number
  winner?: string
}

export function AIVsAIBattle({ onBack }: AIBattleProps) {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  )
  const [sessionId, setSessionId] = useState<string>("")
  const [role, setRole] = useState<"server" | "client" | null>(null)
  const [playerColor, setPlayerColor] = useState<"B" | "W">("W")

  // Battle configuration
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Hybrid AI")
  const [serverHost, setServerHost] = useState("localhost")
  const [serverPort, setServerPort] = useState("14010")

  // Game state
  const [gameState, setGameState] = useState<"waiting" | "active" | "finished">("waiting")
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([])
  const [battleStats, setBattleStats] = useState<BattleStats>({
    totalMoves: 0,
    averageThinkTime: 0,
    gameStartTime: 0,
  })

  // UI state
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [currentMove, setCurrentMove] = useState<string>("")

  const wsRef = useRef<WebSocket | null>(null)

  const algorithms = ["Greedy Algorithm", "Minimax (Depth 3)", "Minimax (Depth 5)", "Monte Carlo", "Hybrid AI"]

  // Connect to bridge server
  const connectToBridge = () => {
    try {
      setConnectionStatus("connecting")
      addToBattleLog("Connecting to bridge server...")

      // Simulate connection for demo
      setTimeout(() => {
        setConnectionStatus("connected")
        setSessionId("demo_session_123")
        addToBattleLog("Connected to bridge server")
      }, 1000)
    } catch (error) {
      setConnectionStatus("error")
      addToBattleLog(`Connection error: ${error}`)
    }
  }

  const startAsServer = () => {
    setRole("server")
    setPlayerColor("B")
    addToBattleLog("Python AI server started - You are the SERVER (Black pieces)")
    addToBattleLog("Waiting for opponent to connect...")
  }

  const connectToServer = () => {
    setRole("client")
    setPlayerColor("W")
    addToBattleLog("Connected to Python AI server - You are the CLIENT (White pieces)")
  }

  const startBattle = () => {
    if (role === "client") {
      setGameState("active")
      setBattleStats((prev) => ({ ...prev, gameStartTime: Date.now() }))
      addToBattleLog(`🚀 AI BATTLE STARTED! ${selectedAlgorithm} vs Opponent AI`)

      // Simulate some moves for demo
      simulateBattle()
    }
  }

  const simulateBattle = () => {
    const moves = ["E6", "F4", "C3", "C4", "C5", "B3", "C6", "B4"]
    let moveIndex = 0

    const makeMove = () => {
      if (moveIndex < moves.length && gameState === "active") {
        const move = moves[moveIndex]
        const player = moveIndex % 2 === 0 ? "B" : "W"
        const isYourMove = player === playerColor

        setCurrentMove(move)
        setMoveHistory((prev) => [...prev, { move, player, timestamp: Date.now() }])

        const moveText = isYourMove ? `Your AI played: ${move}` : `Opponent played: ${move}`
        addToBattleLog(`${moveText} (${player})`)

        setBattleStats((prev) => ({
          ...prev,
          totalMoves: prev.totalMoves + 1,
        }))

        moveIndex++

        if (moveIndex < moves.length) {
          setTimeout(makeMove, 2000 + Math.random() * 1000)
        } else {
          // End game
          setTimeout(() => {
            const winner = Math.random() > 0.5 ? playerColor : playerColor === "B" ? "W" : "B"
            const didYouWin = winner === playerColor

            setGameState("finished")
            setBattleStats((prev) => ({ ...prev, gameEndTime: Date.now(), winner }))

            let resultMessage = ""
            if (didYouWin) {
              resultMessage = `🏆 VICTORY! Your ${selectedAlgorithm} defeated the opponent!`
            } else {
              resultMessage = `💀 DEFEAT! The opponent's AI was stronger this time.`
            }

            addToBattleLog(resultMessage)
          }, 2000)
        }
      }
    }

    setTimeout(makeMove, 1000)
  }

  const disconnect = () => {
    setConnectionStatus("disconnected")
    setGameState("waiting")
    setRole(null)
    setBattleLog([])
    setMoveHistory([])
    setCurrentMove("")
    setBattleStats({
      totalMoves: 0,
      averageThinkTime: 0,
      gameStartTime: 0,
    })
  }

  const addToBattleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setBattleLog((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const getGameDuration = () => {
    if (battleStats.gameStartTime === 0) return "0s"
    const endTime = battleStats.gameEndTime || Date.now()
    const duration = Math.floor((endTime - battleStats.gameStartTime) / 1000)
    return `${duration}s`
  }

  const getBadgeColor = (condition: boolean) => {
    return condition ? "bg-yellow-400 text-black" : "bg-gray-600 text-white"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-bold text-yellow-400 mb-4 tracking-wider"
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            AI vs AI NETWORK BATTLE
          </h1>
          <p className="text-xl text-white">Watch your AI battle against AIs from other computers!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <Card className="bg-gray-800/50 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                {connectionStatus === "connected" ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                Connection Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus === "disconnected" && (
                <>
                  <div className="space-y-2">
                    <label className="text-yellow-400 text-sm">AI Algorithm</label>
                    <select
                      value={selectedAlgorithm}
                      onChange={(e) => setSelectedAlgorithm(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      {algorithms.map((algo) => (
                        <option key={algo} value={algo}>
                          {algo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={connectToBridge} className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                    Connect to Bridge
                  </Button>
                </>
              )}

              {connectionStatus === "connected" && !role && (
                <div className="space-y-4">
                  <Button
                    onClick={startAsServer}
                    className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Server className="w-4 h-4" />
                    Start as Server
                  </Button>

                  <div className="text-center text-gray-400">OR</div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Server Host"
                      value={serverHost}
                      onChange={(e) => setServerHost(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Port"
                      value={serverPort}
                      onChange={(e) => setServerPort(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <Button
                    onClick={connectToServer}
                    className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Users className="w-4 h-4" />
                    Connect to Server
                  </Button>
                </div>
              )}

              {role === "client" && gameState === "waiting" && (
                <Button onClick={startBattle} className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Play className="w-4 h-4" />
                  Start AI Battle
                </Button>
              )}

              {connectionStatus === "connected" && (
                <Button onClick={disconnect} className="w-full bg-red-600 hover:bg-red-700">
                  Disconnect
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Battle Status */}
          <Card className="bg-gray-800/50 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Battle Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Your Role</div>
                  <div className={`inline-block px-2 py-1 rounded text-sm font-bold ${getBadgeColor(!!role)}`}>
                    {role ? (role === "server" ? "SERVER" : "CLIENT") : "Not Set"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Your Color</div>
                  <div className={`inline-block px-2 py-1 rounded text-sm font-bold ${getBadgeColor(!!role)}`}>
                    {playerColor === "B" ? "BLACK" : "WHITE"}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400">Algorithm</div>
                <div className="text-yellow-400 font-bold">{selectedAlgorithm}</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400">Game State</div>
                <div
                  className={`inline-block px-2 py-1 rounded text-sm font-bold ${getBadgeColor(gameState === "active")}`}
                >
                  {gameState.toUpperCase()}
                </div>
              </div>

              {gameState === "active" && currentMove && (
                <div className="text-center p-3 bg-blue-900/30 rounded">
                  <div className="text-sm text-gray-400">Last Move</div>
                  <div className="text-xl font-bold text-blue-400">{currentMove}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Battle Statistics */}
          <Card className="bg-gray-800/50 border-yellow-400">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Battle Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{battleStats.totalMoves}</div>
                  <div className="text-sm text-gray-400">Total Moves</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{getGameDuration()}</div>
                  <div className="text-sm text-gray-400">Duration</div>
                </div>
              </div>

              {battleStats.winner && (
                <div className="text-center p-3 bg-yellow-900/30 rounded">
                  <div className="text-sm text-gray-400">Winner</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {battleStats.winner === playerColor ? "YOU!" : "OPPONENT"}
                  </div>
                </div>
              )}

              {moveHistory.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Recent Moves</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {moveHistory.slice(-5).map((move, index) => (
                      <div key={index} className="text-xs text-white bg-gray-700/50 rounded px-2 py-1">
                        {move.player}: {move.move}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Battle Log */}
        <Card className="mt-6 bg-gray-800/50 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Battle Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
              {battleLog.length === 0 ? (
                <div className="text-gray-500">No battle activity yet...</div>
              ) : (
                battleLog.map((entry, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            ← Back to Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
