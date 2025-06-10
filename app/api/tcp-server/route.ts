import { type NextRequest, NextResponse } from "next/server"
import { createServer, type Socket } from "net"

// Global server state
let tcpServer: any = null
let connectedClient: Socket | null = null
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
  myColor: "B", // Server is always black
  opColor: "W",
  gameOn: false,
  lastMessage: "",
  logs: [] as string[],
}

function letterToNumber(letter: string): number {
  return letter.charCodeAt(0) - 65 // A=0, B=1, etc.
}

function moveToCoord(move: string): [number, number, boolean] {
  if (move.length !== 2) return [0, 0, false]

  const letter = move[0]
  const number = move[1]

  if (letter >= "A" && letter <= "H" && number >= "1" && number <= "8") {
    const col = letterToNumber(letter)
    const row = Number.parseInt(number) - 1
    return [row, col, true]
  }

  return [0, 0, false]
}

function coordToMove(row: number, col: number): string {
  const colLetter = String.fromCharCode(65 + col)
  const rowNumber = row + 1
  return `${colLetter}${rowNumber}`
}

function getValidMovesWithVectors(board: string[][], color: string): Record<string, [number, number][]> {
  const directions = [
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
  ]

  const opponent = color === "B" ? "W" : "B"
  const validMoves: Record<string, [number, number][]> = {}

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[x][y] !== ".") continue

      const validDirs: [number, number][] = []

      for (const [dx, dy] of directions) {
        let nx = x + dx
        let ny = y + dy
        let foundOpponent = false

        while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === opponent) {
          nx += dx
          ny += dy
          foundOpponent = true
        }

        if (foundOpponent && nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === color) {
          validDirs.push([dx, dy])
        }
      }

      if (validDirs.length > 0) {
        const moveStr = coordToMove(x, y)
        validMoves[moveStr] = validDirs
      }
    }
  }

  return validMoves
}

function mostPawn(board: string[][]): string {
  let nbB = 0
  let nbW = 0

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] === "W") nbW++
      else if (board[i][j] === "B") nbB++
    }
  }

  if (nbW > nbB) return "W"
  else if (nbB > nbW) return "B"
  else return "NONE"
}

export async function POST(request: NextRequest) {
  const { action, data } = await request.json()

  if (action === "start") {
    return new Promise((resolve) => {
      if (tcpServer) {
        resolve(NextResponse.json({ error: "Server already running" }, { status: 400 }))
        return
      }

      tcpServer = createServer((socket: Socket) => {
        console.log("Client connected:", socket.remoteAddress)
        connectedClient = socket
        gameState.gameOn = true

        socket.on("data", (data) => {
          const message = data.toString().trim()
          console.log("Received:", message)
          gameState.logs.push(`Received: ${message}`)

          const response = processPacket(message.split("|"))
          console.log("Sending:", response)
          gameState.logs.push(`Sent: ${response}`)

          socket.write(response + "\n")
        })

        socket.on("close", () => {
          console.log("Client disconnected")
          connectedClient = null
          gameState.gameOn = false
        })

        socket.on("error", (err) => {
          console.error("Socket error:", err)
          connectedClient = null
          gameState.gameOn = false
        })
      })

      tcpServer.listen(4321, "0.0.0.0", () => {
        console.log("TCP Server listening on port 4321")
        resolve(
          NextResponse.json({
            status: "Server started on port 4321",
            gameState,
          }),
        )
      })

      tcpServer.on("error", (err: any) => {
        console.error("Server error:", err)
        tcpServer = null
        resolve(NextResponse.json({ error: err.message }, { status: 500 }))
      })
    })
  }

  if (action === "stop") {
    if (tcpServer) {
      tcpServer.close()
      tcpServer = null
    }
    if (connectedClient) {
      connectedClient.destroy()
      connectedClient = null
    }
    gameState.gameOn = false
    return NextResponse.json({ status: "Server stopped" })
  }

  if (action === "status") {
    return NextResponse.json({
      serverRunning: !!tcpServer,
      clientConnected: !!connectedClient,
      gameState,
    })
  }

  if (action === "move") {
    const { move } = data
    if (connectedClient && gameState.gameOn) {
      // This would be handled by the game logic
      return NextResponse.json({ status: "Move processed" })
    }
    return NextResponse.json({ error: "No client connected" }, { status: 400 })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

function processPacket(message: string[]): string {
  // Implement the exact same packet processing logic as the Python script
  console.log("Processing packet:", message)

  if (message.length === 0) {
    return "-5"
  }

  const code = message[0]

  switch (code) {
    case "0": // Initialization
      console.log("Game launched, waiting for first move")
      gameState.gameOn = true
      return "1|NONE|B" // Server starts, but lets client make first move

    case "1": // Move received
      if (message.length !== 3) {
        return "-5"
      }

      const opMove = message[1]
      const latestPlayer = message[2]

      if (opMove === "NONE") {
        // Opponent passed, check if we can move
        const myPossibleMoves = getValidMovesWithVectors(gameState.board, gameState.myColor)
        if (Object.keys(myPossibleMoves).length === 0) {
          // Game over
          const winner = mostPawn(gameState.board)
          gameState.gameOn = false
          return `2|${winner}`
        } else {
          // We can move, but for now return NONE (would need user input)
          return `1|NONE|${gameState.myColor}`
        }
      } else {
        // Process opponent's move
        const [x, y, valid] = moveToCoord(opMove)

        if (!valid) {
          return "-3"
        }

        const opPossibleMoves = getValidMovesWithVectors(gameState.board, gameState.opColor)

        if (!(opMove in opPossibleMoves)) {
          return "-3"
        }

        // Apply the move
        gameState.board[x][y] = latestPlayer

        // Flip pieces
        for (const [dx, dy] of opPossibleMoves[opMove]) {
          let nx = x + dx
          let ny = y + dy

          while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && gameState.board[nx][ny] === gameState.myColor) {
            gameState.board[nx][ny] = gameState.opColor
            nx += dx
            ny += dy
          }
        }

        // Check if we can move
        const myPossibleMoves = getValidMovesWithVectors(gameState.board, gameState.myColor)
        if (Object.keys(myPossibleMoves).length === 0) {
          return `1|NONE|${gameState.myColor}`
        } else {
          // For now, return NONE (would need user input for actual move)
          return `1|NONE|${gameState.myColor}`
        }
      }

    case "2": // End game
      const winner = message[1]
      gameState.gameOn = false
      return "-1"

    case "3": // Resignation
      gameState.gameOn = false
      return `2|${gameState.myColor}`

    case "-2": // Internal error
      gameState.gameOn = false
      return "-1"

    case "-3": // Illegal move
      return `1|NONE|${gameState.myColor}`

    case "-4": // Timeout
      return `${gameState.lastMessage}`

    case "-5": // Message misunderstood
      gameState.gameOn = false
      return "-7"

    default:
      return "-5"
  }
}
