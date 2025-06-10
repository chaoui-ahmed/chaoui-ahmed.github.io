import pygame
import math
import random
import time
import json
import os
from enum import Enum
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass

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
    'PURPLE': (128, 0, 128),
    'CYAN': (0, 255, 255),
    'ORANGE': (255, 165, 0),
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

@dataclass
class GameData:
    selected_mode: Optional[str] = None
    selected_character: Optional[str] = None
    ai_difficulty: Optional[str] = None
    puzzle_level: int = 1
    puzzle_levels_completed: List[bool] = None
    score: int = 0
    lobby_code: str = ""
    lobby_name: str = ""
    
    def __post_init__(self):
        if self.puzzle_levels_completed is None:
            self.puzzle_levels_completed = [False] * 15

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
            size = int(self.size * (self.life / self.max_life))
            if size > 0:
                # Create a surface with per-pixel alpha
                surf = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
                color_with_alpha = (*self.color, alpha)
                pygame.draw.circle(surf, color_with_alpha, (size, size), size)
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
            
    def add_stars_background(self, width: int, height: int, count: int = 200):
        for _ in range(count):
            x = random.uniform(0, width)
            y = random.uniform(0, height)
            vx = random.uniform(-5, 5)
            vy = random.uniform(-5, 5)
            life = random.uniform(3, 8)
            size = random.uniform(1, 4)
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
        self.glow_timer = 0
        
    def set_glow(self, intensity: float):
        self.glow_intensity = intensity
        
    def animate_scale(self, target: float):
        self.target_scale = target
        
    def animate_alpha(self, target: int):
        self.target_alpha = target
        
    def update(self, dt: float):
        self.glow_timer += dt
        
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
            if new_width > 0 and new_height > 0:
                text_surface = pygame.transform.scale(text_surface, (new_width, new_height))
            
        if self.alpha < 255:
            text_surface.set_alpha(int(self.alpha))
            
        # Draw glow effect
        if self.glow_intensity > 0:
            glow_alpha = int(self.glow_intensity * 100 * (0.5 + 0.5 * math.sin(self.glow_timer * 2)))
            glow_surface = text_surface.copy()
            glow_surface.set_alpha(glow_alpha)
            for offset in [(2, 2), (-2, -2), (2, -2), (-2, 2), (0, 3), (0, -3), (3, 0), (-3, 0)]:
                screen.blit(glow_surface, (self.x - text_surface.get_width()//2 + offset[0], 
                                         self.y - text_surface.get_height()//2 + offset[1]))
        
        screen.blit(text_surface, (self.x - text_surface.get_width()//2, 
                                  self.y - text_surface.get_height()//2))

class Button:
    def __init__(self, x: int, y: int, width: int, height: int, text: str, font: pygame.font.Font, 
                 variant: str = "primary", size: str = "md"):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font
        self.variant = variant
        self.size = size
        self.is_hovered = False
        self.is_pressed = False
        self.scale = 1.0
        self.glow_intensity = 0.0
        self.hover_characters = []
        self.animation_timer = 0
        
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
        self.animation_timer += dt
        self.is_hovered = self.rect.collidepoint(mouse_pos)
        
        if self.is_hovered:
            self.scale = min(1.1, self.scale + 3.0 * dt)
            self.glow_intensity = min(1.0, self.glow_intensity + 3.0 * dt)
        else:
            self.scale = max(1.0, self.scale - 3.0 * dt)
            self.glow_intensity = max(0.0, self.glow_intensity - 3.0 * dt)
            
    def get_colors(self):
        if self.variant == "primary":
            return COLORS['GOLD'], COLORS['BLACK']
        elif self.variant == "secondary":
            return COLORS['GRAY'], COLORS['WHITE']
        elif self.variant == "danger":
            return COLORS['RED'], COLORS['WHITE']
        return COLORS['GOLD'], COLORS['BLACK']
            
    def draw(self, screen: pygame.Surface):
        bg_color, text_color = self.get_colors()
        
        scaled_width = int(self.rect.width * self.scale)
        scaled_height = int(self.rect.height * self.scale)
        scaled_rect = pygame.Rect(
            self.rect.centerx - scaled_width // 2,
            self.rect.centery - scaled_height // 2,
            scaled_width,
            scaled_height
        )
        
        # Draw glow effect
        if self.glow_intensity > 0:
            glow_rect = scaled_rect.inflate(20, 20)
            glow_alpha = int(self.glow_intensity * 100)
            glow_surface = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
            glow_color = (*COLORS['GOLD'], glow_alpha)
            pygame.draw.rect(glow_surface, glow_color, (0, 0, glow_rect.width, glow_rect.height), border_radius=10)
            screen.blit(glow_surface, glow_rect.topleft)
        
        # Draw button background with gradient effect
        pygame.draw.rect(screen, bg_color, scaled_rect, border_radius=10)
        pygame.draw.rect(screen, COLORS['GOLD'], scaled_rect, 3, border_radius=10)
        
        # Animated shine effect
        if self.is_hovered:
            shine_x = int(scaled_rect.x + (scaled_rect.width * (0.5 + 0.5 * math.sin(self.animation_timer * 2))))
            shine_rect = pygame.Rect(shine_x - 20, scaled_rect.y, 40, scaled_rect.height)
            shine_surface = pygame.Surface((40, scaled_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(shine_surface, (255, 255, 255, 50), (0, 0, 40, scaled_rect.height))
            screen.blit(shine_surface, shine_rect.topleft)
        
        # Draw text
        text_surface = self.font.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=scaled_rect.center)
        screen.blit(text_surface, text_rect)

class OthelloGame:
    def __init__(self):
        self.board = [[0 for _ in range(8)] for _ in range(8)]
        self.current_player = 1  # 1 = human (black), 2 = AI (white)
        self.game_over = False
        self.winner = None
        self.reset_board()
        
    def reset_board(self):
        self.board = [[0 for _ in range(8)] for _ in range(8)]
        self.board[3][3] = 2  # White
        self.board[3][4] = 1  # Black
        self.board[4][3] = 1  # Black
        self.board[4][4] = 2  # White
        self.current_player = 1
        self.game_over = False
        self.winner = None
        
    def is_valid_move(self, row: int, col: int, player: int) -> bool:
        if self.board[row][col] != 0:
            return False
            
        opponent = 3 - player
        directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            found_opponent = False
            
            while 0 <= r < 8 and 0 <= c < 8:
                if self.board[r][c] == opponent:
                    found_opponent = True
                elif self.board[r][c] == player and found_opponent:
                    return True
                else:
                    break
                r += dr
                c += dc
                
        return False
    
    def make_move(self, row: int, col: int, player: int) -> bool:
        if not self.is_valid_move(row, col, player):
            return False
            
        self.board[row][col] = player
        opponent = 3 - player
        directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            to_flip = []
            
            while 0 <= r < 8 and 0 <= c < 8:
                if self.board[r][c] == opponent:
                    to_flip.append((r, c))
                elif self.board[r][c] == player and to_flip:
                    for fr, fc in to_flip:
                        self.board[fr][fc] = player
                    break
                else:
                    break
                r += dr
                c += dc
                
        self.current_player = 3 - self.current_player
        self.check_game_over()
        return True
    
    def get_valid_moves(self, player: int) -> List[Tuple[int, int]]:
        moves = []
        for row in range(8):
            for col in range(8):
                if self.is_valid_move(row, col, player):
                    moves.append((row, col))
        return moves
    
    def check_game_over(self):
        player1_moves = self.get_valid_moves(1)
        player2_moves = self.get_valid_moves(2)
        
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
        elif not self.get_valid_moves(self.current_player):
            self.current_player = 3 - self.current_player
    
    def get_ai_move(self, difficulty: str) -> Optional[Tuple[int, int]]:
        valid_moves = self.get_valid_moves(2)
        if not valid_moves:
            return None
            
        if difficulty == "padawan":
            return random.choice(valid_moves)
        elif difficulty == "knight":
            # Greedy strategy
            best_move = valid_moves[0]
            best_score = 0
            
            for move in valid_moves:
                temp_game = OthelloGame()
                temp_game.board = [row[:] for row in self.board]
                temp_game.make_move(move[0], move[1], 2)
                score = sum(row.count(2) for row in temp_game.board)
                if score > best_score:
                    best_score = score
                    best_move = move
            return best_move
        else:  # master
            # Prefer corners and edges
            corners = [(r, c) for r, c in valid_moves if (r == 0 or r == 7) and (c == 0 or c == 7)]
            if corners:
                return corners[0]
                
            edges = [(r, c) for r, c in valid_moves if r == 0 or r == 7 or c == 0 or c == 7]
            if edges:
                return edges[0]
                
            return valid_moves[0]

class StarWarsGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("The Stars - Star Wars Game")
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Load fonts
        try:
            self.title_font = pygame.font.Font(None, 72)
            self.large_font = pygame.font.Font(None, 48)
            self.medium_font = pygame.font.Font(None, 36)
            self.small_font = pygame.font.Font(None, 24)
        except:
            # Fallback to default font
            self.title_font = pygame.font.Font(None, 72)
            self.large_font = pygame.font.Font(None, 48)
            self.medium_font = pygame.font.Font(None, 36)
            self.small_font = pygame.font.Font(None, 24)
        
        # Game state
        self.current_state = GameState.MAIN_MENU
        self.game_data = GameData()
        
        # Game instances
        self.othello_game = None
        
        # Particle systems
        self.background_particles = ParticleSystem()
        self.effect_particles = ParticleSystem()
        
        # Initialize background stars
        self.background_particles.add_stars_background(SCREEN_WIDTH, SCREEN_HEIGHT, 300)
        
        # UI elements
        self.buttons = []
        self.animated_texts = []
        
        # Transition effects
        self.transition_alpha = 0
        self.transitioning = False
        self.next_state = None
        
        # AI thinking
        self.ai_thinking = False
        self.ai_think_timer = 0
        
        self.setup_current_state()
        
    def setup_current_state(self):
        """Setup UI elements for current state"""
        self.buttons.clear()
        self.animated_texts.clear()
        
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
    
    def setup_main_menu(self):
        # Title
        title = AnimatedText("THE STARS", self.title_font, COLORS['GOLD'], 
                           SCREEN_WIDTH // 2, 200)
        title.set_glow(1.0)
        self.animated_texts.append(title)
        
        # Play button
        play_button = Button(SCREEN_WIDTH // 2 - 100, 500, 200, 60, "PLAY", self.large_font)
        self.buttons.append(play_button)
        
    def setup_mode_select(self):
        # Title
        title = AnimatedText("CHOOSE YOUR PATH", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        title.set_glow(0.8)
        self.animated_texts.append(title)
        
        # Mode buttons
        ai_button = Button(SCREEN_WIDTH // 2 - 300, 300, 180, 100, "AI BATTLE", self.medium_font)
        puzzle_button = Button(SCREEN_WIDTH // 2 - 90, 300, 180, 100, "TRAINING", self.medium_font)
        duo_button = Button(SCREEN_WIDTH // 2 + 120, 300, 180, 100, "MULTIPLAYER", self.medium_font)
        
        self.buttons.extend([ai_button, puzzle_button, duo_button])
        
        # Back button
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font, "secondary")
        self.buttons.append(back_button)
        
    def setup_ai_character_select(self):
        title = AnimatedText("CHOOSE YOUR CHAMPION", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Character buttons
        jedi_button = Button(SCREEN_WIDTH // 2 - 200, 300, 180, 120, "JEDI MASTER", self.medium_font)
        sith_button = Button(SCREEN_WIDTH // 2 + 20, 300, 180, 120, "SITH LORD", self.medium_font, "danger")
        self.buttons.extend([jedi_button, sith_button])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font, "secondary")
        self.buttons.append(back_button)
        
    def setup_ai_difficulty(self):
        title = AnimatedText("SELECT DIFFICULTY", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        char_text = AnimatedText(f"Character: {self.game_data.selected_character or 'Unknown'}", 
                               self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 150)
        self.animated_texts.append(char_text)
        
        # Difficulty buttons
        padawan_button = Button(SCREEN_WIDTH // 2 - 300, 300, 180, 100, "PADAWAN", self.medium_font)
        knight_button = Button(SCREEN_WIDTH // 2 - 90, 300, 180, 100, "JEDI KNIGHT", self.medium_font)
        master_button = Button(SCREEN_WIDTH // 2 + 120, 300, 180, 100, "JEDI MASTER", self.medium_font)
        self.buttons.extend([padawan_button, knight_button, master_button])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font, "secondary")
        self.buttons.append(back_button)
        
    def setup_ai_game(self):
        title = AnimatedText("OTHELLO BATTLE", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        title.set_glow(0.5)
        self.animated_texts.append(title)
        
        info_text = f"{self.game_data.selected_character or 'Player'} vs AI ({self.game_data.ai_difficulty or 'Unknown'})"
        info = AnimatedText(info_text, self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(info)
        
        # Initialize Othello game
        if not self.othello_game:
            self.othello_game = OthelloGame()
            
        # Status text
        if self.ai_thinking:
            status_text = "AI is thinking..."
        elif self.othello_game.current_player == 1:
            status_text = "Your turn"
        else:
            status_text = "AI turn"
            
        status = AnimatedText(status_text, self.small_font, COLORS['GOLD'], SCREEN_WIDTH // 2, 130)
        self.animated_texts.append(status)
            
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font, "secondary")
        new_game_button = Button(SCREEN_WIDTH - 170, SCREEN_HEIGHT - 80, 120, 50, "NEW GAME", self.medium_font)
        self.buttons.extend([back_button, new_game_button])
        
    def transition_to_state(self, new_state: GameState):
        """Start transition to new state"""
        self.transitioning = True
        self.next_state = new_state
        self.transition_alpha = 0
        
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                
            # Handle button clicks
            for i, button in enumerate(self.buttons):
                if button.handle_event(event):
                    self.handle_button_click(i)
                    
            # Handle game-specific events
            if self.current_state == GameState.AI_GAME and self.othello_game:
                self.handle_othello_click(event)
                
    def handle_button_click(self, button_index: int):
        """Handle button clicks based on current state"""
        if self.current_state == GameState.MAIN_MENU:
            if button_index == 0:  # Play button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.MODE_SELECT:
            if button_index == 0:  # AI mode
                self.game_data.selected_mode = 'ai'
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
            elif button_index == 1:  # Puzzle mode
                self.game_data.selected_mode = 'puzzle'
                print("Puzzle mode not implemented in Python version")
            elif button_index == 2:  # Duo mode
                self.game_data.selected_mode = 'duo'
                print("Duo mode not implemented in Python version")
            elif button_index == 3:  # Back button
                self.transition_to_state(GameState.MAIN_MENU)
                
        elif self.current_state == GameState.AI_CHARACTER_SELECT:
            if button_index == 0:  # Jedi
                self.game_data.selected_character = 'jedi'
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 1:  # Sith
                self.game_data.selected_character = 'sith'
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 2:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.AI_DIFFICULTY:
            difficulties = ['padawan', 'knight', 'master']
            if button_index < len(difficulties):
                self.game_data.ai_difficulty = difficulties[button_index]
                self.transition_to_state(GameState.AI_GAME)
            elif button_index == 3:  # Back button
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
                
        elif self.current_state == GameState.AI_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif button_index == 1:  # New game button
                self.othello_game = OthelloGame()
                self.ai_thinking = False
                
    def handle_othello_click(self, event: pygame.event.Event):
        """Handle Othello game clicks"""
        if event.type == pygame.MOUSEBUTTONDOWN and self.othello_game and not self.ai_thinking:
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
                        if self.othello_game.make_move(row, col, 1):
                            # Start AI thinking
                            if not self.othello_game.game_over and self.othello_game.current_player == 2:
                                self.ai_thinking = True
                                self.ai_think_timer = 0
                                
    def update(self, dt: float):
        mouse_pos = pygame.mouse.get_pos()
        
        # Update background particles
        self.background_particles.update(dt)
        
        # Continuously add new background stars
        if random.random() < 0.05:
            self.background_particles.add_particle(
                random.uniform(0, SCREEN_WIDTH),
                random.uniform(0, SCREEN_HEIGHT),
                random.uniform(-5, 5),
                random.uniform(-5, 5),
                random.choice([COLORS['WHITE'], COLORS['LIGHT_BLUE'], COLORS['GOLD']]),
                random.uniform(3, 8),
                random.uniform(1, 4)
            )
        
        # Update effect particles
        self.effect_particles.update(dt)
        
        # Update UI elements
        for button in self.buttons:
            button.update(dt, mouse_pos)
            
        for text in self.animated_texts:
            text.update(dt)
            
        # Update AI thinking
        if self.ai_thinking and self.othello_game:
            self.ai_think_timer += dt
            if self.ai_think_timer >= 1.0:  # AI thinks for 1 second
                ai_move = self.othello_game.get_ai_move(self.game_data.ai_difficulty or "padawan")
                if ai_move:
                    self.othello_game.make_move(ai_move[0], ai_move[1], 2)
                self.ai_thinking = False
                self.ai_think_timer = 0
                
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
            valid_moves = self.othello_game.get_valid_moves(1)
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
            
    def draw(self):
        # Clear screen with space background
        self.screen.fill(COLORS['DARK_GRAY'])
        
        # Draw background particles (stars)
        self.background_particles.draw(self.screen)
        
        # Draw game-specific content
        if self.current_state == GameState.AI_GAME:
            self.draw_othello_board()
        
        # Draw UI elements
        for button in self.buttons:
            button.draw(self.screen)
            
        for text in self.animated_texts:
            text.draw(self.screen)
        
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
            
        pygame.quit()

if __name__ == "__main__":
    game = StarWarsGame()
    game.run()
