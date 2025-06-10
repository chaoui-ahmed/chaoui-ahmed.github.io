import os
import sys
import signal
import time
from edge_impulse_linux.audio import AudioImpulseRunner
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

runner = None

def signal_handler(sig, frame):
    print('Interrupted')
    if runner:
        runner.stop()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def str_to_int(n):
    mapping = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8
    }
    return mapping.get(n.lower(), n)

def coord_to_move(row, col):
    col_letter = chr(ord('A') + col - 1) if isinstance(col, int) else col
    return f"{col_letter}{row}"

def audio_recognition():
    """Fonction principale de reconnaissance vocale basée sur Edge Impulse"""
    model_path = os.path.join(os.path.dirname(__file__), 'modelfile2.eim')
    
    if not os.path.exists(model_path):
        print(f"Model file not found: {model_path}")
        return None, None
    
    try:
        with AudioImpulseRunner(model_path) as runner:
            model_info = runner.init()
            labels = model_info['model_parameters']['labels']
            selected_device_id = 6  # Peut être ajusté selon le microphone
            inputs = []
            
            for res, audio in runner.classifier(device_id=selected_device_id):
                maximum = 0
                label_max = None
                
                for label in labels:
                    score = res['result']['classification'][label]
                    if score > maximum and score > 0.7:
                        maximum = score
                        label_max = label
                
                if label_max and label_max != 'unknown':
                    print(f"Detected: {label_max} (confidence: {maximum:.2f})")
                    inputs.append(label_max)
                    
                    if len(inputs) == 2:
                        # Convertir les entrées en coordonnées
                        row = str_to_int(inputs[0])
                        col = str_to_int(inputs[1])
                        move = coord_to_move(row, col)
                        return inputs[0], inputs[1], move
                        
    except Exception as e:
        print(f"Error in audio recognition: {e}")
        return None, None, None

@app.route('/api/voice/listen', methods=['POST'])
def listen_for_move():
    """API endpoint pour écouter un coup vocal"""
    try:
        result = audio_recognition()
        if result and len(result) == 3:
            row_word, col_word, move = result
            return jsonify({
                'success': True,
                'move': move,
                'raw_input': {
                    'row': row_word,
                    'col': col_word
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No valid move detected'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/voice/status', methods=['GET'])
def get_status():
    """Vérifier le statut du service de reconnaissance vocale"""
    model_path = os.path.join(os.path.dirname(__file__), 'modelfile2.eim')
    return jsonify({
        'status': 'ready',
        'model_available': os.path.exists(model_path),
        'model_path': model_path
    })

if __name__ == '__main__':
    print("Voice Recognition Server - Simple A1, B2 format")
    print("Supports: A1, B2, D4 or A one, B two formats")
    app.run(host='0.0.0.0', port=5000, debug=True)
