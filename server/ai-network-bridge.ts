import { WebSocketServer } from "ws"
import { createServer } from "http"
import { Socket } from "net"

const HTTP_PORT = 3002 // Different port for AI network
const TCP_HOST = "localhost"
const TCP_PORT = 14010

interface AIPlayer {
  id: string
  name: string
  algorithm: string
  wins: number
  losses: number
  draws: number
  rating: number
  isOnline: boolean
  ws: any
  tcpSocket: Socket | null
}

interface BattleRoom {
  id: string
  name: string
  player1: AIPlayer | null
  player2: AIPlayer | null
  status: "waiting" | "active" | "finished"
  spectators: Set<string>
  gameState: any
}

interface Tournament {
  id: string
  name: string
  participants: AIPlayer[]
  brackets: BattleRoom[]
  status: "registration" | "active" | "finished"
  organizer: string
}

const aiPlayers = new Map<string, AIPlayer>()
const battleRooms = new Map<string, BattleRoom>()
const tournaments = new Map<string, Tournament>()

// Create HTTP server for WebSocket
const server = createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", (ws, req) => {
  console.log("New AI Network connection")

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString())
      await handleAINetworkMessage(ws, message)
    } catch (error) {
      console.error("Error handling AI Network message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      )
    }
  })

  ws.on("close", () => {
    // Remove AI player when disconnected
    for (const [id, player] of aiPlayers.entries()) {
      if (player.ws === ws) {
        aiPlayers.delete(id)
        broadcastOnlineAIs()
        console.log(`AI player ${player.name} disconnected`)
        break
      }
    }
  })
})

async function handleAINetworkMessage(ws: any, message: any) {
  const { type, data } = message

  switch (type) {
    case "register_ai":
      await registerAI(ws, data)
      break

    case "challenge_ai":
      await challengeAI(data.challengerId, data.opponentId)
      break

    case "accept_challenge":
      await acceptChallenge(data.challengeId)
      break

    case "spectate_room":
      await spectateRoom(ws, data.roomId)
      break

    case "create_tournament":
      await createTournament(data.organizerId, data.maxParticipants)
      break

    case "join_tournament":
      await joinTournament(data.tournamentId, data.playerId)
      break
  }
}

async function registerAI(ws: any, data: any) {
  const playerId = generatePlayerId()

  const aiPlayer: AIPlayer = {
    id: playerId,
    name: data.ai.name,
    algorithm: data.ai.algorithm,
    wins: data.ai.wins || 0,
    losses: data.ai.losses || 0,
    draws: data.ai.draws || 0,
    rating: data.ai.rating || 1200,
    isOnline: true,
    ws: ws,
    tcpSocket: null,
  }

  // Connect AI to TCP server
  try {
    const tcpSocket = new Socket()

    tcpSocket.connect(TCP_PORT, TCP_HOST, () => {
      console.log(`AI ${aiPlayer.name} connected to TCP server`)
      aiPlayer.tcpSocket = tcpSocket

      aiPlayers.set(playerId, aiPlayer)

      ws.send(
        JSON.stringify({
          type: "ai_registered",
          data: { playerId: playerId },
        }),
      )

      broadcastOnlineAIs()
    })

    tcpSocket.on("data", (tcpData) => {
      const tcpMessage = tcpData.toString().trim()
      handleTcpMessage(aiPlayer, tcpMessage)
    })

    tcpSocket.on("error", (error) => {
      console.error(`TCP error for AI ${aiPlayer.name}:`, error)
      ws.send(
        JSON.stringify({
          type: "tcp_error",
          message: error.message,
        }),
      )
    })

    tcpSocket.on("close", () => {
      console.log(`TCP connection closed for AI ${aiPlayer.name}`)
      aiPlayer.tcpSocket = null
    })
  } catch (error) {
    console.error("Failed to connect AI to TCP server:", error)
    ws.send(
      JSON.stringify({
        type: "tcp_error",
        message: `Failed to connect: ${error}`,
      }),
    )
  }
}

function handleTcpMessage(aiPlayer: AIPlayer, message: string) {
  const parts = message.split("|")
  const code = parts[0]

  // Find the battle room this AI is in
  const room = findRoomByPlayer(aiPlayer.id)

  if (room) {
    // Broadcast move to spectators and opponent
    broadcastToRoom(room, {
      type: "battle_move",
      data: {
        player: aiPlayer.name,
        move: parts[1] || "NONE",
        message: message,
      },
    })

    // Check for game end
    if (code === "2") {
      const winner = parts[1]
      finishBattle(room, winner, aiPlayer)
    }
  }

  // Send to AI's WebSocket client
  aiPlayer.ws.send(
    JSON.stringify({
      type: "tcp_message",
      data: parseTcpMessage(message),
    }),
  )
}

async function challengeAI(challengerId: string, opponentId: string) {
  const challenger = aiPlayers.get(challengerId)
  const opponent = aiPlayers.get(opponentId)

  if (!challenger || !opponent) {
    return
  }

  // Create battle room
  const roomId = generateRoomId()
  const room: BattleRoom = {
    id: roomId,
    name: `${challenger.name} vs ${opponent.name}`,
    player1: challenger,
    player2: opponent,
    status: "active",
    spectators: new Set(),
    gameState: {},
  }

  battleRooms.set(roomId, room)

  // Start TCP game for both AIs
  if (challenger.tcpSocket && opponent.tcpSocket) {
    // Challenger starts the game
    challenger.tcpSocket.write("0")

    // Notify both players
    challenger.ws.send(
      JSON.stringify({
        type: "battle_started",
        data: { roomId, roomName: room.name, role: "challenger" },
      }),
    )

    opponent.ws.send(
      JSON.stringify({
        type: "battle_started",
        data: { roomId, roomName: room.name, role: "opponent" },
      }),
    )
  }

  broadcastBattleRooms()
}

