# Star Wars Othello Bridge Server

This bridge server allows web clients to connect and play with Python clients using the original TCP protocol.

## Setup

1. Install dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

2. Start the bridge server:
\`\`\`bash
npm start
\`\`\`

The server will listen on:
- **Port 4321** for Python TCP clients (same as your Python script)
- **Port 8080** for WebSocket connections from web clients

## How it works

1. **Python Client**: Run your existing Python script - it will connect to port 4321
2. **Web Client**: Use the "Python Bridge" option in the game menu
3. **Bridge**: The server translates between the web client (JSON/WebSocket) and Python client (TCP protocol)

## Protocol Translation

The bridge automatically converts between:
- **Web format**: JSON messages over WebSocket
- **Python format**: Pipe-separated protocol over TCP (`1|A4|B`)

## Testing

1. Start the bridge server: `npm start`
2. Run your Python script (it should connect as server)
3. Open the web game and select "Python Bridge"
4. The two clients should connect and be able to play together!
