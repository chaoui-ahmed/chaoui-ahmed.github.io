import { type NextRequest, NextResponse } from "next/server"

// Store bridge connection info
let bridgeUrl = "http://localhost:5000"
let isConnected = false

export async function POST(request: NextRequest) {
  try {
    const { bridgeUrl: newBridgeUrl } = await request.json()

    if (newBridgeUrl) {
      bridgeUrl = newBridgeUrl
    }

    // Test connection to Python bridge
    const response = await fetch(`${bridgeUrl}/api/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Bridge responded with status: ${response.status}`)
    }

    const data = await response.json()
    isConnected = true

    return NextResponse.json({
      status: "connected",
      board: data.board,
      bridgeUrl,
    })
  } catch (error) {
    console.error("Bridge connection error:", error)
    isConnected = false

    return NextResponse.json(
      {
        error: `Failed to connect to Python bridge. Please ensure:
        1. Python bridge is running: python scripts/network_bridge.py
        2. Bridge is accessible at the specified URL
        3. No firewall is blocking the connection
        
        Error details: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