async function acceptChallenge(challengeId: string) {
  // Implementation for accepting a challenge
  // This function is intentionally left blank as the logic is not provided
}

async function joinTournament(tournamentId: string, playerId: string) {
  // Implementation for joining a tournament
  // This function is intentionally left blank as the logic is not provided
}

async function spectateRoom(ws: any, roomId: string) {
  const room = battleRooms.get(roomId)

  if (room && room.status === "active") {
    // Add to spectators (we'll need to track spectator WebSockets)
    room.spectators.add(ws)

    ws.send(
      JSON.stringify({
        type: "spectate_started",
        data: {
          roomId: roomId,
          roomName: room.name,
          gameState: room.gameState,
        },
      }),
    )

    broadcastBattleRooms()
  }
}

async function createTournament(organizerId: string, maxParticipants: number) {
  const organizer = aiPlayers.get(organizerId)

  if (!organizer) return

  const tournamentId = generateTournamentId()
  const tournament: Tournament = {
    id: tournamentId,
    name: `${organizer.name}'s Tournament`,
    participants: [organizer],
    brackets: [],
    status: "registration",
    organizer: organizerId,
  }

  tournaments.set(tournamentId, tournament)

  // Broadcast tournament creation
  broadcastToAll({
    type: "tournament_created",
    data: tournament,
  })
}

function finishBattle(room: BattleRoom, winner: string, currentPlayer: AIPlayer) {
  room.status = "finished"

  // Update player stats
  if (room.player1 && room.player2) {
    if (winner === "B") {
      // Player 1 (Black) wins
      room.player1.wins++
      room.player1.rating += 25
      room.player2.losses++
      room.player2.rating = Math.max(800, room.player2.rating - 25)
    } else if (winner === "W") {
      // Player 2 (White) wins
      room.player2.wins++
      room.player2.rating += 25
      room.player1.losses++
      room.player1.rating = Math.max(800, room.player1.rating - 25)
    } else {
      // Draw
      room.player1.draws++
      room.player2.draws++
    }
  }

  // Notify all participants and spectators
  broadcastToRoom(room, {
    type: "battle_finished",
    data: {
      winner: winner,
      player1: room.player1?.name,
      player2: room.player2?.name,
      finalStats: {
        player1: { wins: room.player1?.wins, losses: room.player1?.losses, rating: room.player1?.rating },
        player2: { wins: room.player2?.wins, losses: room.player2?.losses, rating: room.player2?.rating },
      },
    },
  })

  // Clean up room after delay
  setTimeout(() => {
    battleRooms.delete(room.id)
    broadcastBattleRooms()
  }, 10000)
}

function findRoomByPlayer(playerId: string): BattleRoom | null {
  for (const room of battleRooms.values()) {
    if (room.player1?.id === playerId || room.player2?.id === playerId) {
      return room
    }
  }
  return null
}

function broadcastToRoom(room: BattleRoom, message: any) {
  // Send to both players
  if (room.player1?.ws) {
    room.player1.ws.send(JSON.stringify(message))
  }
  if (room.player2?.ws) {
    room.player2.ws.send(JSON.stringify(message))
  }

  // Send to spectators
  room.spectators.forEach((spectatorWs) => {
    try {
      spectatorWs.send(JSON.stringify(message))
    } catch (error) {
      // Remove disconnected spectator
      room.spectators.delete(spectatorWs)
    }
  })
}

function broadcastToAll(message: any) {
  for (const player of aiPlayers.values()) {
    try {
      player.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error("Error broadcasting to player:", error)
    }
  }
}

function broadcastOnlineAIs() {
  const onlineAIs = Array.from(aiPlayers.values()).map((ai) => ({
    id: ai.id,
    name: ai.name,
    algorithm: ai.algorithm,
    wins: ai.wins,
    losses: ai.losses,
    draws: ai.draws,
    rating: ai.rating,
    isOnline: ai.isOnline,
  }))

  broadcastToAll({
    type: "online_ais_update",
    data: { ais: onlineAIs },
  })
}

function broadcastBattleRooms() {
  const rooms = Array.from(battleRooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
    player1: room.player1 ? { name: room.player1.name, algorithm: room.player1.algorithm } : null,
    player2: room.player2 ? { name: room.player2.name, algorithm: room.player2.algorithm } : null,
    status: room.status,
    spectators: room.spectators.size,
  }))

  broadcastToAll({
    type: "battle_rooms_update",
    data: { rooms },
  })
}

function parseTcpMessage(message: string) {
  const parts = message.split("|")
  const code = parts[0]

  switch (code) {
    case "0":
      return { type: "game_init", message: "Game initialized" }
    case "1":
      return { type: "move", move: parts[1], player: parts[2], message: `Move: ${parts[1]} by ${parts[2]}` }
    case "2":
      return { type: "game_end", winner: parts[1], message: `Game ended. Winner: ${parts[1]}` }
    default:
      return { type: "unknown", message: `Unknown message: ${message}` }
  }
}

function generatePlayerId(): string {
  return `ai_${Math.random().toString(36).substring(2, 15)}`
}

function generateRoomId(): string {
  return `room_${Math.random().toString(36).substring(2, 15)}`
}

function generateTournamentId(): string {
  return `tournament_${Math.random().toString(36).substring(2, 15)}`
}

server.listen(HTTP_PORT, () => {
  console.log(`AI Network Bridge server running on port ${HTTP_PORT}`)
  console.log(`Bridging to TCP server at ${TCP_HOST}:${TCP_PORT}`)
})
