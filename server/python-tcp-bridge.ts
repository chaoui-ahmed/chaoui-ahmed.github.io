import { WebSocketServer } from "ws"
import { createServer } from "http"
import { Socket } from "net"

const HTTP_PORT = 3001
const PYTHON_TCP_HOST = "localhost"
const PYTHON_TCP_PORT = 14010

interface AIBattleSession {
  id: string
  ws: any
  tcpSocket: Socket | null
  isConnected: boolean
  role: "server" | "client"
  aiAlgorithm: string
  playerColor: "B" | "W"
  gameState: "waiting" | "active" | "finished"
  moveHistory: Array<{
    move: string
    player: string
    timestamp: number
  }>
}

const activeSessions = new Map<string, AIBattleSession>()

// Create HTTP server for WebSocket
const server = createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", (ws, req) => {
  const sessionId = generateSessionId()
  console.log(`New AI Battle connection: ${sessionId}`)

  const session: AIBattleSession = {
    id: sessionId,
    ws,
    tcpSocket: null,
    isConnected: false,
    role: "client", // Default to client, will be set when connecting
    aiAlgorithm: "Hybrid AI",
    playerColor: "W",
    gameState: "waiting",
    moveHistory: [],
  }

  activeSessions.set(sessionId, session)

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString())
      await handleWebSocketMessage(session, message)
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
    console.log(`AI Battle session closed: ${sessionId}`)
    if (session.tcpSocket) {
      session.tcpSocket.destroy()
    }
    activeSessions.delete(sessionId)
  })

  ws.on("error", (error) => {
    console.error(`WebSocket error for session ${sessionId}:`, error)
  })

  // Send connection confirmation
  ws.send(
    JSON.stringify({
      type: "session_created",
      sessionId: sessionId,
    }),
  )
})

async function handleWebSocketMessage(session: AIBattleSession, message: any) {
  const { type, data } = message

  switch (type) {
    case "start_ai_server":
      await startPythonServer(session, data.aiAlgorithm)
      break

    case "connect_to_server":
      await connectToExistingServer(session, data.host, data.port, data.aiAlgorithm)
      break

    case "configure_ai":
      session.aiAlgorithm = data.algorithm
      session.ws.send(
        JSON.stringify({
          type: "ai_configured",
          algorithm: data.algorithm,
        }),
      )
      break

    case "start_ai_battle":
      if (session.role === "client" && session.isConnected) {
        // Client starts the game by sending "START"
        await initializeAIBattle(session)
      }
      break

    case "disconnect":
      if (session.tcpSocket) {
        session.tcpSocket.destroy()
        session.tcpSocket = null
        session.isConnected = false
        session.gameState = "finished"
      }
      break
  }
}

async function startPythonServer(session: AIBattleSession, aiAlgorithm: string) {
  try {
    session.role = "server"
    session.playerColor = "B" // Server is always Black
    session.aiAlgorithm = aiAlgorithm

    // Start Python server process (you'll need to modify the Python script to accept algorithm parameter)
    const { spawn } = require("child_process")
    const pythonProcess = spawn("python", ["com_server_with_ai.py", aiAlgorithm])

    pythonProcess.stdout.on("data", (data: any) => {
      console.log(`Python Server Output: ${data}`)
      if (data.toString().includes("ready to receive")) {
        session.ws.send(
          JSON.stringify({
            type: "server_started",
            message: "Python AI server is running and ready for connections",
            role: "server",
            color: "B",
            algorithm: aiAlgorithm,
          }),
        )
      }
    })

    pythonProcess.stderr.on("data", (data: any) => {
      console.error(`Python Server Error: ${data}`)
      session.ws.send(
        JSON.stringify({
          type: "error",
          message: `Server error: ${data}`,
        }),
      )
    })

    pythonProcess.on("close", (code: any) => {
      console.log(`Python server process exited with code ${code}`)
      session.gameState = "finished"
      session.ws.send(
        JSON.stringify({
          type: "server_closed",
          message: "Python server has stopped",
        }),
      )
    })
  } catch (error) {
    console.error("Failed to start Python server:", error)
    session.ws.send(
      JSON.stringify({
        type: "error",
        message: `Failed to start server: ${error}`,
      }),
    )
  }
}

