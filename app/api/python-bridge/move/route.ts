import { type NextRequest, NextResponse } from "next/server"

const bridgeUrl = "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const { move, player } = await request.json()

    const response = await fetch(`${bridgeUrl}/api/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ move, player }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Move failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Move error:", error)
    return NextResponse.json(
      {
        error: `Failed to make move: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
