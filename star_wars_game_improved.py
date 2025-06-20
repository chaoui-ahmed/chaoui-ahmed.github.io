import pygame
import math
import random
import time
import socket
import threading
from enum import Enum
from typing import List, Tuple, Optional, Dict
import json

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 1400
SCREEN_HEIGHT = 900
FPS = 60

# Colors (Star Wars theme)
COLORS = {
    'DARK_BLUE': (7, 27, 63),
    'GOLD': (226, 175, 0),
    'LIGHT_BLUE': (101, 221, 254),
    'WHITE': (255, 255, 255),
    'BLACK': (0, 0, 0),
    'GRAY': (68, 68, 68),
    'LIGHT_GRAY': (217, 217, 217),
    'DARK_GRAY': (34, 34, 34),
    'RED': (255, 0, 0),
    'GREEN': (0, 255, 0),
    'BLUE': (0, 100, 255),
}

class GameState(Enum):
    MAIN_MENU = "main_menu"
    MODE_SELECT = "mode_select"
    AI_CHARACTER_SELECT = "ai_character_select"
    AI_DIFFICULTY = "ai_difficulty"
    AI_GAME = "ai_game"
    PUZZLE_LEVELS = "puzzle_levels"
    PUZZLE_GAME = "puzzle_game"
    DUO_SELECT = "duo_select"
    DUO_CREATE = "duo_create"
    DUO_JOIN = "duo_join"
    DUO_LOBBY = "duo_lobby"
    DUO_GAME = "duo_game"

