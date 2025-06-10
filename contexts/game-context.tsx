"use client"

import type React from "react"
import { createContext, useState, useContext } from "react"

type Player = "LIGHT" | "DARK" | "EMPTY"
type GameBoard = Player[][]
type GameMode = "local" | "online" | "ai"
type GameStatus = "waiting" | "playing" | "finished"

interface OthelloMove {
  row: number
  col: number
  player: Player
}

interface GameState {
  selectedMode: "ai" | "puzzle" | "duo" | null
  selectedCharacter: string | null
  aiDifficulty: "padawan" | "knight" | "master" | null
  puzzleLevel: number
  puzzleLevelsCompleted: boolean[]
  score: number
  lobbyCode: string
  lobbyName: string
  board: GameBoard
  currentPlayer: Player
  validMoves: string[]
  gameStatus: GameStatus
  winner: Player | "DRAW" | null
  moveHistory: OthelloMove[]
}

interface GameContextType {
  // Existing properties
  selectedCharacter: string
  setSelectedCharacter: (character: string) => void
  gameMode: string
  setGameMode: (mode: string) => void

  // New Othello game properties
  gameState: GameState
  updateGameState: (updates: Partial<GameState>) => void
  makeMove: (move: string) => boolean
  resetGame: () => void
  getValidMoves: (player: Player) => string[]
  isValidMove: (move: string, player: Player) => boolean
  switchPlayer: () => void
}

const GameContext = createContext<GameContextType>({
  selectedCharacter: "",
  setSelectedCharacter: () => {},
  gameMode: "",
  setGameMode: () => {},
  gameState: {
    selectedMode: null,
    selectedCharacter: null,
    aiDifficulty: null,
    puzzleLevel: 1,
    puzzleLevelsCompleted: Array(15).fill(false),
    score: 0,
    lobbyCode: "",
    lobbyName: "",
    board: [],
    currentPlayer: "DARK",
    validMoves: [],
    gameStatus: "waiting",
    winner: null,
    moveHistory: [],
  },
  updateGameState: () => {},
  makeMove: () => false,
  resetGame: () => {},
  getValidMoves: () => [],
  isValidMove: () => false,
  switchPlayer: () => {},
})

const initialState = {
  selectedMode: null,
  selectedCharacter: null,
  aiDifficulty: null,
  puzzleLevel: 1,
  puzzleLevelsCompleted: Array(15).fill(false),
  score: 0,
  lobbyCode: "",
  lobbyName: "",
  board: [],
  currentPlayer: "DARK",
  validMoves: [],
  gameStatus: "waiting",
  winner: null,
  moveHistory: [],
}

const initializeBoard = (): GameBoard => {
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

const getValidMovesWithVectors = (board: GameBoard, player: Player): { [key: string]: [number, number][] } => {
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

interface GameProviderProps {
  children: React.ReactNode
}

const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [selectedCharacter, setSelectedCharacter] = useState("")
  const [gameMode, setGameMode] = useState("")

  const [gameState, setGameState] = useState<GameState>({
    selectedMode: null,
    selectedCharacter: null,
    aiDifficulty: null,
    puzzleLevel: 1,
    puzzleLevelsCompleted: Array(15).fill(false),
    score: 0,
    lobbyCode: "",
    lobbyName: "",
    board: initializeBoard(),
    currentPlayer: "DARK",
    validMoves: [],
    gameStatus: "waiting",
    winner: null,
    moveHistory: [],
  })

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }))
  }

  const makeMove = (move: string): boolean => {
    const validMoves = getValidMovesWithVectors(gameState.board, gameState.currentPlayer)

    if (!validMoves[move]) return false

    const newBoard = gameState.board.map((row) => [...row])
    const [colLetter, rowStr] = [move[0], move.slice(1)]
    const x = Number.parseInt(rowStr) - 1
    const y = colLetter.charCodeAt(0) - 65

    newBoard[x][y] = gameState.currentPlayer

    // Flip pieces
    for (const [dx, dy] of validMoves[move]) {
      let nx = x + dx
      let ny = y + dy
      const piecesToFlip: [number, number][] = []

      while (
        nx >= 0 &&
        nx < 8 &&
        ny >= 0 &&
        ny < 8 &&
        newBoard[nx][ny] !== gameState.currentPlayer &&
        newBoard[nx][ny] !== "EMPTY"
      ) {
        piecesToFlip.push([nx, ny])
        nx += dx
        ny += dy
      }

      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && newBoard[nx][ny] === gameState.currentPlayer) {
        for (const [fx, fy] of piecesToFlip) {
          newBoard[fx][fy] = gameState.currentPlayer
        }
      }
    }

    const nextPlayer = gameState.currentPlayer === "DARK" ? "LIGHT" : "DARK"
    const nextValidMoves = Object.keys(getValidMovesWithVectors(newBoard, nextPlayer))

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      validMoves: nextValidMoves,
      moveHistory: [...prev.moveHistory, { row: x, col: y, player: prev.currentPlayer }],
    }))

    return true
  }

  const resetGame = () => {
    setGameState({
      ...initialState,
      puzzleLevelsCompleted: gameState.puzzleLevelsCompleted,
      board: initializeBoard(),
      currentPlayer: "DARK",
      validMoves: [],
      gameStatus: "waiting",
      winner: null,
      moveHistory: [],
    })
  }

  const getValidMoves = (player: Player): string[] => {
    const validMovesWithVectors = getValidMovesWithVectors(gameState.board, player)
    return Object.keys(validMovesWithVectors)
  }

  const isValidMove = (move: string, player: Player): boolean => {
    const validMovesWithVectors = getValidMovesWithVectors(gameState.board, player)
    return !!validMovesWithVectors[move]
  }

  const switchPlayer = () => {
    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === "DARK" ? "LIGHT" : "DARK",
    }))
  }

  return (
    <GameContext.Provider
      value={{
        selectedCharacter,
        setSelectedCharacter,
        gameMode,
        setGameMode,
        gameState,
        updateGameState,
        makeMove,
        resetGame,
        getValidMoves,
        isValidMove,
        switchPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

const useGameContext = () => {
  return useContext(GameContext)
}

function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export { GameProvider, useGameContext, useGame }
