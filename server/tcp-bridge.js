const net = require("net")
const WebSocket = require("ws")
const http = require("http")

// Configuration
const TCP_PORT = 4321
const WS_PORT = 8080

// Game state storage
const games = new Map()

// WebSocket server for web clients
const server = http.createServer()
const wss = new WebSocket.Server({ server })

// TCP server for Python clients
const tcpServer = net.createServer()

class GameSession {
  constructor(gameId) {
    this.gameId = gameId
    this.players = []
    this.board = this.initializeBoard()
    this.currentPlayer = "B" // Black starts (server in Python)
    this.gameState = "waiting"
    this.buffer = "[]"
    this.lastMove = null
  }

  initializeBoard() {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill("."))
    board[3][3] = "W"
    board[3][4] = "B"
    board[4][3] = "B"
    board[4][4] = "W"
    return board
  }

  addPlayer(connection, type, color) {
    const player = {
      id: `${type}_${Date.now()}`,
      connection,
      type, // 'web' or 'python'
      color,
      joined: Date.now(),
    }
    this.players.push(player)
    return player
  }

  broadcast(message, excludePlayer = null) {
    this.players.forEach((player) => {
      if (player === excludePlayer) return

      if (player.type === "web") {
        // Send JSON to web clients
        player.connection.send(JSON.stringify(message))
      } else if (player.type === "python") {
        // Send protocol message to Python clients
        const protocolMessage = this.convertToProtocol(message)
        player.connection.write(protocolMessage)
      }
    })
  }

  convertToProtocol(message) {
    // Convert web message to Python protocol format
    switch (message.type) {
      case "move":
        return `1|${message.move}|${message.player}\n`
      case "gameEnd":
        return `2|${message.winner}\n`
      case "error":
        return `${message.code}\n`
      default:
        return `-5\n` // Unknown message
    }
  }

  parseProtocolMessage(data) {
    const parts = data.toString().trim().split("|")
    const code = parts[0]

    switch (code) {
      case "0": // Initialize game
        return { type: "initialize" }
      case "1": // Move
        return {
          type: "move",
          move: parts[1],
          player: parts[2],
        }
      case "2": // Game end
        return {
          type: "gameEnd",
          winner: parts[1],
        }
      case "3": // Resign
        return {
          type: "resign",
          winner: parts[1],
        }
      default:
        return { type: "error", code }
    }
  }
}

// Handle WebSocket connections (web clients)
wss.on("connection", (ws, req) => {
  console.log("Web client connected")

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data)
      handleWebMessage(ws, message)
    } catch (error) {
      console.error("Error parsing web message:", error)
    }
  })

  ws.on("close", () => {
    console.log("Web client disconnected")
    // Remove player from games
    games.forEach((game) => {
      game.players = game.players.filter((p) => p.connection !== ws)
    })
  })
})

// Handle TCP connections (Python clients)
tcpServer.on("connection", (socket) => {
  console.log("Python client connected")

  socket.on("data", (data) => {
    try {
      handlePythonMessage(socket, data)
    } catch (error) {
      console.error("Error handling Python message:", error)
      socket.write("-2\n") // Internal error
    }
  })

  socket.on("close", () => {
    console.log("Python client disconnected")
    // Remove player from games
    games.forEach((game) => {
      game.players = game.players.filter((p) => p.connection !== socket)
    })
  })

  socket.on("error", (error) => {
    console.error("TCP socket error:", error)
  })
})

function handleWebMessage(ws, message) {
  switch (message.type) {
    case "createGame":
      createGame(ws, message.gameId, "web")
      break
    case "joinGame":
      joinGame(ws, message.gameId, "web")
      break
    case "move":
      handleMove(ws, message, "web")
      break
    case "resign":
      handleResign(ws, message, "web")
      break
  }
}

function handlePythonMessage(socket, data) {
  const message = parseProtocolMessage(data.toString())

  switch (message.type) {
    case "initialize":
      // Python client wants to start a game
      const gameId = `python_${Date.now()}`
      createGame(socket, gameId, "python")
      socket.write("0\n") // Acknowledge initialization
      break
    case "move":
      handleMove(socket, message, "python")
      break
    case "gameEnd":
      handleGameEnd(socket, message, "python")
      break
    case "resign":
      handleResign(socket, message, "python")
      break
  }
}

function createGame(connection, gameId, clientType) {
  const game = new GameSession(gameId)
  const color = clientType === "python" ? "B" : "W" // Python is server (Black), Web is client (White)

  game.addPlayer(connection, clientType, color)
  games.set(gameId, game)

  console.log(`Game ${gameId} created by ${clientType} client`)

  if (clientType === "web") {
    connection.send(
      JSON.stringify({
        type: "gameCreated",
        gameId,
        color,
        board: game.board,
      }),
    )
  }
}

function joinGame(connection, gameId, clientType) {
  const game = games.get(gameId)

  if (!game) {
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Game not found" }))
    } else {
      connection.write("-5\n") // Game not found
    }
    return
  }

  if (game.players.length >= 2) {
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Game is full" }))
    } else {
      connection.write("-5\n") // Game full
    }
    return
  }

  const color = game.players[0].color === "B" ? "W" : "B"
  game.addPlayer(connection, clientType, color)

  console.log(`${clientType} client joined game ${gameId}`)

  // Notify both players that game can start
  game.broadcast({
    type: "gameStarted",
    players: game.players.length,
    board: game.board,
    currentPlayer: game.currentPlayer,
  })

  game.gameState = "playing"
}

