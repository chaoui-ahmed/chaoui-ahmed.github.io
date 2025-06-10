from flask import Flask, request, jsonify
from flask_cors import CORS
import socket
import threading
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("simple_bridge")

app = Flask(__name__)
CORS(app)

# Game state
game_state = {
    "board": [["." for _ in range(8)] for _ in range(8)],
    "current_player": "B",
    "game_status": "waiting",
    "python_connected": False,
    "web_connected": False,
    "last_move": None
}

# Initialize board
game_state["board"][3][3] = "W"
game_state["board"][3][4] = "B" 
game_state["board"][4][3] = "B"
game_state["board"][4][4] = "W"

python_client = None
message_queue = []

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
    return jsonify({
        "status": "connected", 
        "board": game_state["board"]
    })

@app.route('/api/board', methods=['GET'])
def get_board():
    return jsonify({
        "board": game_state["board"],
        "current_player": game_state["current_player"],
        "game_status": game_state["game_status"]
    })

@app.route('/api/move', methods=['POST'])
def make_move():
    try:
        data = request.json
        move = data.get('move')
        player = data.get('player')
        
        logger.info(f"Web move received: {move} by {player}")
        
        # Send to Python client
        if python_client:
            message = f"1|{move}|{player}"
            python_client.send(f"{message}\n".encode())
            logger.info(f"Sent to Python: {message}")
        
        # Update game state
        game_state["last_move"] = move
        game_state["current_player"] = "W" if player == "B" else "B"
        
        return jsonify({
            "status": "success",
            "board": game_state["board"],
            "current_player": game_state["current_player"]
        })
        
    except Exception as e:
        logger.error(f"Move error: {e}")
        return jsonify({"error": str(e)}), 500

def handle_python_client(client_socket, addr):
    global python_client
    python_client = client_socket
    game_state["python_connected"] = True
    logger.info(f"Python client connected from {addr}")
    
    try:
        # Send initial message
        client_socket.send("0\n".encode())
        
        while True:
            try:
                data = client_socket.recv(1024).decode().strip()
                if not data:
                    break
                    
                logger.info(f"Received from Python: {data}")
                # Process Python response here
                
            except socket.timeout:
                continue
            except Exception as e:
                logger.error(f"Error with Python client: {e}")
                break
                
    except Exception as e:
        logger.error(f"Python client error: {e}")
    finally:
        game_state["python_connected"] = False
        python_client = None
        client_socket.close()
        logger.info("Python client disconnected")

def start_tcp_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind(("0.0.0.0", 4321))
        server_socket.listen(1)
        logger.info("TCP server listening on port 4321")
        
        while True:
            client_socket, addr = server_socket.accept()
            threading.Thread(target=handle_python_client, args=(client_socket, addr)).start()
            
    except Exception as e:
        logger.error(f"TCP server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    # Start TCP server
    tcp_thread = threading.Thread(target=start_tcp_server)
    tcp_thread.daemon = True
    tcp_thread.start()
    
    # Start Flask server
    logger.info("Starting Flask server on port 5000")
    print("\n" + "="*50)
    print("🚀 PYTHON BRIDGE STARTED")
    print("="*50)
    print("✅ Web API: http://localhost:5000")
    print("✅ Python TCP: localhost:4321")
    print("📝 Run your Python script now!")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
