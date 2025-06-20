import { WebSocketServer } from "ws"
import { createServer } from "http"
import { Socket } from "net"

const HTTP_PORT = 3001
const TCP_HOST = "localhost"
const TCP_PORT = 14010

interface GameConnection {
  ws: any
  tcpSocket: Socket | null
  isConnected: boolean
  playerId: string
}

const connections = new Map<string, GameConnection>()

// Create HTTP server for WebSocket
const server = createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", (ws, req) => {
  const playerId = generatePlayerId()
  console.log(`New WebSocket connection: ${playerId}`)

  const connection: GameConnection = {
    ws,
    tcpSocket: null,
    isConnected: false,
    playerId,
  }

  connections.set(playerId, connection)

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString())
      await handleWebSocketMessage(connection, message)
    } catch (error) {
      console.error("Error handling WebSocket message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      )
    }
  })

  ws.on("close", () => {
    console.log(`WebSocket connection closed: ${playerId}`)
    if (connection.tcpSocket) {
      connection.tcpSocket.destroy()
    }
    connections.delete(playerId)
  })

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${playerId}:`, error)
  })

  // Send connection confirmation
  ws.send(
    JSON.stringify({
      type: "connected",
      playerId: playerId,
    }),
  )
})

async function handleWebSocketMessage(connection: GameConnection, message: any) {
  const { type, data } = message

  switch (type) {
    case "connect_tcp":
      await connectToTcpServer(connection, data.host || TCP_HOST, data.port || TCP_PORT)
      break

    case "start_game":
      if (connection.tcpSocket && connection.isConnected) {
        // Send initialization message to TCP server
        connection.tcpSocket.write("0")
      } else {
        connection.ws.send(
          JSON.stringify({
            type: "error",
            message: "Not connected to TCP server",
          }),
        )
      }
      break

    case "make_move":
      if (connection.tcpSocket && connection.isConnected) {
        const { move, player } = data
        const tcpMessage = `1|${move}|${player}`
        connection.tcpSocket.write(tcpMessage)
      }
      break

    case "disconnect_tcp":
      if (connection.tcpSocket) {
        connection.tcpSocket.destroy()
        connection.tcpSocket = null
        connection.isConnected = false
      }
      break
  }
}

async function connectToTcpServer(connection: GameConnection, host: string, port: number) {
  try {
    const tcpSocket = new Socket()

    tcpSocket.connect(port, host, () => {
      console.log(`Connected to TCP server: ${host}:${port}`)
      connection.tcpSocket = tcpSocket
      connection.isConnected = true

      connection.ws.send(
        JSON.stringify({
          type: "tcp_connected",
          message: "Successfully connected to TCP server",
        }),
      )
    })

    tcpSocket.on("data", (data) => {
      const message = data.toString().trim()
      console.log(`Received from TCP: ${message}`)

      // Parse TCP message and send to WebSocket client
      const parsedMessage = parseTcpMessage(message)
      connection.ws.send(
        JSON.stringify({
          type: "tcp_message",
          data: parsedMessage,
        }),
      )
    })

    tcpSocket.on("error", (error) => {
      console.error("TCP connection error:", error)
      connection.isConnected = false
      connection.ws.send(
        JSON.stringify({
          type: "tcp_error",
          message: error.message,
        }),
      )
    })

    tcpSocket.on("close", () => {
      console.log("TCP connection closed")
      connection.isConnected = false
      connection.tcpSocket = null
      connection.ws.send(
        JSON.stringify({
          type: "tcp_disconnected",
          message: "TCP connection closed",
        }),
      )
    })
  } catch (error) {
    console.error("Failed to connect to TCP server:", error)
    connection.ws.send(
      JSON.stringify({
        type: "tcp_error",
        message: `Failed to connect: ${error}`,
      }),
    )
  }
}

function parseTcpMessage(message: string) {
  const parts = message.split("|")
  const code = parts[0]

  switch (code) {
    case "0":
      return { type: "game_init", message: "Game initialized" }

    case "1":
      return {
        type: "move",
        move: parts[1],
        player: parts[2],
        message: `Move: ${parts[1]} by ${parts[2]}`,
      }

    case "2":
      return {
        type: "game_end",
        winner: parts[1],
        message: `Game ended. Winner: ${parts[1]}`,
      }

    case "3":
      return {
        type: "resignation",
        winner: parts[1],
        message: `Player resigned. Winner: ${parts[1]}`,
      }

    case "-1":
      return { type: "ack", message: "Acknowledged" }

    case "-2":
      return { type: "internal_error", message: "Internal error occurred" }

    case "-3":
      return { type: "illegal_move", message: "Illegal move detected" }

    case "-4":
      return { type: "timeout", message: "Timeout occurred" }

    case "-5":
      return { type: "protocol_error", message: "Protocol error" }

    case "-6":
      return {
        type: "timeout_response",
        move: parts[1],
        player: parts[2],
        message: "Timeout response",
      }

    case "-7":
      return { type: "fatal_error", message: "Fatal error - game terminated" }

    default:
      return { type: "unknown", message: `Unknown message: ${message}` }
  }
}

function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15)
}

server.listen(HTTP_PORT, () => {
  console.log(`WebSocket bridge server running on port ${HTTP_PORT}`)
  console.log(`Bridging to TCP server at ${TCP_HOST}:${TCP_PORT}`)
})
