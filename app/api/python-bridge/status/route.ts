import { NextResponse } from "next/server"

const bridgeUrl = "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${bridgeUrl}/api/status`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`Bridge status check failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        error: "Failed to get bridge status",
        python_connected: false,
        web_connected: false,
        game_status: "error",
      },
      { status: 500 },
    )
  }
}
