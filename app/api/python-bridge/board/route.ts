import { NextResponse } from "next/server"

const bridgeUrl = "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${bridgeUrl}/api/board`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Failed to get board: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Board fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to get board state",
        board: Array(8).fill(Array(8).fill(".")),
        current_player: "B",
        game_status: "error",
      },
      { status: 500 },
    )
  }
}