class OthelloAI:
    """AI for Othello game - placeholder for your AI file integration"""
    
    @staticmethod
    def get_best_move(board: List[List[int]], player: int, difficulty: int) -> Tuple[int, int]:
        """
        Get the best move for the AI player
        board: 8x8 grid with 0=empty, 1=black, 2=white
        player: 1 or 2
        difficulty: 1-3 (Padawan to Jedi Master)
        Returns: (row, col) tuple
        """
        valid_moves = OthelloGame.get_valid_moves(board, player)
        if not valid_moves:
            return None
            
        if difficulty == 1:  # Padawan - Random
            return random.choice(valid_moves)
        elif difficulty == 2:  # Jedi Knight - Greedy
            return OthelloAI._greedy_move(board, player, valid_moves)
        else:  # Jedi Master - Minimax
            return OthelloAI._minimax_move(board, player, valid_moves)
    
    @staticmethod
    def _greedy_move(board: List[List[int]], player: int, valid_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """Choose move that flips the most pieces"""
        best_move = valid_moves[0]
        best_score = 0
        
        for move in valid_moves:
            temp_board = [row[:] for row in board]
            flipped = OthelloGame.make_move(temp_board, move[0], move[1], player)
            if len(flipped) > best_score:
                best_score = len(flipped)
                best_move = move
                
        return best_move
    
    @staticmethod
    def _minimax_move(board: List[List[int]], player: int, valid_moves: List[Tuple[int, int]]) -> Tuple[int, int]:
        """Simple minimax with depth 3"""
        best_move = valid_moves[0]
        best_score = float('-inf')
        
        for move in valid_moves:
            temp_board = [row[:] for row in board]
            OthelloGame.make_move(temp_board, move[0], move[1], player)
            score = OthelloAI._minimax(temp_board, 2, False, player)
            if score > best_score:
                best_score = score
                best_move = move
                
        return best_move
    
    @staticmethod
    def _minimax(board: List[List[int]], depth: int, maximizing: bool, player: int) -> int:
        """Minimax algorithm"""
        if depth == 0:
            return OthelloAI._evaluate_board(board, player)
            
        current_player = player if maximizing else (3 - player)
        valid_moves = OthelloGame.get_valid_moves(board, current_player)
        
        if not valid_moves:
            return OthelloAI._evaluate_board(board, player)
            
        if maximizing:
            max_eval = float('-inf')
            for move in valid_moves:
                temp_board = [row[:] for row in board]
                OthelloGame.make_move(temp_board, move[0], move[1], current_player)
                eval_score = OthelloAI._minimax(temp_board, depth - 1, False, player)
                max_eval = max(max_eval, eval_score)
            return max_eval
        else:
            min_eval = float('inf')
            for move in valid_moves:
                temp_board = [row[:] for row in board]
                OthelloGame.make_move(temp_board, move[0], move[1], current_player)
                eval_score = OthelloAI._minimax(temp_board, depth - 1, True, player)
                min_eval = min(min_eval, eval_score)
            return min_eval
    
    @staticmethod
    def _evaluate_board(board: List[List[int]], player: int) -> int:
        """Evaluate board position"""
        score = 0
        opponent = 3 - player
        
        # Count pieces
        player_count = sum(row.count(player) for row in board)
        opponent_count = sum(row.count(opponent) for row in board)
        score += (player_count - opponent_count) * 10
        
        # Corner bonus
        corners = [(0,0), (0,7), (7,0), (7,7)]
        for r, c in corners:
            if board[r][c] == player:
                score += 100
            elif board[r][c] == opponent:
                score -= 100
                
        # Edge bonus
        for i in range(8):
            if board[0][i] == player: score += 20
            if board[7][i] == player: score += 20
            if board[i][0] == player: score += 20
            if board[i][7] == player: score += 20
            
        return score

class OthelloGame:
    """Complete Othello game implementation"""
    
    def __init__(self):
        self.board = [[0 for _ in range(8)] for _ in range(8)]
        self.current_player = 1  # 1 = black (human), 2 = white (AI)
        self.game_over = False
        self.winner = None
        self.reset_board()
        
    def reset_board(self):
        """Reset board to starting position"""
        self.board = [[0 for _ in range(8)] for _ in range(8)]
        self.board[3][3] = 2  # White
        self.board[3][4] = 1  # Black
        self.board[4][3] = 1  # Black
        self.board[4][4] = 2  # White
        self.current_player = 1
        self.game_over = False
        self.winner = None
        
    @staticmethod
    def get_valid_moves(board: List[List[int]], player: int) -> List[Tuple[int, int]]:
        """Get all valid moves for a player"""
        valid_moves = []
        for row in range(8):
            for col in range(8):
                if board[row][col] == 0:  # Empty cell
                    if OthelloGame._is_valid_move(board, row, col, player):
                        valid_moves.append((row, col))
        return valid_moves
    
    @staticmethod
    def _is_valid_move(board: List[List[int]], row: int, col: int, player: int) -> bool:
        """Check if a move is valid"""
        if board[row][col] != 0:
            return False
            
        opponent = 3 - player
        directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            found_opponent = False
            
            while 0 <= r < 8 and 0 <= c < 8:
                if board[r][c] == opponent:
                    found_opponent = True
                elif board[r][c] == player and found_opponent:
                    return True
                else:
                    break
                r += dr
                c += dc
                
        return False
    
    @staticmethod
    def make_move(board: List[List[int]], row: int, col: int, player: int) -> List[Tuple[int, int]]:
        """Make a move and return flipped pieces"""
        if not OthelloGame._is_valid_move(board, row, col, player):
            return []
            
        board[row][col] = player
        flipped = []
        opponent = 3 - player
        directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            to_flip = []
            
            while 0 <= r < 8 and 0 <= c < 8:
                if board[r][c] == opponent:
                    to_flip.append((r, c))
                elif board[r][c] == player and to_flip:
                    for fr, fc in to_flip:
                        board[fr][fc] = player
                        flipped.append((fr, fc))
                    break
                else:
                    break
                r += dr
                c += dc
                
        return flipped
    
    def make_player_move(self, row: int, col: int) -> bool:
        """Make a move for the current player"""
        if self.game_over:
            return False
            
        flipped = self.make_move(self.board, row, col, self.current_player)
        if flipped or (row, col) in self.get_valid_moves(self.board, self.current_player):
            self.current_player = 3 - self.current_player
            self.check_game_over()
            return True
        return False
    
    def check_game_over(self):
        """Check if game is over"""
        player1_moves = self.get_valid_moves(self.board, 1)
        player2_moves = self.get_valid_moves(self.board, 2)
        
        if not player1_moves and not player2_moves:
            self.game_over = True
            player1_count = sum(row.count(1) for row in self.board)
            player2_count = sum(row.count(2) for row in self.board)
            
            if player1_count > player2_count:
                self.winner = 1
            elif player2_count > player1_count:
                self.winner = 2
            else:
                self.winner = 0  # Tie
        elif not self.get_valid_moves(self.board, self.current_player):
            # Current player has no moves, switch
            self.current_player = 3 - self.current_player

class PuzzleGame:
    """Sliding puzzle implementation"""
    
    def __init__(self, level: int):
        self.level = level
        self.size = 3 + (level - 1) // 3  # Size increases every 3 levels
        self.board = []
        self.empty_pos = (self.size - 1, self.size - 1)
        self.moves = 0
        self.solved = False
        self.generate_puzzle()
        
    def generate_puzzle(self):
        """Generate a solvable puzzle"""
        # Create solved state
        self.board = []
        num = 1
        for i in range(self.size):
            row = []
            for j in range(self.size):
                if i == self.size - 1 and j == self.size - 1:
                    row.append(0)  # Empty space
                else:
                    row.append(num)
                    num += 1
            self.board.append(row)
            
        # Shuffle by making random valid moves
        for _ in range(1000):
            self.make_random_move()
            
        self.moves = 0
        self.solved = False
        
    def make_random_move(self):
        """Make a random valid move"""
        valid_moves = self.get_valid_moves()
        if valid_moves:
            move = random.choice(valid_moves)
            self.move_tile(move[0], move[1])
            
    def get_valid_moves(self) -> List[Tuple[int, int]]:
        """Get positions that can move into empty space"""
        moves = []
        empty_r, empty_c = self.empty_pos
        
        # Check adjacent positions
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            r, c = empty_r + dr, empty_c + dc
            if 0 <= r < self.size and 0 <= c < self.size:
                moves.append((r, c))
                
        return moves
    
    def move_tile(self, row: int, col: int) -> bool:
        """Move tile at (row, col) to empty space if valid"""
        if (row, col) not in self.get_valid_moves():
            return False
            
        empty_r, empty_c = self.empty_pos
        
        # Swap tile with empty space
        self.board[empty_r][empty_c] = self.board[row][col]
        self.board[row][col] = 0
        self.empty_pos = (row, col)
        self.moves += 1
        
        # Check if solved
        self.check_solved()
        return True
    
    def check_solved(self):
        """Check if puzzle is solved"""
        num = 1
        for i in range(self.size):
            for j in range(self.size):
                if i == self.size - 1 and j == self.size - 1:
                    if self.board[i][j] != 0:
                        return
                else:
                    if self.board[i][j] != num:
                        return
                    num += 1
        self.solved = True

class NetworkManager:
    """TCP networking for multiplayer"""
    
    def __init__(self):
        self.socket = None
        self.is_host = False
        self.connected = False
        self.opponent_move = None
        
    def create_lobby(self, port: int = 12345) -> str:
        """Create a lobby and return the connection info"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.bind(('localhost', port))
            self.socket.listen(1)
            self.is_host = True
            
            # Start listening thread
            threading.Thread(target=self._accept_connection, daemon=True).start()
            
            return f"localhost:{port}"
        except Exception as e:
            print(f"Error creating lobby: {e}")
            return None
    
    def join_lobby(self, address: str) -> bool:
        """Join a lobby"""
        try:
            host, port = address.split(':')
            port = int(port)
            
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((host, port))
            self.is_host = False
            self.connected = True
            
            # Start receiving thread
            threading.Thread(target=self._receive_messages, daemon=True).start()
            
            return True
        except Exception as e:
            print(f"Error joining lobby: {e}")
            return False
    
    def _accept_connection(self):
        """Accept incoming connection"""
        try:
            client_socket, address = self.socket.accept()
            self.socket = client_socket
            self.connected = True
            
            # Start receiving thread
            threading.Thread(target=self._receive_messages, daemon=True).start()
        except Exception as e:
            print(f"Error accepting connection: {e}")
    
    def _receive_messages(self):
        """Receive messages from opponent"""
        try:
            while self.connected:
                data = self.socket.recv(1024).decode()
                if data:
                    message = json.loads(data)
                    if message['type'] == 'move':
                        self.opponent_move = (message['row'], message['col'])
        except Exception as e:
            print(f"Error receiving messages: {e}")
            self.connected = False
    
    def send_move(self, row: int, col: int):
        """Send move to opponent"""
        if self.connected:
            try:
                message = json.dumps({'type': 'move', 'row': row, 'col': col})
                self.socket.send(message.encode())
            except Exception as e:
                print(f"Error sending move: {e}")
    
    def get_opponent_move(self) -> Optional[Tuple[int, int]]:
        """Get opponent's move if available"""
        if self.opponent_move:
            move = self.opponent_move
            self.opponent_move = None
            return move
        return None
    
    def close(self):
        """Close connection"""
        self.connected = False
        if self.socket:
            self.socket.close()

class Particle:
    def __init__(self, x: float, y: float, vx: float, vy: float, color: Tuple[int, int, int], life: float, size: float = 2):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.color = color
        self.life = life
        self.max_life = life
        self.size = size
        
    def update(self, dt: float):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.life -= dt
        
    def draw(self, screen: pygame.Surface):
        if self.life > 0:
            alpha = int(255 * (self.life / self.max_life))
            color = (*self.color, alpha)
            size = int(self.size * (self.life / self.max_life))
            if size > 0:
                surf = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
                pygame.draw.circle(surf, color, (size, size), size)
                screen.blit(surf, (self.x - size, self.y - size))

class ParticleSystem:
    def __init__(self):
        self.particles: List[Particle] = []
        
    def add_particle(self, x: float, y: float, vx: float, vy: float, color: Tuple[int, int, int], life: float, size: float = 2):
        self.particles.append(Particle(x, y, vx, vy, color, life, size))
        
    def add_explosion(self, x: float, y: float, color: Tuple[int, int, int], count: int = 20):
        for _ in range(count):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(50, 150)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed
            life = random.uniform(0.5, 1.5)
            size = random.uniform(2, 5)
            self.add_particle(x, y, vx, vy, color, life, size)
            
    def add_stars_background(self, width: int, height: int, count: int = 100):
        for _ in range(count):
            x = random.uniform(0, width)
            y = random.uniform(0, height)
            vx = random.uniform(-20, 20)
            vy = random.uniform(-20, 20)
            life = random.uniform(2, 5)
            size = random.uniform(1, 3)
            color = random.choice([COLORS['WHITE'], COLORS['LIGHT_BLUE'], COLORS['GOLD']])
            self.add_particle(x, y, vx, vy, color, life, size)
            
    def update(self, dt: float):
        self.particles = [p for p in self.particles if p.life > 0]
        for particle in self.particles:
            particle.update(dt)
            
    def draw(self, screen: pygame.Surface):
        for particle in self.particles:
            particle.draw(screen)

class AnimatedText:
    def __init__(self, text: str, font: pygame.font.Font, color: Tuple[int, int, int], x: int, y: int):
        self.text = text
        self.font = font
        self.color = color
        self.x = x
        self.y = y
        self.scale = 1.0
        self.alpha = 255
        self.glow_intensity = 0
        self.target_scale = 1.0
        self.target_alpha = 255
        
    def set_glow(self, intensity: float):
        self.glow_intensity = intensity
        
    def animate_scale(self, target: float):
        self.target_scale = target
        
    def animate_alpha(self, target: int):
        self.target_alpha = target
        
    def update(self, dt: float):
        if abs(self.scale - self.target_scale) > 0.01:
            self.scale += (self.target_scale - self.scale) * 5.0 * dt
        else:
            self.scale = self.target_scale
            
        if abs(self.alpha - self.target_alpha) > 1:
            self.alpha += (self.target_alpha - self.alpha) * 5.0 * dt
        else:
            self.alpha = self.target_alpha
            
    def draw(self, screen: pygame.Surface):
        if self.alpha <= 0:
            return
            
        text_surface = self.font.render(self.text, True, self.color)
        
        if self.scale != 1.0:
            new_width = int(text_surface.get_width() * self.scale)
            new_height = int(text_surface.get_height() * self.scale)
            text_surface = pygame.transform.scale(text_surface, (new_width, new_height))
            
        if self.alpha < 255:
            text_surface.set_alpha(int(self.alpha))
            
        if self.glow_intensity > 0:
            glow_surface = text_surface.copy()
            for offset in [(2, 2), (-2, -2), (2, -2), (-2, 2)]:
                screen.blit(glow_surface, (self.x - text_surface.get_width()//2 + offset[0], 
                                         self.y - text_surface.get_height()//2 + offset[1]))
        
        screen.blit(text_surface, (self.x - text_surface.get_width()//2, 
                                  self.y - text_surface.get_height()//2))

class Button:
    def __init__(self, x: int, y: int, width: int, height: int, text: str, font: pygame.font.Font):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font
        self.is_hovered = False
        self.is_pressed = False
        self.scale = 1.0
        self.glow_intensity = 0.0
        self.hover_characters = []
        
    def set_hover_characters(self, characters: List[str]):
        self.hover_characters = characters
        
    def handle_event(self, event: pygame.event.Event) -> bool:
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.is_pressed = True
                return True
        elif event.type == pygame.MOUSEBUTTONUP:
            if self.is_pressed and self.rect.collidepoint(event.pos):
                self.is_pressed = False
                return True
        return False
        
    def update(self, dt: float, mouse_pos: Tuple[int, int]):
        self.is_hovered = self.rect.collidepoint(mouse_pos)
        
        if self.is_hovered:
            self.scale = min(1.1, self.scale + 3.0 * dt)
            self.glow_intensity = min(1.0, self.glow_intensity + 3.0 * dt)
        else:
            self.scale = max(1.0, self.scale - 3.0 * dt)
            self.glow_intensity = max(0.0, self.glow_intensity - 3.0 * dt)
            
    def draw(self, screen: pygame.Surface):
        scaled_width = int(self.rect.width * self.scale)
        scaled_height = int(self.rect.height * self.scale)
        scaled_rect = pygame.Rect(
            self.rect.centerx - scaled_width // 2,
            self.rect.centery - scaled_height // 2,
            scaled_width,
            scaled_height
        )
        
        if self.glow_intensity > 0:
            glow_rect = scaled_rect.inflate(10, 10)
            glow_surface = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
            glow_color = (*COLORS['GOLD'], int(self.glow_intensity * 50))
            pygame.draw.rect(glow_surface, glow_color, (0, 0, glow_rect.width, glow_rect.height), border_radius=5)
            screen.blit(glow_surface, glow_rect.topleft)
        
        pygame.draw.rect(screen, COLORS['DARK_BLUE'], scaled_rect, border_radius=5)
        pygame.draw.rect(screen, COLORS['GOLD'], scaled_rect, 2, border_radius=5)
        
        text_surface = self.font.render(self.text, True, COLORS['GOLD'])
        text_rect = text_surface.get_rect(center=scaled_rect.center)
        screen.blit(text_surface, text_rect)
        
        # Draw hover characters
        if self.is_hovered and self.hover_characters:
            char_y = scaled_rect.bottom + 20
            char_spacing = 120
            start_x = scaled_rect.centerx - (len(self.hover_characters) * char_spacing) // 2
            
            for i, char in enumerate(self.hover_characters):
                char_x = start_x + i * char_spacing
                char_rect = pygame.Rect(char_x, char_y, 100, 80)
                
                pygame.draw.rect(screen, COLORS['GRAY'], char_rect, border_radius=5)
                pygame.draw.rect(screen, COLORS['GOLD'], char_rect, 2, border_radius=5)
                
                char_font = pygame.font.Font(None, 20)
                char_surface = char_font.render(char, True, COLORS['WHITE'])
                char_text_rect = char_surface.get_rect(center=char_rect.center)
                screen.blit(char_surface, char_text_rect)

class InputBox:
    def __init__(self, x: int, y: int, width: int, height: int, font: pygame.font.Font, placeholder: str = ""):
        self.rect = pygame.Rect(x, y, width, height)
        self.font = font
        self.text = ""
        self.placeholder = placeholder
        self.active = False
        self.cursor_visible = True
        self.cursor_timer = 0
        
    def handle_event(self, event: pygame.event.Event) -> bool:
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.active = self.rect.collidepoint(event.pos)
            
        if event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_RETURN:
                return True
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            else:
                self.text += event.unicode
                
        return False
        
    def update(self, dt: float):
        self.cursor_timer += dt
        if self.cursor_timer >= 0.5:
            self.cursor_visible = not self.cursor_visible
            self.cursor_timer = 0
            
    def draw(self, screen: pygame.Surface):
        color = COLORS['GOLD'] if self.active else COLORS['GRAY']
        pygame.draw.rect(screen, COLORS['DARK_BLUE'], self.rect)
        pygame.draw.rect(screen, color, self.rect, 2)
        
        display_text = self.text if self.text else self.placeholder
        text_color = COLORS['WHITE'] if self.text else COLORS['GRAY']
        
        text_surface = self.font.render(display_text, True, text_color)
        screen.blit(text_surface, (self.rect.x + 5, self.rect.y + 5))
        
        if self.active and self.cursor_visible and self.text:
            cursor_x = self.rect.x + 5 + text_surface.get_width()
            pygame.draw.line(screen, COLORS['WHITE'], 
                           (cursor_x, self.rect.y + 5), 
                           (cursor_x, self.rect.bottom - 5), 2)

def draw_star(screen: pygame.Surface, x: int, y: int, points: int, outer_radius: int, inner_radius: int, color: Tuple[int, int, int], filled: bool = False, shining: bool = False):
    """Draw a star with specified number of points"""
    if shining:
        # Draw glow effect
        for i in range(5):
            glow_color = (*COLORS['LIGHT_BLUE'], 50 - i * 10)
            glow_surface = pygame.Surface((outer_radius * 4, outer_radius * 4), pygame.SRCALPHA)
            draw_star_shape(glow_surface, outer_radius * 2, outer_radius * 2, points, outer_radius + i * 3, inner_radius + i * 2, glow_color, True)
            screen.blit(glow_surface, (x - outer_radius * 2, y - outer_radius * 2))
    
    draw_star_shape(screen, x, y, points, outer_radius, inner_radius, color, filled)

def draw_star_shape(surface: pygame.Surface, x: int, y: int, points: int, outer_radius: int, inner_radius: int, color: Tuple[int, int, int], filled: bool):
    """Helper function to draw star shape"""
    star_points = []
    angle_step = math.pi / points
    
    for i in range(points * 2):
        angle = i * angle_step - math.pi / 2
        if i % 2 == 0:
            # Outer point
            px = x + outer_radius * math.cos(angle)
            py = y + outer_radius * math.sin(angle)
        else:
            # Inner point
            px = x + inner_radius * math.cos(angle)
            py = y + inner_radius * math.sin(angle)
        star_points.append((px, py))
    
    if filled:
        pygame.draw.polygon(surface, color, star_points)
    else:
        pygame.draw.polygon(surface, color, star_points, 2)

class StarWarsGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("The Stars - Star Wars Game")
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Fonts
        self.title_font = pygame.font.Font(None, 72)
        self.large_font = pygame.font.Font(None, 48)
        self.medium_font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        
        # Game state
        self.current_state = GameState.MAIN_MENU
        self.game_data = {
            'selected_mode': None,
            'selected_character': None,
            'ai_difficulty': None,
            'puzzle_levels_completed': [False] * 15,  # 15 levels
            'current_puzzle_level': 1,
            'score': 0,
            'lobby_code': '',
            'lobby_name': ''
        }
        
        # Game instances
        self.othello_game = None
        self.puzzle_game = None
        self.network_manager = NetworkManager()
        
        # Particle systems
        self.background_particles = ParticleSystem()
        self.effect_particles = ParticleSystem()
        
        # Initialize background stars
        self.background_particles.add_stars_background(SCREEN_WIDTH, SCREEN_HEIGHT, 150)
        
        # UI elements
        self.buttons = []
        self.animated_texts = []
        self.input_boxes = []
        
        # Transition effects
        self.transition_alpha = 0
        self.transitioning = False
        self.next_state = None
        
        self.setup_current_state()
        
    def setup_current_state(self):
        """Setup UI elements for current state"""
        self.buttons.clear()
        self.animated_texts.clear()
        self.input_boxes.clear()
        
        if self.current_state == GameState.MAIN_MENU:
            self.setup_main_menu()
        elif self.current_state == GameState.MODE_SELECT:
            self.setup_mode_select()
        elif self.current_state == GameState.AI_CHARACTER_SELECT:
            self.setup_ai_character_select()
        elif self.current_state == GameState.AI_DIFFICULTY:
            self.setup_ai_difficulty()
        elif self.current_state == GameState.AI_GAME:
            self.setup_ai_game()
        elif self.current_state == GameState.PUZZLE_LEVELS:
            self.setup_puzzle_levels()
        elif self.current_state == GameState.PUZZLE_GAME:
            self.setup_puzzle_game()
        elif self.current_state == GameState.DUO_SELECT:
            self.setup_duo_select()
        elif self.current_state == GameState.DUO_CREATE:
            self.setup_duo_create()
        elif self.current_state == GameState.DUO_JOIN:
            self.setup_duo_join()
        elif self.current_state == GameState.DUO_LOBBY:
            self.setup_duo_lobby()
        elif self.current_state == GameState.DUO_GAME:
            self.setup_duo_game()
            
    def setup_main_menu(self):
        # Title
        title = AnimatedText("THE STARS", self.title_font, COLORS['GOLD'], 
                           SCREEN_WIDTH // 2, 200)
        title.set_glow(1.0)
        self.animated_texts.append(title)
        
        # Subtitle
        subtitle = AnimatedText("A Star Wars Inspired Game", self.medium_font, COLORS['WHITE'],
                              SCREEN_WIDTH // 2, 260)
        self.animated_texts.append(subtitle)
        
        # Millennium Falcon display (NOT clickable)
        falcon_text = AnimatedText("Millennium Falcon", self.medium_font, COLORS['WHITE'],
                                 SCREEN_WIDTH // 2, 400)
        self.animated_texts.append(falcon_text)
        
        # Play button
        play_button = Button(SCREEN_WIDTH // 2 - 100, 500, 200, 60, "PLAY", self.large_font)
        self.buttons.append(play_button)
        
    def setup_mode_select(self):
        # Title
        title = AnimatedText("CHOOSE YOUR PATH", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        title.set_glow(0.8)
        self.animated_texts.append(title)
        
        # Mode buttons centered vertically
        button_width = 200
        button_height = 80
        button_spacing = 100
        start_y = SCREEN_HEIGHT // 2 - (3 * button_height + 2 * button_spacing) // 2
        
        # AI Mode
        ai_button = Button(SCREEN_WIDTH // 2 - button_width // 2, start_y, 
                          button_width, button_height, "AI", self.large_font)
        ai_button.set_hover_characters(["Obi-Wan", "Vader"])
        self.buttons.append(ai_button)
        
        # Puzzle Mode
        puzzle_button = Button(SCREEN_WIDTH // 2 - button_width // 2, 
                             start_y + button_height + button_spacing,
                             button_width, button_height, "PUZZLE", self.large_font)
        puzzle_button.set_hover_characters(["Anakin"])
        self.buttons.append(puzzle_button)
        
        # Duo Mode
        duo_button = Button(SCREEN_WIDTH // 2 - button_width // 2, 
                           start_y + 2 * (button_height + button_spacing),
                           button_width, button_height, "DUO", self.large_font)
        duo_button.set_hover_characters(["R2-D2", "C-3PO"])
        self.buttons.append(duo_button)
        
        # Back button
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_character_select(self):
        title = AnimatedText("AI MODE - Choose Character", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Character buttons
        obi_button = Button(SCREEN_WIDTH // 2 - 250, 300, 200, 100, "Obi-Wan", self.medium_font)
        vader_button = Button(SCREEN_WIDTH // 2 + 50, 300, 200, 100, "Vader", self.medium_font)
        self.buttons.extend([obi_button, vader_button])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_difficulty(self):
        title = AnimatedText("Select Difficulty", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        char_text = AnimatedText(f"Character: {self.game_data['selected_character']}", 
                               self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 150)
        self.animated_texts.append(char_text)
        
        # Difficulty buttons
        padawan_button = Button(SCREEN_WIDTH // 2 - 300, 300, 180, 80, "Padawan", self.medium_font)
        knight_button = Button(SCREEN_WIDTH // 2 - 90, 300, 180, 80, "Jedi Knight", self.medium_font)
        master_button = Button(SCREEN_WIDTH // 2 + 120, 300, 180, 80, "Jedi Master", self.medium_font)
        self.buttons.extend([padawan_button, knight_button, master_button])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_game(self):
        title = AnimatedText("Othello - AI Mode", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        info = AnimatedText(f"Difficulty: {self.game_data['ai_difficulty']} | Character: {self.game_data['selected_character']}", 
                          self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(info)
        
        # Initialize Othello game
        if not self.othello_game:
            self.othello_game = OthelloGame()
            
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        new_game_button = Button(SCREEN_WIDTH - 170, SCREEN_HEIGHT - 80, 120, 50, "NEW GAME", self.medium_font)
        self.buttons.extend([back_button, new_game_button])
        
    def setup_puzzle_levels(self):
        title = AnimatedText("Puzzle Levels - Anakin Skywalker", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 80)
        self.animated_texts.append(title)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_puzzle_game(self):
        title = AnimatedText(f"Puzzle Level {self.game_data['current_puzzle_level']}", 
                           self.large_font, COLORS['GOLD'], SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        # Initialize puzzle game
        if not self.puzzle_game:
            self.puzzle_game = PuzzleGame(self.game_data['current_puzzle_level'])
            
        moves_text = AnimatedText(f"Moves: {self.puzzle_game.moves if self.puzzle_game else 0}", 
                                self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(moves_text)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        new_puzzle_button = Button(SCREEN_WIDTH - 170, SCREEN_HEIGHT - 80, 120, 50, "NEW PUZZLE", self.medium_font)
        self.buttons.extend([back_button, new_puzzle_button])
        
    def setup_duo_select(self):
        title = AnimatedText("DUO MODE - Multiplayer", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        create_button = Button(SCREEN_WIDTH // 2 - 250, 300, 200, 100, "CREATE LOBBY", self.medium_font)
        join_button = Button(SCREEN_WIDTH // 2 + 50, 300, 200, 100, "JOIN LOBBY", self.medium_font)
        self.buttons.extend([create_button, join_button])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_create(self):
        title = AnimatedText("Create Lobby", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Input box for lobby code
        lobby_input = InputBox(SCREEN_WIDTH // 2 - 150, 300, 300, 40, self.medium_font, "Enter lobby code...")
        self.input_boxes.append(lobby_input)
        
        create_button = Button(SCREEN_WIDTH // 2 - 100, 400, 200, 60, "CREATE", self.large_font)
        self.buttons.append(create_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_join(self):
        title = AnimatedText("Join Lobby", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Input box for lobby address
        join_input = InputBox(SCREEN_WIDTH // 2 - 150, 300, 300, 40, self.medium_font, "Enter lobby address (host:port)...")
        self.input_boxes.append(join_input)
        
        join_button = Button(SCREEN_WIDTH // 2 - 100, 400, 200, 60, "JOIN", self.large_font)
        self.buttons.append(join_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_lobby(self):
        title = AnimatedText("Lobby", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        if self.network_manager.is_host:
            status_text = AnimatedText("Waiting for player to join...", self.medium_font, COLORS['WHITE'],
                                     SCREEN_WIDTH // 2, 200)
        else:
            status_text = AnimatedText("Connected to lobby!", self.medium_font, COLORS['WHITE'],
                                     SCREEN_WIDTH // 2, 200)
        self.animated_texts.append(status_text)
        
        if self.network_manager.connected:
            start_button = Button(SCREEN_WIDTH // 2 - 100, 400, 200, 60, "START GAME", self.large_font)
            self.buttons.append(start_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_game(self):
        title = AnimatedText("Multiplayer Othello", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        # Initialize multiplayer Othello game
        if not self.othello_game:
            self.othello_game = OthelloGame()
            
        turn_text = "Your turn" if self.othello_game.current_player == 1 else "Opponent's turn"
        turn_display = AnimatedText(turn_text, self.medium_font, COLORS['WHITE'],
                                  SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(turn_display)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def transition_to_state(self, new_state: GameState):
        """Start transition to new state"""
        self.transitioning = True
        self.next_state = new_state
        self.transition_alpha = 0
        
    def handle_events(self):
        for event in pygame.event.Event():
            if event.type == pygame.QUIT:
                self.running = False
                
            # Handle input boxes
            for input_box in self.input_boxes:
                if input_box.handle_event(event):
                    self.handle_input_submit(input_box)
                    
            # Handle button clicks
            for i, button in enumerate(self.buttons):
                if button.handle_event(event):
                    self.handle_button_click(i)
                    
            # Handle game-specific events
            if self.current_state == GameState.AI_GAME and self.othello_game:
                self.handle_othello_click(event)
            elif self.current_state == GameState.PUZZLE_GAME and self.puzzle_game:
                self.handle_puzzle_click(event)
            elif self.current_state == GameState.DUO_GAME and self.othello_game:
                self.handle_multiplayer_othello_click(event)
                
    def handle_input_submit(self, input_box: InputBox):
        """Handle input box submission"""
        if self.current_state == GameState.DUO_CREATE:
            # Create lobby with custom code
            self.game_data['lobby_code'] = input_box.text
            address = self.network_manager.create_lobby()
            if address:
                self.transition_to_state(GameState.DUO_LOBBY)
                
        elif self.current_state == GameState.DUO_JOIN:
            # Join lobby with address
            if self.network_manager.join_lobby(input_box.text):
                self.transition_to_state(GameState.DUO_LOBBY)
                
    def handle_button_click(self, button_index: int):
        """Handle button clicks based on current state"""
        if self.current_state == GameState.MAIN_MENU:
            if button_index == 0:  # Play button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.MODE_SELECT:
            if button_index == 0:  # AI mode
                self.game_data['selected_mode'] = 'ai'
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
            elif button_index == 1:  # Puzzle mode
                self.game_data['selected_mode'] = 'puzzle'
                self.transition_to_state(GameState.PUZZLE_LEVELS)
            elif button_index == 2:  # Duo mode
                self.game_data['selected_mode'] = 'duo'
                self.transition_to_state(GameState.DUO_SELECT)
            elif button_index == 3:  # Back button
                self.transition_to_state(GameState.MAIN_MENU)
                
        elif self.current_state == GameState.AI_CHARACTER_SELECT:
            if button_index == 0:  # Obi-Wan
                self.game_data['selected_character'] = 'Obi-Wan'
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 1:  # Vader
                self.game_data['selected_character'] = 'Vader'
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 2:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.AI_DIFFICULTY:
            difficulties = ['Padawan', 'Jedi Knight', 'Jedi Master']
            if button_index < len(difficulties):
                self.game_data['ai_difficulty'] = difficulties[button_index]
                self.transition_to_state(GameState.AI_GAME)
            elif button_index == 3:  # Back button
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
                
        elif self.current_state == GameState.AI_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 1:  # New game button
                self.othello_game = OthelloGame()
                
        elif self.current_state == GameState.PUZZLE_LEVELS:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.PUZZLE_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.PUZZLE_LEVELS)
            elif button_index == 1:  # New puzzle button
                self.puzzle_game = PuzzleGame(self.game_data['current_puzzle_level'])
                
        elif self.current_state == GameState.DUO_SELECT:
            if button_index == 0:  # Create lobby
                self.transition_to_state(GameState.DUO_CREATE)
            elif button_index == 1:  # Join lobby
                self.transition_to_state(GameState.DUO_JOIN)
            elif button_index == 2:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.DUO_CREATE:
            if button_index == 0:  # Create button
                if self.input_boxes and self.input_boxes[0].text:
                    self.game_data['lobby_code'] = self.input_boxes[0].text
                    address = self.network_manager.create_lobby()
                    if address:
                        self.transition_to_state(GameState.DUO_LOBBY)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_JOIN:
            if button_index == 0:  # Join button
                if self.input_boxes and self.input_boxes[0].text:
                    if self.network_manager.join_lobby(self.input_boxes[0].text):
                        self.transition_to_state(GameState.DUO_LOBBY)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_LOBBY:
            if button_index == 0 and self.network_manager.connected:  # Start game button
                self.transition_to_state(GameState.DUO_GAME)
            elif button_index == -1 or (button_index == 1 if not self.network_manager.connected else button_index == 1):  # Back button
                self.network_manager.close()
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_GAME:
            if button_index == 0:  # Back button
                self.network_manager.close()
                self.transition_to_state(GameState.DUO_LOBBY)
                
    def handle_othello_click(self, event: pygame.event.Event):
        """Handle Othello game clicks"""
        if event.type == pygame.MOUSEBUTTONDOWN and self.othello_game:
            # Calculate board position
            board_size = 400
            board_x = SCREEN_WIDTH // 2 - board_size // 2
            board_y = 200
            cell_size = board_size // 8
            
            mouse_x, mouse_y = event.pos
            if board_x <= mouse_x <= board_x + board_size and board_y <= mouse_y <= board_y + board_size:
                col = (mouse_x - board_x) // cell_size
                row = (mouse_y - board_y) // cell_size
                
                if 0 <= row < 8 and 0 <= col < 8:
                    if self.othello_game.current_player == 1:  # Human turn
                        if self.othello_game.make_player_move(row, col):
                            # AI turn
                            if not self.othello_game.game_over and self.othello_game.current_player == 2:
                                difficulty_map = {'Padawan': 1, 'Jedi Knight': 2, 'Jedi Master': 3}
                                difficulty = difficulty_map.get(self.game_data['ai_difficulty'], 1)
                                ai_move = OthelloAI.get_best_move(self.othello_game.board, 2, difficulty)
                                if ai_move:
                                    self.othello_game.make_player_move(ai_move[0], ai_move[1])
                                    
    def handle_puzzle_click(self, event: pygame.event.Event):
        """Handle puzzle game clicks"""
        if event.type == pygame.MOUSEBUTTONDOWN and self.puzzle_game:
            # Calculate puzzle position
            puzzle_size = 300
            puzzle_x = SCREEN_WIDTH // 2 - puzzle_size // 2
            puzzle_y = 200
            cell_size = puzzle_size // self.puzzle_game.size
            
            mouse_x, mouse_y = event.pos
            if puzzle_x <= mouse_x <= puzzle_x + puzzle_size and puzzle_y <= mouse_y <= puzzle_y + puzzle_size:
                col = (mouse_x - puzzle_x) // cell_size
                row = (mouse_y - puzzle_y) // cell_size
                
                if 0 <= row < self.puzzle_game.size and 0 <= col < self.puzzle_game.size:
                    if self.puzzle_game.move_tile(row, col):
                        if self.puzzle_game.solved:
                            # Mark level as completed
                            level_index = self.game_data['current_puzzle_level'] - 1
                            if level_index < len(self.game_data['puzzle_levels_completed']):
                                self.game_data['puzzle_levels_completed'][level_index] = True
                                
    def handle_multiplayer_othello_click(self, event: pygame.event.Event):
        """Handle multiplayer Othello clicks"""
        if event.type == pygame.MOUSEBUTTONDOWN and self.othello_game:
            # Only allow moves on player's turn
            player_turn = 1 if self.network_manager.is_host else 2
            if self.othello_game.current_player != player_turn:
                return
                
            # Calculate board position
            board_size = 400
            board_x = SCREEN_WIDTH // 2 - board_size // 2
            board_y = 200
            cell_size = board_size // 8
            
            mouse_x, mouse_y = event.pos
            if board_x <= mouse_x <= board_x + board_size and board_y <= mouse_y <= board_y + board_size:
                col = (mouse_x - board_x) // cell_size
                row = (mouse_y - board_y) // cell_size
                
                if 0 <= row < 8 and 0 <= col < 8:
                    if self.othello_game.make_player_move(row, col):
                        # Send move to opponent
                        self.network_manager.send_move(row, col)
                        
    def update(self, dt: float):
        mouse_pos = pygame.mouse.get_pos()
        
        # Update background particles
        self.background_particles.update(dt)
        
        # Continuously add new background stars
        if random.random() < 0.1:
            self.background_particles.add_particle(
                random.uniform(0, SCREEN_WIDTH),
                random.uniform(0, SCREEN_HEIGHT),
                random.uniform(-20, 20),
                random.uniform(-20, 20),
                random.choice([COLORS['WHITE'], COLORS['LIGHT_BLUE'], COLORS['GOLD']]),
                random.uniform(2, 5),
                random.uniform(1, 3)
            )
        
        # Update effect particles
        self.effect_particles.update(dt)
        
        # Update UI elements
        for button in self.buttons:
            button.update(dt, mouse_pos)
            
        for text in self.animated_texts:
            text.update(dt)
            
        for input_box in self.input_boxes:
            input_box.update(dt)
            
        # Update multiplayer
        if self.current_state == GameState.DUO_GAME and self.network_manager.connected:
            opponent_move = self.network_manager.get_opponent_move()
            if opponent_move and self.othello_game:
                self.othello_game.make_player_move(opponent_move[0], opponent_move[1])
                
        # Handle transitions
        if self.transitioning:
            self.transition_alpha += 300 * dt
            if self.transition_alpha >= 255:
                self.transition_alpha = 255
                if self.next_state:
                    self.current_state = self.next_state
                    self.setup_current_state()
                    self.next_state = None
                    self.transition_alpha = 255
                    
        if self.transition_alpha > 0 and not self.transitioning:
            self.transition_alpha -= 300 * dt
            if self.transition_alpha <= 0:
                self.transition_alpha = 0
                
        if self.transition_alpha >= 255:
            self.transitioning = False
            
    def draw_othello_board(self):
        """Draw Othello game board"""
        if not self.othello_game:
            return
            
        board_size = 400
        board_x = SCREEN_WIDTH // 2 - board_size // 2
        board_y = 200
        cell_size = board_size // 8
        
        # Draw board background
        pygame.draw.rect(self.screen, COLORS['DARK_BLUE'], (board_x, board_y, board_size, board_size))
        pygame.draw.rect(self.screen, COLORS['GOLD'], (board_x, board_y, board_size, board_size), 3)
        
        # Draw grid lines
        for i in range(9):
            # Vertical lines
            x = board_x + i * cell_size
            pygame.draw.line(self.screen, COLORS['GOLD'], (x, board_y), (x, board_y + board_size), 1)
            # Horizontal lines
            y = board_y + i * cell_size
            pygame.draw.line(self.screen, COLORS['GOLD'], (board_x, y), (board_x + board_size, y), 1)
            
        # Draw pieces
        for row in range(8):
            for col in range(8):
                piece = self.othello_game.board[row][col]
                if piece != 0:
                    center_x = board_x + col * cell_size + cell_size // 2
                    center_y = board_y + row * cell_size + cell_size // 2
                    radius = cell_size // 3
                    
                    if piece == 1:  # Black piece (human)
                        pygame.draw.circle(self.screen, COLORS['BLACK'], (center_x, center_y), radius)
                        pygame.draw.circle(self.screen, COLORS['WHITE'], (center_x, center_y), radius, 2)
                    else:  # White piece (AI)
                        pygame.draw.circle(self.screen, COLORS['WHITE'], (center_x, center_y), radius)
                        pygame.draw.circle(self.screen, COLORS['BLACK'], (center_x, center_y), radius, 2)
        
        # Highlight valid moves
        if self.othello_game.current_player == 1:  # Human turn
            valid_moves = self.othello_game.get_valid_moves(self.othello_game.board, 1)
            for row, col in valid_moves:
                center_x = board_x + col * cell_size + cell_size // 2
                center_y = board_y + row * cell_size + cell_size // 2
                pygame.draw.circle(self.screen, COLORS['GOLD'], (center_x, center_y), 5)
        
        # Draw score
        black_count = sum(row.count(1) for row in self.othello_game.board)
        white_count = sum(row.count(2) for row in self.othello_game.board)
        
        score_text = f"Black: {black_count}  White: {white_count}"
        score_surface = self.medium_font.render(score_text, True, COLORS['WHITE'])
        score_rect = score_surface.get_rect(center=(SCREEN_WIDTH // 2, board_y + board_size + 30))
        self.screen.blit(score_surface, score_rect)
        
        # Game over message
        if self.othello_game.game_over:
            if self.othello_game.winner == 1:
                winner_text = "You Win!"
                color = COLORS['GREEN']
            elif self.othello_game.winner == 2:
                winner_text = "AI Wins!"
                color = COLORS['RED']
            else:
                winner_text = "It's a Tie!"
                color = COLORS['GOLD']
                
            winner_surface = self.large_font.render(winner_text, True, color)
            winner_rect = winner_surface.get_rect(center=(SCREEN_WIDTH // 2, board_y + board_size + 70))
            self.screen.blit(winner_surface, winner_rect)
    
    def draw_puzzle_board(self):
        """Draw puzzle game board"""
        if not self.puzzle_game:
            return
            
        puzzle_size = 300
        puzzle_x = SCREEN_WIDTH // 2 - puzzle_size // 2
        puzzle_y = 200
        cell_size = puzzle_size // self.puzzle_game.size
        
        # Draw puzzle background
        pygame.draw.rect(self.screen, COLORS['DARK_BLUE'], (puzzle_x, puzzle_y, puzzle_size, puzzle_size))
        pygame.draw.rect(self.screen, COLORS['GOLD'], (puzzle_x, puzzle_y, puzzle_size, puzzle_size), 3)
        
        # Draw tiles
        for row in range(self.puzzle_game.size):
            for col in range(self.puzzle_game.size):
                tile_value = self.puzzle_game.board[row][col]
                tile_x = puzzle_x + col * cell_size
                tile_y = puzzle_y + row * cell_size
                
                if tile_value != 0:  # Not empty space
                    # Draw tile
                    pygame.draw.rect(self.screen, COLORS['GRAY'], (tile_x + 2, tile_y + 2, cell_size - 4, cell_size - 4))
                    pygame.draw.rect(self.screen, COLORS['GOLD'], (tile_x + 2, tile_y + 2, cell_size - 4, cell_size - 4), 2)
                    
                    # Draw number
                    number_surface = self.medium_font.render(str(tile_value), True, COLORS['WHITE'])
                    number_rect = number_surface.get_rect(center=(tile_x + cell_size // 2, tile_y + cell_size // 2))
                    self.screen.blit(number_surface, number_rect)
                else:
                    # Empty space
                    pygame.draw.rect(self.screen, COLORS['DARK_GRAY'], (tile_x + 2, tile_y + 2, cell_size - 4, cell_size - 4))
        
        # Draw grid lines
        for i in range(self.puzzle_game.size + 1):
            # Vertical lines
            x = puzzle_x + i * cell_size
            pygame.draw.line(self.screen, COLORS['GOLD'], (x, puzzle_y), (x, puzzle_y + puzzle_size), 1)
            # Horizontal lines
            y = puzzle_y + i * cell_size
            pygame.draw.line(self.screen, COLORS['GOLD'], (puzzle_x, y), (puzzle_x + puzzle_size, y), 1)
        
        # Solved message
        if self.puzzle_game.solved:
            solved_surface = self.large_font.render("SOLVED!", True, COLORS['GREEN'])
            solved_rect = solved_surface.get_rect(center=(SCREEN_WIDTH // 2, puzzle_y + puzzle_size + 50))
            self.screen.blit(solved_surface, solved_rect)
    
    def draw_puzzle_levels(self):
        """Draw puzzle level selection with stars"""
        levels_per_row = 5
        rows = 3
        start_x = SCREEN_WIDTH // 2 - (levels_per_row * 120) // 2
        start_y = 150
        
        for level in range(1, 16):  # 15 levels
            row = (level - 1) // levels_per_row
            col = (level - 1) % levels_per_row
            
            x = start_x + col * 120
            y = start_y + row * 150
            
            # Star points = level + 2 (so level 1 = 3 points, level 2 = 4 points, etc.)
            star_points = level + 2
            completed = self.game_data['puzzle_levels_completed'][level - 1]
            
            # Draw star
            if completed:
                draw_star(self.screen, x, y, star_points, 30, 15, COLORS['GOLD'], True, True)
            else:
                draw_star(self.screen, x, y, star_points, 30, 15, COLORS['GRAY'], False, False)
            
            # Draw level number
            level_surface = self.small_font.render(str(level), True, COLORS['WHITE'])
            level_rect = level_surface.get_rect(center=(x, y + 50))
            self.screen.blit(level_surface, level_rect)
            
            # Check if clickable
            star_rect = pygame.Rect(x - 35, y - 35, 70, 70)
            mouse_pos = pygame.mouse.get_pos()
            if star_rect.collidepoint(mouse_pos):
                # Highlight on hover
                draw_star(self.screen, x, y, star_points, 35, 18, COLORS['LIGHT_BLUE'], False, False)
                
                # Handle click
                if pygame.mouse.get_pressed()[0]:
                    self.game_data['current_puzzle_level'] = level
                    self.puzzle_game = None  # Reset puzzle game
                    self.transition_to_state(GameState.PUZZLE_GAME)
    
    def draw(self):
        # Clear screen with space background
        self.screen.fill(COLORS['DARK_GRAY'])
        
        # Draw background particles (stars)
        self.background_particles.draw(self.screen)
        
        # Draw game-specific content
        if self.current_state == GameState.AI_GAME:
            self.draw_othello_board()
        elif self.current_state == GameState.PUZZLE_GAME:
            self.draw_puzzle_board()
        elif self.current_state == GameState.PUZZLE_LEVELS:
            self.draw_puzzle_levels()
        elif self.current_state == GameState.DUO_GAME:
            self.draw_othello_board()
        
        # Draw UI elements
        for button in self.buttons:
            button.draw(self.screen)
            
        for text in self.animated_texts:
            text.draw(self.screen)
            
        for input_box in self.input_boxes:
            input_box.draw(self.screen)
        
        # Draw effect particles
        self.effect_particles.draw(self.screen)
        
        # Draw transition overlay
        if self.transition_alpha > 0:
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
            overlay.fill((*COLORS['BLACK'], int(self.transition_alpha)))
            self.screen.blit(overlay, (0, 0))
        
        pygame.display.flip()
        
    def run(self):
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0  # Delta time in seconds
            
            self.handle_events()
            self.update(dt)
            self.draw()
            
        # Cleanup
        self.network_manager.close()
        pygame.quit()

if __name__ == "__main__":
    game = StarWarsGame()
    game.run()
