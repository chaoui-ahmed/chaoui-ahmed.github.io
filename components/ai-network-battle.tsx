"use client"

import { useState, useRef } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import { Bot, Users, Wifi, WifiOff, Settings, Trophy, Eye } from "lucide-react"

interface AINetworkBattleProps {
  onNavigate: (state: string) => void
}

interface AIPlayer {
  id: string
  name: string
  algorithm: string
  wins: number
  losses: number
  draws: number
  rating: number
  isOnline: boolean
}

interface BattleRoom {
  id: string
  name: string
  player1: AIPlayer | null
  player2: AIPlayer | null
  status: "waiting" | "active" | "finished"
  spectators: number
}

const AI_ALGORITHMS = [
  { value: "Greedy Algorithm", name: "Greedy AI", description: "Fast aggressive strategy" },
  { value: "Minimax (Depth 3)", name: "Minimax L3", description: "Strategic 3-move lookahead" },
  { value: "Minimax (Depth 4)", name: "Minimax L4", description: "Deep 4-move analysis" },
  { value: "Monte Carlo", name: "Monte Carlo", description: "Probabilistic simulation" },
  { value: "Hybrid AI", name: "Hybrid AI", description: "Adaptive multi-strategy" },
]

export function AINetworkBattle({ onNavigate }: AINetworkBattleProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  )
  const [serverAddress, setServerAddress] = useState("localhost")
  const [serverPort, setServerPort] = useState("14010")

  // AI Configuration
  const [myAI, setMyAI] = useState<AIPlayer>({
    id: "",
    name: "My AI",
    algorithm: "Hybrid AI",
    wins: 0,
    losses: 0,
    draws: 0,
    rating: 1200,
    isOnline: false,
  })

  // Battle state
  const [battleRooms, setBattleRooms] = useState<BattleRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [isSpectating, setIsSpectating] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [onlineAIs, setOnlineAIs] = useState<AIPlayer[]>([])

  // UI state
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  // Connect to network
  const connectToNetwork = async () => {
    try {
      setConnectionStatus("connecting")

      const ws = new WebSocket("ws://localhost:3001")
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus("connected")
        setIsConnected(true)

        // Register AI player
        ws.send(
          JSON.stringify({
            type: "register_ai",
            data: {
              ai: myAI,
              serverAddress,
              serverPort: Number.parseInt(serverPort),
            },
          }),
        )
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleNetworkMessage(message)
      }

      ws.onerror = () => {
        setConnectionStatus("error")
      }

      ws.onclose = () => {
        setConnectionStatus("disconnected")
        setIsConnected(false)
      }
    } catch (error) {
      setConnectionStatus("error")
    }
  }

  const handleNetworkMessage = (message: any) => {
    switch (message.type) {
      case "ai_registered":
        setMyAI((prev) => ({ ...prev, id: message.data.playerId, isOnline: true }))
        addToBattleLog("AI registered successfully")
        break

      case "online_ais_update":
        setOnlineAIs(message.data.ais)
        break

      case "battle_rooms_update":
        setBattleRooms(message.data.rooms)
        break

      case "battle_started":
        setCurrentRoom(message.data.roomId)
        addToBattleLog(`Battle started in room: ${message.data.roomName}`)
        break

      case "battle_move":
        addToBattleLog(`Move: ${message.data.move} by ${message.data.player}`)
        break

      case "battle_finished":
        addToBattleLog(`Battle finished! Winner: ${message.data.winner}`)
        updateAIStats(message.data.winner, message.data.loser)
        setCurrentRoom(null)
        break

      case "spectate_started":
        setIsSpectating(true)
        setCurrentRoom(message.data.roomId)
        addToBattleLog(`Now spectating battle in room: ${message.data.roomName}`)
        break
    }
  }

  const addToBattleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setBattleLog((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const updateAIStats = (winner: string, loser: string) => {
    if (winner === myAI.id) {
      setMyAI((prev) => ({ ...prev, wins: prev.wins + 1, rating: prev.rating + 25 }))
    } else if (loser === myAI.id) {
      setMyAI((prev) => ({ ...prev, losses: prev.losses + 1, rating: Math.max(800, prev.rating - 25) }))
    }
  }

  // Challenge another AI
  const challengeAI = (opponentId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "challenge_ai",
          data: {
            challengerId: myAI.id,
            opponentId: opponentId,
          },
        }),
      )
      addToBattleLog(`Challenge sent to AI: ${opponentId}`)
    }
  }

  // Join as spectator
  const spectateRoom = (roomId: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "spectate_room",
          data: { roomId },
        }),
      )
    }
  }

  // Create AI tournament
  const createTournament = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "create_tournament",
          data: {
            organizerId: myAI.id,
            maxParticipants: 8,
          },
        }),
      )
      addToBattleLog("Tournament created!")
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setIsConnected(false)
    setConnectionStatus("disconnected")
    setCurrentRoom(null)
    setIsSpectating(false)
  }

  const totalGames = myAI.wins + myAI.losses + myAI.draws
  const winRate = totalGames > 0 ? ((myAI.wins / totalGames) * 100).toFixed(1) : "0"

  return (
    <div className="h-screen flex flex-col items-center justify-center relative px-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-6">
        <h1
          className="text-4xl font-bold text-yellow-400 mb-2 tracking-wider"
          style={{ fontFamily: "Orbitron, monospace" }}
        >
          AI NETWORK ARENA
        </h1>
        <p className="text-white text-lg">
          <Bot className="inline w-5 h-5 mr-2" />
          Battle AIs Across the Galaxy
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-lg p-6 mb-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-yellow-400">Network Status</h3>
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            <span className={`text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect to the AI Network to battle other AIs</p>
            <div className="flex gap-4 justify-center">
              <StarWarsButton onClick={() => setShowConnectionModal(true)} variant="primary">
                CONNECT TO NETWORK
              </StarWarsButton>
              <StarWarsButton onClick={() => setShowConfigModal(true)} variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                CONFIGURE AI
              </StarWarsButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* My AI Stats */}
            <div className="bg-blue-900/30 border border-blue-500 rounded p-4">
              <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                My AI: {myAI.name}
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  Algorithm: <span className="text-yellow-400">{myAI.algorithm}</span>
                </p>
                <p className="text-white">
                  Rating: <span className="text-yellow-400">{myAI.rating}</span>
                </p>
                <p className="text-white">
                  Win Rate: <span className="text-green-400">{winRate}%</span>
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">W: {myAI.wins}</span>
                  <span className="text-red-400">L: {myAI.losses}</span>
                  <span className="text-yellow-400">D: {myAI.draws}</span>
                </div>
              </div>
            </div>

            {/* Online AIs */}
            <div className="bg-green-900/30 border border-green-500 rounded p-4">
              <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Online AIs ({onlineAIs.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {onlineAIs.map((ai) => (
                  <div key={ai.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-white">{ai.name}</p>
                      <p className="text-gray-400">{ai.algorithm}</p>
                    </div>
                    <div className="flex gap-1">
                      <StarWarsButton
                        onClick={() => challengeAI(ai.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1"
                      >
                        Challenge
                      </StarWarsButton>
                    </div>
                  </div>
                ))}
                {onlineAIs.length === 0 && <p className="text-gray-400 text-xs">No other AIs online</p>}
              </div>
            </div>

            {/* Battle Rooms */}
            <div className="bg-purple-900/30 border border-purple-500 rounded p-4">
              <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Battle Rooms ({battleRooms.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {battleRooms.map((room) => (
                  <div key={room.id} className="bg-gray-700/50 rounded p-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-white">{room.name}</p>
                        <p className="text-gray-400">
                          {room.player1?.name} vs {room.player2?.name || "Waiting..."}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {room.status === "active" && (
                          <StarWarsButton
                            onClick={() => spectateRoom(room.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1"
                          >
                            <Eye className="w-3 h-3" />
                          </StarWarsButton>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          room.status === "active"
                            ? "bg-green-600"
                            : room.status === "waiting"
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                        }`}
                      >
                        {room.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{room.spectators} watching</span>
                    </div>
                  </div>
                ))}
                {battleRooms.length === 0 && <p className="text-gray-400 text-xs">No active battles</p>}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isConnected && (
          <div className="flex gap-4 justify-center mt-6">
            <StarWarsButton onClick={createTournament} variant="primary">
              <Trophy className="w-4 h-4 mr-2" />
              CREATE TOURNAMENT
            </StarWarsButton>
            <StarWarsButton onClick={() => setShowConfigModal(true)} variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              CONFIGURE AI
            </StarWarsButton>
            <StarWarsButton onClick={disconnect} variant="destructive">
              DISCONNECT
            </StarWarsButton>
          </div>
        )}
      </div>

      {/* Battle Log */}
      {isConnected && battleLog.length > 0 && (
        <div className="bg-gray-800/90 border border-yellow-400 rounded p-4 w-full max-w-4xl max-h-48 overflow-y-auto">
          <h4 className="text-yellow-400 font-bold mb-2">Battle Log</h4>
          {battleLog.slice(-10).map((entry, index) => (
            <p key={index} className="text-white text-sm mb-1 font-mono">
              {entry}
            </p>
          ))}
        </div>
      )}

      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Connect to AI Network</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Server Address</label>
                <input
                  type="text"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-sm mb-1">Port</label>
                <input
                  type="text"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="14010"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <StarWarsButton onClick={() => setShowConnectionModal(false)} variant="outline" size="sm">
                CANCEL
              </StarWarsButton>
              <StarWarsButton
                onClick={() => {
                  setShowConnectionModal(false)
                  connectToNetwork()
                }}
                size="sm"
              >
                CONNECT
              </StarWarsButton>
            </div>
          </div>
        </div>
      )}

      {/* AI Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Configure Your AI</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-yellow-400 text-sm mb-1">AI Name</label>
                <input
                  type="text"
                  value={myAI.name}
                  onChange={(e) => setMyAI((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="My AI"
                />
              </div>

              <div>
                <label className="block text-yellow-400 text-sm mb-2">Algorithm</label>
                <div className="space-y-2">
                  {AI_ALGORITHMS.map((algo) => (
                    <label
                      key={algo.value}
                      className="flex items-start gap-3 p-3 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        name="algorithm"
                        value={algo.value}
                        checked={myAI.algorithm === algo.value}
                        onChange={(e) => setMyAI((prev) => ({ ...prev, algorithm: e.target.value }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-white font-medium">{algo.name}</div>
                        <div className="text-gray-300 text-sm">{algo.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <StarWarsButton onClick={() => setShowConfigModal(false)} variant="outline" size="sm">
                CANCEL
              </StarWarsButton>
              <StarWarsButton onClick={() => setShowConfigModal(false)} size="sm">
                SAVE CONFIG
              </StarWarsButton>
            </div>
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
