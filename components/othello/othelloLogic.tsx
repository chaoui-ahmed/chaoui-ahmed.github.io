export type Player = "LIGHT" | "DARK" | "EMPTY"
export type GameBoard = Player[][]

export const initializeBoard = (): GameBoard => {
  const board: GameBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill("EMPTY"))

  // Initial Othello setup
  board[3][3] = "LIGHT"
  board[3][4] = "DARK"
  board[4][3] = "DARK"
  board[4][4] = "LIGHT"

  return board
}

export const getValidMoves = (board: GameBoard, player: Player): string[] => {
  const validMovesWithVectors = getValidMovesWithVectors(board, player)
  return Object.keys(validMovesWithVectors)
}

export const getValidMovesWithVectors = (board: GameBoard, player: Player): { [key: string]: [number, number][] } => {
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
  const opponent = player === "LIGHT" ? "DARK" : "LIGHT"
  const validMoves: { [key: string]: [number, number][] } = {}

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[x][y] !== "EMPTY") continue

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

        if (foundOpponent && nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === player) {
          validDirs.push([dx, dy])
        }
      }

      if (validDirs.length > 0) {
        const colLetter = String.fromCharCode(65 + y) // A-H
        const moveStr = `${colLetter}${x + 1}`
        validMoves[moveStr] = validDirs
      }
    }
  }

  return validMoves
}

export const makeMove = (board: GameBoard, move: string, player: Player): GameBoard => {
  const validMoves = getValidMovesWithVectors(board, player)

  if (!validMoves[move]) return board

  const newBoard = board.map((row) => [...row])
  const [colLetter, rowStr] = [move[0], move.slice(1)]
  const x = Number.parseInt(rowStr) - 1
  const y = colLetter.charCodeAt(0) - 65

  newBoard[x][y] = player

  // Flip pieces
  for (const [dx, dy] of validMoves[move]) {
    let nx = x + dx
    let ny = y + dy
    const piecesToFlip: [number, number][] = []

    while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && newBoard[nx][ny] !== player && newBoard[nx][ny] !== "EMPTY") {
      piecesToFlip.push([nx, ny])
      nx += dx
      ny += dy
    }

    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && newBoard[nx][ny] === player) {
      for (const [fx, fy] of piecesToFlip) {
        newBoard[fx][fy] = player
      }
    }
  }

  return newBoard
}

export const calculateWinner = (
  board: GameBoard,
): { winner: Player | "DRAW" | null; darkCount: number; lightCount: number } => {
  let darkCount = 0
  let lightCount = 0

  // Count pieces
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] === "DARK") darkCount++
      else if (board[i][j] === "LIGHT") lightCount++
    }
  }

  // Check if the game is over (no empty cells or no valid moves for either player)
  const darkMoves = getValidMoves(board, "DARK")
  const lightMoves = getValidMoves(board, "LIGHT")
  const isGameOver = darkCount + lightCount === 64 || (darkMoves.length === 0 && lightMoves.length === 0)

  if (!isGameOver) {
    return { winner: null, darkCount, lightCount }
  }

  if (darkCount > lightCount) {
    return { winner: "DARK", darkCount, lightCount }
  } else if (lightCount > darkCount) {
    return { winner: "LIGHT", darkCount, lightCount }
  } else {
    return { winner: "DRAW", darkCount, lightCount }
  }
}
