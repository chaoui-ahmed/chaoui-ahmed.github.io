import { type NextRequest, NextResponse } from "next/server"

// Store active network games
const networkGames = new Map<
  string,
  {
    id: string
    host: string
    port: number
    players: Array<{ id: string; name: string; joined: number }>
    gameState: any
    lastActivity: number
  }
>()

// Clean up old games every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    for (const [gameId, game] of networkGames.entries()) {
      if (now - game.lastActivity > fiveMinutes) {
        networkGames.delete(gameId)
        console.log(`Cleaned up network game: ${gameId}`)
      }
    }
  },
  5 * 60 * 1000,
)

export async function POST(request: NextRequest, { params }: { params: { params: string[] } }) {
  try {
    const [action] = params.params
    const body = await request.json()

    switch (action) {
      case "create-server":
        return handleCreateServer(body)
      case "join-server":
        return handleJoinServer(body)
      case "discover":
        return handleDiscover(body)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Network API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleCreateServer(body: { hostIP: string; playerName: string }) {
  const { hostIP, playerName } = body

  // Create a unique game ID based on IP
  const gameId = hostIP.replace(/\./g, "_")

  const game = {
    id: gameId,
    host: hostIP,
    port: 4321, // Use same port as existing system
    players: [
      {
        id: `host_${Date.now()}`,
        name: playerName,
        joined: Date.now(),
      },
    ],
    gameState: {
      status: "waiting",
      board: null,
      currentPlayer: null,
    },
    lastActivity: Date.now(),
  }

  networkGames.set(gameId, game)

  return NextResponse.json({
    success: true,
    gameId,
    serverInfo: {
      ip: hostIP,
      port: 4321,
      playersConnected: 1,
    },
  })
}

async function handleJoinServer(body: { serverIP: string; playerName: string }) {
  const { serverIP, playerName } = body

  const gameId = serverIP.replace(/\./g, "_")
  const game = networkGames.get(gameId)

  if (!game) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  if (game.players.length >= 2) {
    return NextResponse.json({ error: "Server is full" }, { status: 400 })
  }

  // Add player to game
  game.players.push({
    id: `player_${Date.now()}`,
    name: playerName,
    joined: Date.now(),
  })

  game.lastActivity = Date.now()

  return NextResponse.json({
    success: true,
    gameId,
    serverInfo: {
      ip: serverIP,
      port: 4321,
      playersConnected: game.players.length,
      players: game.players,
    },
  })
}

async function handleDiscover(body: { subnet?: string }) {
  // Return list of available servers on the network
  const availableServers = Array.from(networkGames.values())
    .filter((game) => game.players.length < 2)
    .map((game) => ({
      ip: game.host,
      port: game.port,
      playersConnected: game.players.length,
      lastSeen: game.lastActivity,
    }))

  return NextResponse.json({
    servers: availableServers,
  })
}

export async function GET(request: NextRequest, { params }: { params: { params: string[] } }) {
  const [action] = params.params

  if (action === "discover") {
    return handleDiscover({})
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