function handleMove(connection, message, clientType) {
  // Find the game this player is in
  let game = null
  let player = null

  games.forEach((g) => {
    const p = g.players.find((p) => p.connection === connection)
    if (p) {
      game = g
      player = p
    }
  })

  if (!game || !player) {
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Game not found" }))
    } else {
      connection.write("-5\n")
    }
    return
  }

  // Validate move and update game state
  if (validateMove(game, message.move, player.color)) {
    // Apply move to board
    applyMove(game, message.move, player.color)

    // Switch current player
    game.currentPlayer = game.currentPlayer === "B" ? "W" : "B"

    // Broadcast move to other players
    game.broadcast(
      {
        type: "move",
        move: message.move,
        player: player.color,
        board: game.board,
        currentPlayer: game.currentPlayer,
      },
      player,
    )

    // Send confirmation to sender
    if (clientType === "web") {
      connection.send(
        JSON.stringify({
          type: "moveConfirmed",
          board: game.board,
          currentPlayer: game.currentPlayer,
        }),
      )
    } else {
      connection.write(`1|${message.move}|${player.color}\n`)
    }
  } else {
    // Invalid move
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Invalid move" }))
    } else {
      connection.write("-3\n") // Illegal move
    }
  }
}

function validateMove(game, move, color) {
  // Convert move format (e.g., "A1" to coordinates)
  const col = move.charCodeAt(0) - 65 // A=0, B=1, etc.
  const row = Number.parseInt(move[1]) - 1 // 1=0, 2=1, etc.

  if (row < 0 || row >= 8 || col < 0 || col >= 8) return false
  if (game.board[row][col] !== ".") return false

  // Check if move captures opponent pieces (simplified validation)
  const opponent = color === "B" ? "W" : "B"
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

  for (const [dx, dy] of directions) {
    let x = row + dx
    let y = col + dy
    let foundOpponent = false

    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      if (game.board[x][y] === opponent) {
        foundOpponent = true
      } else if (game.board[x][y] === color && foundOpponent) {
        return true // Valid move found
      } else {
        break
      }
      x += dx
      y += dy
    }
  }

  return false
}

function applyMove(game, move, color) {
  const col = move.charCodeAt(0) - 65
  const row = Number.parseInt(move[1]) - 1

  game.board[row][col] = color

  // Flip captured pieces
  const opponent = color === "B" ? "W" : "B"
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

  for (const [dx, dy] of directions) {
    let x = row + dx
    let y = col + dy
    const toFlip = []

    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      if (game.board[x][y] === opponent) {
        toFlip.push([x, y])
      } else if (game.board[x][y] === color) {
        // Flip all pieces in this direction
        toFlip.forEach(([fx, fy]) => {
          game.board[fx][fy] = color
        })
        break
      } else {
        break
      }
      x += dx
      y += dy
    }
  }

  game.lastMove = move
}

function parseProtocolMessage(data) {
  const parts = data.trim().split("|")
  const code = parts[0]

  switch (code) {
    case "0":
      return { type: "initialize" }
    case "1":
      return {
        type: "move",
        move: parts[1] || "NONE",
        player: parts[2],
      }
    case "2":
      return {
        type: "gameEnd",
        winner: parts[1],
      }
    case "3":
      return {
        type: "resign",
        winner: parts[1],
      }
    default:
      return { type: "error", code }
  }
}

function handleResign(connection, message, clientType) {
  // Find the game this player is in
  let game = null
  let player = null

  games.forEach((g) => {
    const p = g.players.find((p) => p.connection === connection)
    if (p) {
      game = g
      player = p
    }
  })

  if (!game || !player) {
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Game not found" }))
    } else {
      connection.write("-5\n")
    }
    return
  }

  const winner = player.color === "B" ? "W" : "B"

  game.broadcast({
    type: "gameEnd",
    winner: winner,
  })

  game.gameState = "ended"
}

function handleGameEnd(connection, message, clientType) {
  // Find the game this player is in
  let game = null
  let player = null

  games.forEach((g) => {
    const p = g.players.find((p) => p.connection === connection)
    if (p) {
      game = g
      player = p
    }
  })

  if (!game || !player) {
    if (clientType === "web") {
      connection.send(JSON.stringify({ type: "error", message: "Game not found" }))
    } else {
      connection.write("-5\n")
    }
    return
  }

  game.broadcast({
    type: "gameEnd",
    winner: message.winner,
  })

  game.gameState = "ended"
}

// Start servers
tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT} for Python clients`)
})

server.listen(WS_PORT, () => {
  console.log(`WebSocket server listening on port ${WS_PORT} for web clients`)
})

// Cleanup old games
setInterval(() => {
  const now = Date.now()
  const timeout = 10 * 60 * 1000 // 10 minutes

  games.forEach((game, gameId) => {
    if (game.players.length === 0 || now - game.players[0].joined > timeout) {
      games.delete(gameId)
      console.log(`Cleaned up game ${gameId}`)
    }
  })
}, 60000) // Check every minute
