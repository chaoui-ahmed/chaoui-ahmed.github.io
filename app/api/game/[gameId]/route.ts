import { type NextRequest, NextResponse } from "next/server"

interface GameState {
  id: string
  board: number[][]
  currentPlayer: number
  players: { id: string; player: number; joinedAt: number }[]
  scores: { player1: number; player2: number }
  gameOver: boolean
  winner: number | null
  lastMove: [number, number] | null
  createdAt: number
  lastActivity: number
}

// In-memory storage for games (in production, you'd use a database)
const games = new Map<string, GameState>()

const EMPTY = 0
const PLAYER1 = 1
const PLAYER2 = 2
const BOARD_SIZE = 8

// Clean up old games (older than 1 hour)
setInterval(
  () => {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    for (const [gameId, game] of games.entries()) {
      if (now - game.lastActivity > oneHour) {
        games.delete(gameId)
        console.log(`Cleaned up old game: ${gameId}`)
      }
    }
  },
  5 * 60 * 1000,
) // Check every 5 minutes

function createInitialBoard(): number[][] {
  const board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(EMPTY))
  board[3][3] = PLAYER2
  board[3][4] = PLAYER1
  board[4][3] = PLAYER1
  board[4][4] = PLAYER2
  return board
}

function calculateScores(board: number[][]): { player1: number; player2: number } {
  let player1 = 0
  let player2 = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === PLAYER1) player1++
      else if (board[row][col] === PLAYER2) player2++
    }
  }

  return { player1, player2 }
}

function isValidMove(board: number[][], row: number, col: number, player: number): boolean {
  if (board[row][col] !== EMPTY) return false

  const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1
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

    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (board[x][y] === opponent) {
        foundOpponent = true
      } else if (board[x][y] === player && foundOpponent) {
        return true
      } else {
        break
      }
      x += dx
      y += dy
    }
  }

  return false
}

function getValidMoves(board: number[][], player: number): [number, number][] {
  const moves: [number, number][] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, row, col, player)) {
        moves.push([row, col])
      }
    }
  }

  return moves
}

function makeMove(board: number[][], row: number, col: number, player: number): boolean {
  if (!isValidMove(board, row, col, player)) return false

  const newBoard = board.map((r) => [...r])
  newBoard[row][col] = player

  const opponent = player === PLAYER1 ? PLAYER2 : PLAYER1
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
    const tilesToFlip: [number, number][] = []

    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (newBoard[x][y] === opponent) {
        tilesToFlip.push([x, y])
      } else if (newBoard[x][y] === player && tilesToFlip.length > 0) {
        for (const [fx, fy] of tilesToFlip) {
          newBoard[fx][fy] = player
        }
        break
      } else {
        break
      }
      x += dx
      y += dy
    }
  }

  // Update the original board
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i][j] = newBoard[i][j]
    }
  }

  return true
}

function checkGameOver(
  board: number[][],
  currentPlayer: number,
): { gameOver: boolean; winner: number | null; nextPlayer: number } {
  const player1Moves = getValidMoves(board, PLAYER1)
  const player2Moves = getValidMoves(board, PLAYER2)

  if (player1Moves.length === 0 && player2Moves.length === 0) {
    const scores = calculateScores(board)
    let winner = null
    if (scores.player1 > scores.player2) winner = PLAYER1
    else if (scores.player2 > scores.player1) winner = PLAYER2

    return { gameOver: true, winner, nextPlayer: currentPlayer }
  }

  const currentPlayerMoves = getValidMoves(board, currentPlayer)
  if (currentPlayerMoves.length === 0) {
    // Switch to other player
    const nextPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1
    return { gameOver: false, winner: null, nextPlayer }
  }

  return { gameOver: false, winner: null, nextPlayer: currentPlayer }
}

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  const gameId = params.gameId
  const game = games.get(gameId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  // Update last activity
  game.lastActivity = Date.now()

  return NextResponse.json(game)
}

export async function POST(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const gameId = params.gameId
    const body = await request.json()

    console.log(`Game ${gameId}: Action ${body.action}`, body)

    if (body.action === "create") {
      // Check if game already exists
      if (games.has(gameId)) {
        const existingGame = games.get(gameId)!
        existingGame.lastActivity = Date.now()
        return NextResponse.json(existingGame)
      }

      const game: GameState = {
        id: gameId,
        board: createInitialBoard(),
        currentPlayer: PLAYER1,
        players: [],
        scores: { player1: 2, player2: 2 },
        gameOver: false,
        winner: null,
        lastMove: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      }

      games.set(gameId, game)
      console.log(`Created new game: ${gameId}`)
      return NextResponse.json(game)
    }

    if (body.action === "join") {
      let game = games.get(gameId)

      // If game doesn't exist, create it
      if (!game) {
        game = {
          id: gameId,
          board: createInitialBoard(),
          currentPlayer: PLAYER1,
          players: [],
          scores: { player1: 2, player2: 2 },
          gameOver: false,
          winner: null,
          lastMove: null,
          createdAt: Date.now(),
          lastActivity: Date.now(),
        }
        games.set(gameId, game)
        console.log(`Created game on join: ${gameId}`)
      }

      const playerId = body.playerId
      const existingPlayer = game.players.find((p) => p.id === playerId)

      if (!existingPlayer && game.players.length < 2) {
        const playerNumber = game.players.length === 0 ? PLAYER1 : PLAYER2
        game.players.push({
          id: playerId,
          player: playerNumber,
          joinedAt: Date.now(),
        })
        console.log(`Player ${playerId} joined as Player ${playerNumber}`)
      }

      game.lastActivity = Date.now()
      return NextResponse.json(game)
    }

    if (body.action === "move") {
      const game = games.get(gameId)
      if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 })
      }

      const { row, col, playerId } = body
      const player = game.players.find((p) => p.id === playerId)

      if (!player) {
        return NextResponse.json({ error: "Player not in game" }, { status: 400 })
      }

      if (player.player !== game.currentPlayer) {
        return NextResponse.json({ error: "Not your turn" }, { status: 400 })
      }

      if (makeMove(game.board, row, col, game.currentPlayer)) {
        game.lastMove = [row, col]
        game.scores = calculateScores(game.board)

        const { gameOver, winner, nextPlayer } = checkGameOver(game.board, game.currentPlayer)
        game.gameOver = gameOver
        game.winner = winner
        game.currentPlayer = nextPlayer
        game.lastActivity = Date.now()

        console.log(`Move made by Player ${player.player}: (${row}, ${col})`)
        return NextResponse.json(game)
      } else {
        return NextResponse.json({ error: "Invalid move" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { gameId: string } }) {
  const gameId = params.gameId
  games.delete(gameId)
  console.log(`Deleted game: ${gameId}`)
  return NextResponse.json({ success: true })
}