async function connectToExistingServer(session: AIBattleSession, host: string, port: number, aiAlgorithm: string) {
  try {
    session.role = "client"
    session.playerColor = "W" // Client is always White
    session.aiAlgorithm = aiAlgorithm

    const tcpSocket = new Socket()
    session.tcpSocket = tcpSocket

    tcpSocket.connect(port, host, () => {
      console.log(`Connected to Python server: ${host}:${port}`)
      session.isConnected = true

      session.ws.send(
        JSON.stringify({
          type: "connected_to_server",
          message: "Connected to Python AI server",
          role: "client",
          color: "W",
          algorithm: aiAlgorithm,
        }),
      )
    })

    tcpSocket.on("data", (data) => {
      const message = data.toString().trim()
      console.log(`Received from Python server: ${message}`)
      handlePythonMessage(session, message)
    })

    tcpSocket.on("error", (error) => {
      console.error("TCP connection error:", error)
      session.isConnected = false
      session.ws.send(
        JSON.stringify({
          type: "connection_error",
          message: error.message,
        }),
      )
    })

    tcpSocket.on("close", () => {
      console.log("TCP connection closed")
      session.isConnected = false
      session.gameState = "finished"
      session.ws.send(
        JSON.stringify({
          type: "connection_closed",
          message: "Connection to Python server closed",
        }),
      )
    })
  } catch (error) {
    console.error("Failed to connect to Python server:", error)
    session.ws.send(
      JSON.stringify({
        type: "error",
        message: `Failed to connect: ${error}`,
      }),
    )
  }
}

async function initializeAIBattle(session: AIBattleSession) {
  if (session.tcpSocket && session.isConnected) {
    // Send initialization message to Python server
    session.tcpSocket.write("0")
    session.gameState = "active"

    session.ws.send(
      JSON.stringify({
        type: "battle_started",
        message: "AI Battle has begun!",
        yourColor: session.playerColor,
        yourAlgorithm: session.aiAlgorithm,
      }),
    )
  }
}

function handlePythonMessage(session: AIBattleSession, message: string) {
  const parts = message.split("|")
  const code = parts[0]

  // Add to move history
  if (code === "1" && parts.length >= 3) {
    const move = parts[1]
    const player = parts[2]

    if (move !== "NONE") {
      session.moveHistory.push({
        move: move,
        player: player,
        timestamp: Date.now(),
      })
    }

    session.ws.send(
      JSON.stringify({
        type: "move_made",
        data: {
          move: move,
          player: player,
          isYourMove: player === session.playerColor,
          moveHistory: session.moveHistory,
        },
      }),
    )
  }

  // Handle game end
  if (code === "2") {
    const winner = parts[1]
    session.gameState = "finished"

    session.ws.send(
      JSON.stringify({
        type: "game_finished",
        data: {
          winner: winner,
          yourColor: session.playerColor,
          didYouWin: winner === session.playerColor,
          moveHistory: session.moveHistory,
        },
      }),
    )
  }

  // Handle errors
  if (code.startsWith("-")) {
    let errorMessage = "Unknown error"
    switch (code) {
      case "-2":
        errorMessage = "Internal error"
        break
      case "-3":
        errorMessage = "Illegal move detected"
        break
      case "-4":
        errorMessage = "Timeout occurred"
        break
      case "-5":
        errorMessage = "Protocol error"
        break
      case "-7":
        errorMessage = "Fatal error - game terminated"
        session.gameState = "finished"
        break
    }

    session.ws.send(
      JSON.stringify({
        type: "game_error",
        message: errorMessage,
        code: code,
      }),
    )
  }

  // Send raw message for debugging
  session.ws.send(
    JSON.stringify({
      type: "raw_message",
      message: message,
      timestamp: Date.now(),
    }),
  )
}

function generateSessionId(): string {
  return `session_${Math.random().toString(36).substring(2, 15)}`
}

server.listen(HTTP_PORT, () => {
  console.log(`Python TCP Bridge server running on port ${HTTP_PORT}`)
  console.log(`Ready to bridge to Python AI servers`)
})
