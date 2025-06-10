# Star Wars Othello - Python Bridge Instructions

This guide explains how to connect your Python Othello script to the web interface.

## Requirements

- Python 3.6+
- Flask (`pip install flask flask-cors`)
- Your Python Othello script (using port 4321)

## Setup Instructions

### Step 1: Start the Bridge Server

1. Navigate to the `scripts` folder
2. Run the bridge script:
   \`\`\`
   python network_bridge.py
   \`\`\`
3. You should see: "TCP server listening on port 4321" and "Starting Flask server on port 5000"

### Step 2: Launch the Web Interface

1. Open the Star Wars Othello web app
2. Go to Multiplayer Mode
3. Select "Python Game"
4. Click "Connect to Bridge" (default: http://localhost:5000)
5. You'll see "Waiting for Python Player..."

### Step 3: Run Your Python Script

1. Run your Python Othello script that connects to port 4321
2. The web interface will automatically detect the connection
3. The game will start with the Python script playing as Black and the web interface as White

## Troubleshooting

- **Connection Issues**: Make sure both the bridge and your Python script are running on the same machine
- **Port Conflicts**: Ensure no other applications are using ports 4321 or 5000
- **Firewall Issues**: Check if your firewall is blocking the connections

## Protocol Details

The bridge translates between the web interface and your Python script:

- Python script sends/receives: `"1|A4|B"` (code|move|player)
- Web interface sends/receives: JSON objects

## Need Help?

If you encounter any issues, check the bridge server console for error messages.
