# TCP Network Setup for Star Wars Othello

This setup allows multiple graphical interfaces to connect and play against each other over TCP using the Python backend.

## Architecture

\`\`\`
React Frontend ↔ WebSocket Bridge ↔ Python TCP Server
\`\`\`

## Setup Instructions

### 1. Start the Python TCP Server

\`\`\`bash
cd python-server
python com_server_with_ai.py
\`\`\`

The server will listen on port 14010 by default.

### 2. Start the WebSocket Bridge

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

The bridge server will run on port 3001.

### 3. Start the React Frontend

\`\`\`bash
npm run dev
\`\`\`

The frontend will be available at http://localhost:3000.

## How to Connect

1. Click "CONNECT TCP" in the game interface
2. Enter the server address (default: localhost)
3. Enter the port (default: 14010)
4. Click "CONNECT"
5. Once connected, click "START NETWORK GAME"

## Protocol

The system uses the original TCP protocol from the Python server:

- `0` - Initialize game
- `1|move|player` - Make a move
- `2|winner` - Game end
- `3|winner` - Resignation
- `-1` to `-7` - Various error codes

## Multiple Interfaces

You can now connect multiple different graphical interfaces:
- React web interface (this one)
- Python console interface
- Any other interface that implements the TCP protocol

Each interface can play against any other interface over the network.

## Troubleshooting

- Make sure the Python server is running first
- Check that ports 3001 and 14010 are not blocked
- Verify the WebSocket bridge is running
- Check browser console for WebSocket connection errors
