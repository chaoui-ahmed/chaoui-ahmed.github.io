import socket
import threading
import json
import time
import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Configuration
TCP_PORT = 4321
WEB_PORT = 5000
HOST = "0.0.0.0"  # Listen on all interfaces

# Setup logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[logging.StreamHandler()])
logger = logging.getLogger("network_bridge")

# Game state
game_state = {
    "board": [["." for _ in range(8)] for _ in range(8)],
    "current_player": "B",  # Black starts
    "game_status": "waiting",
    "python_connected": False,
    "web_connected": False,
    "last_move": None,
    "buffer": "[]"
}

# Initialize the board
game_state["board"][3][3] = "W"
game_state["board"][3][4] = "B"
game_state["board"][4][3] = "B"
game_state["board"][4][4] = "W"

# Create Flask app for web communication
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Queue for messages to be sent to Python client
python_message_queue = []
python_client = None
python_lock = threading.Lock()

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "python_connected": game_state["python_connected"],
        "web_connected": game_state["web_connected"],
        "game_status": game_state["game_status"],
        "current_player": game_state["current_player"]
    })

@app.route('/api/connect', methods=['POST'])
def web_connect():
    game_state["web_connected"] = True
    logger.info("Web client connected")
    return jsonify({"status": "connected", "board": game_state["board"]})

@app.route('/api/board', methods=['GET'])
def get_board():
    return jsonify({
        "board": game_state["board"],
        "current_player": game_state["current_player"],
        "game_status": game_state["game_status"]
    })

@app.route('/api/move', methods=['POST'])
def make_move():
    data = request.json
    move = data.get('move')
    player = data.get('player')
    
    if not move or not player:
        return jsonify({"error": "Invalid request"}), 400
    
    if game_state["current_player"] != player:
        return jsonify({"error": "Not your turn"}), 400
    
    # Queue message for Python client
    with python_lock:
        python_message_queue.append(f"1|{move}|{player}")
    
    logger.info(f"Web move queued: {move} by {player}")
    
    # Wait for Python client to process the move
    timeout = 5  # seconds
    start_time = time.time()
    while time.time() - start_time < timeout:
        if game_state["last_move"] == move:
            return jsonify({
                "status": "success",
                "board": game_state["board"],
                "current_player": game_state["current_player"]
            })
        time.sleep(0.1)
    
    return jsonify({"error": "Move timeout"}), 408

def handle_python_client(client_socket, addr):
    global python_client
    python_client = client_socket
    game_state["python_connected"] = True
    logger.info(f"Python client connected from {addr}")
    
    try:
        # Send initial board state
        client_socket.send("0\n".encode())
        
        while True:
            # Check if there are messages to send to Python client
            if python_message_queue:
                with python_lock:
                    message = python_message_queue.pop(0)
                logger.info(f"Sending to Python: {message}")
                client_socket.send(f"{message}\n".encode())
            
            # Check if Python client has sent a message
            client_socket.settimeout(0.1)
            try:
                data = client_socket.recv(1024).decode().strip()
                if not data:
                    break
                
                logger.info(f"Received from Python: {data}")
                process_python_message(data)
            except socket.timeout:
                pass
            except Exception as e:
                logger.error(f"Error receiving from Python: {e}")
                break
            
            time.sleep(0.1)
    except Exception as e:
        logger.error(f"Python client error: {e}")
    finally:
        game_state["python_connected"] = False
        python_client = None
        client_socket.close()
        logger.info("Python client disconnected")

def process_python_message(message):
    parts = message.split("|")
    code = parts[0]
    
    if code == "1":  # Move
        move = parts[1]
        player = parts[2]
        
        # Update game state
        game_state["last_move"] = move
        game_state["current_player"] = "W" if player == "B" else "B"
        
        # Update board (simplified)
        if move != "NONE":
            col = ord(move[0]) - ord('A')
            row = int(move[1]) - 1
            if 0 <= row < 8 and 0 <= col < 8:
                game_state["board"][row][col] = player
        
        logger.info(f"Processed Python move: {move} by {player}")
    
    elif code == "2":  # Game end
        winner = parts[1]
        game_state["game_status"] = "ended"
        logger.info(f"Game ended. Winner: {winner}")

def start_tcp_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind((HOST, TCP_PORT))
        server_socket.listen(1)
        logger.info(f"TCP server listening on port {TCP_PORT}")
        
        while True:
            client_socket, addr = server_socket.accept()
            threading.Thread(target=handle_python_client, args=(client_socket, addr)).start()
    except Exception as e:
        logger.error(f"TCP server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    # Start TCP server in a separate thread
    tcp_thread = threading.Thread(target=start_tcp_server)
    tcp_thread.daemon = True
    tcp_thread.start()
    
    # Start Flask server
    logger.info(f"Starting Flask server on port {WEB_PORT}")
    app.run(host=HOST, port=WEB_PORT, debug=False, threaded=True)
