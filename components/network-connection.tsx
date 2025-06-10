"use client"

import { useState, useEffect } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface NetworkServer {
  ip: string
  port: number
  playersConnected: number
  lastSeen: number
}

interface NetworkConnectionProps {
  onConnect: (gameId: string, isHost: boolean) => void
  onBack: () => void
}

export function NetworkConnection({ onConnect, onBack }: NetworkConnectionProps) {
  const [mode, setMode] = useState<"select" | "host" | "join">("select")
  const [hostIP, setHostIP] = useState("")
  const [serverIP, setServerIP] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [availableServers, setAvailableServers] = useState<NetworkServer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [localIP, setLocalIP] = useState("")

  useEffect(() => {
    // Get local IP address
    getLocalIP()

    // Discover available servers
    if (mode === "join") {
      discoverServers()
      const interval = setInterval(discoverServers, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [mode])

  const getLocalIP = async () => {
    try {
      // This is a simplified approach - in a real app you'd need a more robust method
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      setHostIP(data.ip)
    } catch (error) {
      // Fallback to manual input
      setHostIP("192.168.1.100")
    }
  }

  const discoverServers = async () => {
    try {
      const response = await fetch("/api/network/discover")
      const data = await response.json()
      setAvailableServers(data.servers || [])
    } catch (error) {
      console.error("Failed to discover servers:", error)
    }
  }

  const handleCreateServer = async () => {
    if (!hostIP || !playerName) {
      setError("Please enter your IP address and player name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/network/create-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostIP, playerName }),
      })

      const data = await response.json()

      if (data.success) {
        onConnect(data.gameId, true)
      } else {
        setError(data.error || "Failed to create server")
      }
    } catch (error) {
      setError("Failed to create server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinServer = async (ip?: string) => {
    const targetIP = ip || serverIP

    if (!targetIP || !playerName) {
      setError("Please enter server IP and player name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/network/join-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverIP: targetIP, playerName }),
      })

      const data = await response.json()

      if (data.success) {
        onConnect(data.gameId, false)
      } else {
        setError(data.error || "Failed to join server")
      }
    } catch (error) {
      setError("Failed to join server")
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === "select") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
            style={{ textShadow: "0 0 30px #fbbf24", fontFamily: "Orbitron, monospace" }}
          >
            NETWORK GAME
          </h1>
          <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
            Connect with players on your local network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Host Game */}
          <Card className="bg-gradient-to-br from-blue-900/80 to-blue-700/80 border-2 border-yellow-400 rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-400 text-2xl">🖥️</span>
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
                HOST GAME
              </h3>
              <p className="text-gray-300 mb-6">Create a server for other players to join</p>
              <StarWarsButton onClick={() => setMode("host")} className="w-full" size="lg">
                CREATE SERVER
              </StarWarsButton>
            </CardContent>
          </Card>

          {/* Join Game */}
          <Card className="bg-gradient-to-br from-red-900/80 to-red-700/80 border-2 border-yellow-400 rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-400 text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
                JOIN GAME
              </h3>
              <p className="text-gray-300 mb-6">Connect to an existing server</p>
              <StarWarsButton onClick={() => setMode("join")} className="w-full" size="lg" variant="secondary">
                JOIN SERVER
              </StarWarsButton>
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-8 left-8">
          <StarWarsButton onClick={onBack} variant="secondary">
            ← BACK
          </StarWarsButton>
        </div>
      </div>
    )
  }

  if (mode === "host") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
            style={{ textShadow: "0 0 30px #fbbf24", fontFamily: "Orbitron, monospace" }}
          >
            CREATE SERVER
          </h1>
          <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
            Host a game on your local network
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl w-full max-w-md">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <label
                  className="block text-white text-lg font-bold mb-3"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  Your IP Address
                </label>
                <Input
                  value={hostIP}
                  onChange={(e) => setHostIP(e.target.value)}
                  placeholder="192.168.1.100"
                  className="bg-gray-700/50 border-2 border-gray-600 text-white text-lg"
                />
                <p className="text-gray-400 text-sm mt-2">Other players will use this IP to connect</p>
              </div>

              <div>
                <label
                  className="block text-white text-lg font-bold mb-3"
                  style={{ fontFamily: "Orbitron, monospace" }}
                >
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700/50 border-2 border-gray-600 text-white text-lg"
                />
              </div>

              {error && <div className="text-red-400 text-center">{error}</div>}

              <div className="space-y-4">
                <StarWarsButton
                  onClick={handleCreateServer}
                  disabled={isLoading || !hostIP || !playerName}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "CREATING..." : "START SERVER"}
                </StarWarsButton>

                <StarWarsButton onClick={() => setMode("select")} variant="secondary" className="w-full">
                  BACK
                </StarWarsButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative px-8">
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider"
            style={{ textShadow: "0 0 30px #fbbf24", fontFamily: "Orbitron, monospace" }}
          >
            JOIN SERVER
          </h1>
          <p className="text-xl text-gray-300" style={{ fontFamily: "Orbitron, monospace" }}>
            Connect to a game server
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-8">
          {/* Available Servers */}
          {availableServers.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
                  AVAILABLE SERVERS
                </h3>
                <div className="space-y-3">
                  {availableServers.map((server, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white font-bold">{server.ip}</p>
                        <p className="text-gray-400 text-sm">Players: {server.playersConnected}/2 | Port: 4321</p>
                      </div>
                      <StarWarsButton onClick={() => handleJoinServer(server.ip)} disabled={isLoading} size="sm">
                        JOIN
                      </StarWarsButton>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Connection */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-yellow-400 mb-6" style={{ fontFamily: "Orbitron, monospace" }}>
                MANUAL CONNECTION
              </h3>

              <div className="space-y-6">
                <div>
                  <label
                    className="block text-white text-lg font-bold mb-3"
                    style={{ fontFamily: "Orbitron, monospace" }}
                  >
                    Server IP Address
                  </label>
                  <Input
                    value={serverIP}
                    onChange={(e) => setServerIP(e.target.value)}
                    placeholder="192.168.1.100"
                    className="bg-gray-700/50 border-2 border-gray-600 text-white text-lg"
                  />
                </div>

                <div>
                  <label
                    className="block text-white text-lg font-bold mb-3"
                    style={{ fontFamily: "Orbitron, monospace" }}
                  >
                    Your Name
                  </label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-gray-700/50 border-2 border-gray-600 text-white text-lg"
                  />
                </div>

                {error && <div className="text-red-400 text-center">{error}</div>}

                <div className="space-y-4">
                  <StarWarsButton
                    onClick={() => handleJoinServer()}
                    disabled={isLoading || !serverIP || !playerName}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "CONNECTING..." : "CONNECT"}
                  </StarWarsButton>

                  <StarWarsButton onClick={() => setMode("select")} variant="secondary" className="w-full">
                    BACK
                  </StarWarsButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
