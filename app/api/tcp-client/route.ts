import { type NextRequest, NextResponse } from "next/server"
import { Socket } from "net"

// Global client state
let tcpClient: Socket | null = null
const gameState = {
  board: [
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", "W", "B", ".", ".", "."],
    [".", ".", ".", "B", "W", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
  ],
  currentPlayer: "B",
  myColor: "W", // Client is always white
  opColor: "B",
  gameOn: false,
  connected: false,
  lastMessage: "",
  logs: [] as string[],
}

export async function POST(request: NextRequest) {
  const { action, data } = await request.json()

  if (action === "connect") {
    const { host } = data

    return new Promise((resolve) => {
      if (tcpClient) {
        resolve(NextResponse.json({ error: "Already connected" }, { status: 400 }))
        return
      }

      tcpClient = new Socket()

      tcpClient.connect(4321, host, () => {
        console.log("Connected to server:", host)
        gameState.connected = true
        gameState.gameOn = true

        // Send initialization message
        const initMessage = "0"
        console.log("Sending:", initMessage)
        gameState.logs.push(`Sent: ${initMessage}`)
        tcpClient!.write(initMessage + "\n")

        resolve(
          NextResponse.json({
            status: `Connected to ${host}:4321`,
            gameState,
          }),
        )
      })

      tcpClient.on("data", (data) => {
        const message = data.toString().trim()
        console.log("Received:", message)
        gameState.logs.push(`Received: ${message}`)

        const response = processPacket(message.split("|"))
        if (response) {
          console.log("Sending:", response)
          gameState.logs.push(`Sent: ${response}`)
          tcpClient!.write(response + "\n")
        }
      })

      tcpClient.on("close", () => {
        console.log("Disconnected from server")
        tcpClient = null
        gameState.connected = false
        gameState.gameOn = false
      })

      tcpClient.on("error", (err) => {
        console.error("Client error:", err)
        tcpClient = null
        gameState.connected = false
        gameState.gameOn = false
        resolve(NextResponse.json({ error: err.message }, { status: 500 }))
      })
    })
  }

  if (action === "disconnect") {
    if (tcpClient) {
      tcpClient.destroy()
      tcpClient = null
    }
    gameState.connected = false
    gameState.gameOn = false
    return NextResponse.json({ status: "Disconnected" })
  }

  if (action === "status") {
    return NextResponse.json({
      connected: gameState.connected,
      gameState,
    })
  }

  if (action === "move") {
    const { move } = data
    if (tcpClient && gameState.connected) {
      const message = `1|${move}|${gameState.myColor}`
      console.log("Sending move:", message)
      gameState.logs.push(`Sent: ${message}`)
      tcpClient.write(message + "\n")
      return NextResponse.json({ status: "Move sent" })
    }
    return NextResponse.json({ error: "Not connected" }, { status: 400 })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

function processPacket(message: string[]): string | null {
  // Same processing logic as server, but from client perspective
  console.log("Processing packet:", message)

  if (message.length === 0) {
    return "-5"
  }

  const code = message[0]

  switch (code) {
    case "1": // Move or response
      if (message.length !== 3) {
        return "-5"
      }

      const opMove = message[1]
      const latestPlayer = message[2]

      // Process the move and update board
      // For now, just acknowledge
      return null // No immediate response needed

    case "2": // End game
      gameState.gameOn = false
      return null

    case "-1": // Acknowledgment
      return null

    case "-3": // Illegal move
      // Resend a different move
      return `1|NONE|${gameState.myColor}`

    default:
      return null
  }
}
