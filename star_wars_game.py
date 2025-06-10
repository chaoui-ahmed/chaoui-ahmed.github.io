import pygame
import math
import random
import time
from enum import Enum
from typing import List, Tuple, Optional
import json

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
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
}

class GameState(Enum):
    MAIN_MENU = "main_menu"
    MODE_SELECT = "mode_select"
    AI_CHARACTER_SELECT = "ai_character_select"
    AI_DIFFICULTY = "ai_difficulty"
    AI_GAME = "ai_game"
    PUZZLE_CHARACTER = "puzzle_character"
    PUZZLE_LEVELS = "puzzle_levels"
    PUZZLE_GAME = "puzzle_game"
    DUO_SELECT = "duo_select"
    DUO_CREATE = "duo_create"
    DUO_JOIN = "duo_join"
    DUO_LOBBY = "duo_lobby"
    DUO_GAME = "duo_game"

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
                # Create a surface with per-pixel alpha
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
        self.rotation = 0
        self.target_scale = 1.0
        self.target_alpha = 255
        self.glow_intensity = 0
        
    def set_glow(self, intensity: float):
        self.glow_intensity = intensity
        
    def animate_scale(self, target: float, speed: float = 5.0):
        self.target_scale = target
        
    def animate_alpha(self, target: int, speed: float = 5.0):
        self.target_alpha = target
        
    def update(self, dt: float):
        # Smooth scaling
        if abs(self.scale - self.target_scale) > 0.01:
            self.scale += (self.target_scale - self.scale) * 5.0 * dt
        else:
            self.scale = self.target_scale
            
        # Smooth alpha
        if abs(self.alpha - self.target_alpha) > 1:
            self.alpha += (self.target_alpha - self.alpha) * 5.0 * dt
        else:
            self.alpha = self.target_alpha
            
    def draw(self, screen: pygame.Surface):
        if self.alpha <= 0:
            return
            
        # Render text
        text_surface = self.font.render(self.text, True, self.color)
        
        # Apply scaling
        if self.scale != 1.0:
            new_width = int(text_surface.get_width() * self.scale)
            new_height = int(text_surface.get_height() * self.scale)
            text_surface = pygame.transform.scale(text_surface, (new_width, new_height))
            
        # Apply alpha
        if self.alpha < 255:
            text_surface.set_alpha(int(self.alpha))
            
        # Draw glow effect
        if self.glow_intensity > 0:
            glow_surface = text_surface.copy()
            glow_surface.fill((*self.color, int(self.glow_intensity * 100)), special_flags=pygame.BLEND_RGBA_MULT)
            for offset in [(2, 2), (-2, -2), (2, -2), (-2, 2)]:
                screen.blit(glow_surface, (self.x - text_surface.get_width()//2 + offset[0], 
                                         self.y - text_surface.get_height()//2 + offset[1]))
        
        # Draw main text
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
        self.border_width = 2
        
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
        was_hovered = self.is_hovered
        self.is_hovered = self.rect.collidepoint(mouse_pos)
        
        # Animate hover effects
        if self.is_hovered:
            self.scale = min(1.1, self.scale + 3.0 * dt)
            self.glow_intensity = min(1.0, self.glow_intensity + 3.0 * dt)
        else:
            self.scale = max(1.0, self.scale - 3.0 * dt)
            self.glow_intensity = max(0.0, self.glow_intensity - 3.0 * dt)
            
    def draw(self, screen: pygame.Surface):
        # Calculate scaled rect
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
            glow_rect = scaled_rect.inflate(10, 10)
            glow_surface = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
            glow_color = (*COLORS['GOLD'], int(self.glow_intensity * 50))
            pygame.draw.rect(glow_surface, glow_color, (0, 0, glow_rect.width, glow_rect.height), border_radius=5)
            screen.blit(glow_surface, glow_rect.topleft)
        
        # Draw button background
        pygame.draw.rect(screen, COLORS['DARK_BLUE'], scaled_rect, border_radius=5)
        pygame.draw.rect(screen, COLORS['GOLD'], scaled_rect, self.border_width, border_radius=5)
        
        # Draw text
        text_surface = self.font.render(self.text, True, COLORS['GOLD'])
        text_rect = text_surface.get_rect(center=scaled_rect.center)
        screen.blit(text_surface, text_rect)

class GameCard:
    def __init__(self, x: int, y: int, width: int, height: int, title: str, character: str = ""):
        self.rect = pygame.Rect(x, y, width, height)
        self.title = title
        self.character = character
        self.is_hovered = False
        self.scale = 1.0
        self.glow_intensity = 0.0
        self.rotation = 0.0
        self.particles = ParticleSystem()
        
    def update(self, dt: float, mouse_pos: Tuple[int, int]):
        self.is_hovered = self.rect.collidepoint(mouse_pos)
        
        # Animate hover effects
        if self.is_hovered:
            self.scale = min(1.05, self.scale + 2.0 * dt)
            self.glow_intensity = min(1.0, self.glow_intensity + 3.0 * dt)
            # Add hover particles
            if random.random() < 0.3:
                self.particles.add_particle(
                    random.uniform(self.rect.left, self.rect.right),
                    random.uniform(self.rect.top, self.rect.bottom),
                    random.uniform(-20, 20),
                    random.uniform(-20, 20),
                    COLORS['GOLD'],
                    random.uniform(0.5, 1.0),
                    random.uniform(1, 3)
                )
        else:
            self.scale = max(1.0, self.scale - 2.0 * dt)
            self.glow_intensity = max(0.0, self.glow_intensity - 3.0 * dt)
            
        self.particles.update(dt)
        
    def draw(self, screen: pygame.Surface, font: pygame.font.Font):
        # Calculate scaled rect
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
            glow_surface = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
            glow_color = (*COLORS['GOLD'], int(self.glow_intensity * 30))
            pygame.draw.rect(glow_surface, glow_color, (0, 0, glow_rect.width, glow_rect.height), border_radius=10)
            screen.blit(glow_surface, glow_rect.topleft)
        
        # Draw card background
        pygame.draw.rect(screen, COLORS['DARK_BLUE'], scaled_rect, border_radius=10)
        pygame.draw.rect(screen, COLORS['GOLD'], scaled_rect, 3, border_radius=10)
        
        # Draw title
        title_surface = font.render(self.title, True, COLORS['GOLD'])
        title_rect = title_surface.get_rect(centerx=scaled_rect.centerx, y=scaled_rect.y + 10)
        
        # Title background
        title_bg_rect = title_rect.inflate(20, 10)
        pygame.draw.rect(screen, COLORS['GOLD'], title_bg_rect, border_radius=5)
        title_surface = font.render(self.title, True, COLORS['DARK_BLUE'])
        screen.blit(title_surface, title_rect)
        
        # Draw character
        if self.character:
            char_rect = pygame.Rect(scaled_rect.centerx - 40, scaled_rect.centery - 20, 80, 60)
            pygame.draw.rect(screen, COLORS['GRAY'], char_rect, border_radius=5)
            pygame.draw.rect(screen, COLORS['GOLD'], char_rect, 2, border_radius=5)
            
            char_font = pygame.font.Font(None, 24)
            char_surface = char_font.render(self.character, True, COLORS['WHITE'])
            char_text_rect = char_surface.get_rect(center=char_rect.center)
            screen.blit(char_surface, char_text_rect)
        
        # Draw particles
        self.particles.draw(screen)

class LightsaberEffect:
    def __init__(self, x: int, y: int, length: int, color: Tuple[int, int, int]):
        self.x = x
        self.y = y
        self.length = length
        self.color = color
        self.glow_intensity = 1.0
        self.hum_phase = 0.0
        
    def update(self, dt: float):
        self.hum_phase += dt * 5.0
        self.glow_intensity = 0.8 + 0.2 * math.sin(self.hum_phase)
        
    def draw(self, screen: pygame.Surface):
        # Draw glow layers
        for i in range(5):
            alpha = int(self.glow_intensity * 50 * (5 - i) / 5)
            width = 8 + i * 2
            color = (*self.color, alpha)
            
            # Create glow surface
            glow_surface = pygame.Surface((width, self.length), pygame.SRCALPHA)
            pygame.draw.rect(glow_surface, color, (0, 0, width, self.length), border_radius=width//2)
            
            # Draw glow
            screen.blit(glow_surface, (self.x - width//2, self.y))
        
        # Draw core
        pygame.draw.rect(screen, self.color, (self.x - 2, self.y, 4, self.length), border_radius=2)

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
            'puzzle_level': 1,
            'score': 0,
            'lobby_code': '',
            'lobby_name': ''
        }
        
        # Particle systems
        self.background_particles = ParticleSystem()
        self.effect_particles = ParticleSystem()
        
        # Initialize background stars
        self.background_particles.add_stars_background(SCREEN_WIDTH, SCREEN_HEIGHT, 150)
        
        # UI elements
        self.buttons = []
        self.cards = []
        self.animated_texts = []
        
        # Lightsaber effects
        self.lightsabers = []
        
        # Transition effects
        self.transition_alpha = 0
        self.transitioning = False
        self.next_state = None
        
        self.setup_current_state()
        
    def setup_current_state(self):
        """Setup UI elements for current state"""
        self.buttons.clear()
        self.cards.clear()
        self.animated_texts.clear()
        self.lightsabers.clear()
        
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
        elif self.current_state == GameState.PUZZLE_CHARACTER:
            self.setup_puzzle_character()
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
        
        # Millennium Falcon card
        falcon_card = GameCard(SCREEN_WIDTH // 2 - 150, 350, 300, 200, "THE STARS", "Millennium Falcon")
        self.cards.append(falcon_card)
        
        # Play button
        play_button = Button(SCREEN_WIDTH // 2 - 100, 600, 200, 60, "PLAY", self.large_font)
        self.buttons.append(play_button)
        
        # Add some lightsaber effects
        self.lightsabers.append(LightsaberEffect(100, 300, 150, COLORS['LIGHT_BLUE']))
        self.lightsabers.append(LightsaberEffect(SCREEN_WIDTH - 100, 400, 150, COLORS['RED']))
        
    def setup_mode_select(self):
        # Title
        title = AnimatedText("CHOOSE YOUR PATH", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        title.set_glow(0.8)
        self.animated_texts.append(title)
        
        # Mode cards
        modes = [
            ("AI", "Obi-Wan vs Vader", 200),
            ("PUZZLE", "Luke Skywalker", 500),
            ("DUO", "R2-D2 & C-3PO", 800)
        ]
        
        for i, (mode, char, x) in enumerate(modes):
            card = GameCard(x, 250, 250, 300, mode, char)
            self.cards.append(card)
            
        # Back button
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_character_select(self):
        title = AnimatedText("AI MODE - Choose Character", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Character cards
        chars = [("Obi-Wan", 300), ("Vader", 700)]
        for char, x in chars:
            card = GameCard(x, 250, 250, 300, "THE STARS", char)
            self.cards.append(card)
            
        # Lightsaber effects
        self.lightsabers.append(LightsaberEffect(375, 400, 100, COLORS['LIGHT_BLUE']))
        self.lightsabers.append(LightsaberEffect(775, 400, 100, COLORS['RED']))
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_difficulty(self):
        title = AnimatedText("Select Difficulty", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        difficulties = [
            ("Padawan", 250),
            ("Jedi Knight", 500),
            ("Jedi Master", 750)
        ]
        
        for diff, x in difficulties:
            card = GameCard(x, 250, 200, 250, diff, self.game_data['selected_character'])
            self.cards.append(card)
            
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_ai_game(self):
        title = AnimatedText("Othello - AI Mode", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        # Game info
        info = AnimatedText(f"Difficulty: {self.game_data['ai_difficulty']} | Character: {self.game_data['selected_character']}", 
                          self.medium_font, COLORS['WHITE'], SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(info)
        
        # Game board would be drawn here
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_puzzle_character(self):
        title = AnimatedText("PUZZLE MODE", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Anakin card
        anakin_card = GameCard(SCREEN_WIDTH // 2 - 150, 250, 300, 350, "THE STARS", "Anakin Skywalker")
        self.cards.append(anakin_card)
        
        # Crossed lightsabers
        self.lightsabers.append(LightsaberEffect(SCREEN_WIDTH // 2 - 30, 400, 120, COLORS['LIGHT_BLUE']))
        self.lightsabers.append(LightsaberEffect(SCREEN_WIDTH // 2 + 30, 400, 120, COLORS['GOLD']))
        
        start_button = Button(SCREEN_WIDTH // 2 - 100, 650, 200, 60, "START", self.large_font)
        self.buttons.append(start_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_puzzle_levels(self):
        title = AnimatedText("Select Level", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Level cards in 2x2 grid
        levels = [(1, 300, 250), (2, 700, 250), (3, 300, 450), (4, 700, 450)]
        for level, x, y in levels:
            unlocked = level <= self.game_data['puzzle_level']
            card = GameCard(x, y, 200, 150, f"LEVEL {level}", "Anakin" if unlocked else "LOCKED")
            self.cards.append(card)
            
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_puzzle_game(self):
        title = AnimatedText(f"Puzzle Level {self.game_data['puzzle_level']}", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        # Puzzle grid would be drawn here
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_select(self):
        title = AnimatedText("DUO MODE - Multiplayer", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Create/Join cards
        create_card = GameCard(300, 250, 250, 300, "CREATE LOBBY", "R2-D2")
        join_card = GameCard(650, 250, 250, 300, "JOIN LOBBY", "C-3PO")
        self.cards.extend([create_card, join_card])
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_create(self):
        title = AnimatedText("Create Lobby", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # R2-D2 card
        r2d2_card = GameCard(SCREEN_WIDTH // 2 - 150, 200, 300, 200, "THE STARS", "R2-D2")
        self.cards.append(r2d2_card)
        
        # Create button
        create_button = Button(SCREEN_WIDTH // 2 - 100, 500, 200, 60, "CREATE", self.large_font)
        self.buttons.append(create_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_join(self):
        title = AnimatedText("Join Lobby", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # C-3PO card
        c3po_card = GameCard(SCREEN_WIDTH // 2 - 150, 200, 300, 200, "THE STARS", "C-3PO")
        self.cards.append(c3po_card)
        
        # Join button
        join_button = Button(SCREEN_WIDTH // 2 - 100, 500, 200, 60, "JOIN", self.large_font)
        self.buttons.append(join_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_lobby(self):
        title = AnimatedText("Lobby Created", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 100)
        self.animated_texts.append(title)
        
        # Lobby code
        code = self.game_data.get('lobby_code', 'ABC123')
        code_text = AnimatedText(f"Code: {code}", self.large_font, COLORS['GOLD'],
                               SCREEN_WIDTH // 2, 300)
        code_text.set_glow(0.8)
        self.animated_texts.append(code_text)
        
        # Start button
        start_button = Button(SCREEN_WIDTH // 2 - 100, 500, 200, 60, "START GAME", self.large_font)
        self.buttons.append(start_button)
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
    def setup_duo_game(self):
        title = AnimatedText("Multiplayer Game", self.large_font, COLORS['GOLD'],
                           SCREEN_WIDTH // 2, 50)
        self.animated_texts.append(title)
        
        # Player cards
        p1_card = GameCard(200, 200, 200, 150, "PLAYER 1", "R2-D2")
        p2_card = GameCard(800, 200, 200, 150, "PLAYER 2", "C-3PO")
        self.cards.extend([p1_card, p2_card])
        
        # Game area
        game_card = GameCard(SCREEN_WIDTH // 2 - 200, 400, 400, 250, "GAME AREA", "Battle Zone")
        self.cards.append(game_card)
        
        # Crossed lightsabers in game area
        self.lightsabers.append(LightsaberEffect(SCREEN_WIDTH // 2 - 20, 500, 80, COLORS['LIGHT_BLUE']))
        self.lightsabers.append(LightsaberEffect(SCREEN_WIDTH // 2 + 20, 500, 80, COLORS['RED']))
        
        back_button = Button(50, SCREEN_HEIGHT - 80, 120, 50, "BACK", self.medium_font)
        self.buttons.append(back_button)
        
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
                    
            # Handle card clicks
            if event.type == pygame.MOUSEBUTTONDOWN:
                for i, card in enumerate(self.cards):
                    if card.rect.collidepoint(event.pos):
                        self.handle_card_click(i)
                        
    def handle_button_click(self, button_index: int):
        """Handle button clicks based on current state"""
        if self.current_state == GameState.MAIN_MENU:
            if button_index == 0:  # Play button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.MODE_SELECT:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.MAIN_MENU)
                
        elif self.current_state == GameState.AI_CHARACTER_SELECT:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.AI_DIFFICULTY:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
                
        elif self.current_state == GameState.AI_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.AI_DIFFICULTY)
                
        elif self.current_state == GameState.PUZZLE_CHARACTER:
            if button_index == 0:  # Start button
                self.transition_to_state(GameState.PUZZLE_LEVELS)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.PUZZLE_LEVELS:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.PUZZLE_CHARACTER)
                
        elif self.current_state == GameState.PUZZLE_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.PUZZLE_LEVELS)
                
        elif self.current_state == GameState.DUO_SELECT:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.DUO_CREATE:
            if button_index == 0:  # Create button
                self.game_data['lobby_code'] = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))
                self.transition_to_state(GameState.DUO_LOBBY)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_JOIN:
            if button_index == 0:  # Join button
                self.transition_to_state(GameState.DUO_LOBBY)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_LOBBY:
            if button_index == 0:  # Start game button
                self.transition_to_state(GameState.DUO_GAME)
            elif button_index == 1:  # Back button
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.DUO_GAME:
            if button_index == 0:  # Back button
                self.transition_to_state(GameState.DUO_LOBBY)
                
    def handle_card_click(self, card_index: int):
        """Handle card clicks based on current state"""
        if self.current_state == GameState.MAIN_MENU:
            if card_index == 0:  # Millennium Falcon card
                self.transition_to_state(GameState.MODE_SELECT)
                
        elif self.current_state == GameState.MODE_SELECT:
            if card_index == 0:  # AI mode
                self.game_data['selected_mode'] = 'ai'
                self.transition_to_state(GameState.AI_CHARACTER_SELECT)
            elif card_index == 1:  # Puzzle mode
                self.game_data['selected_mode'] = 'puzzle'
                self.transition_to_state(GameState.PUZZLE_CHARACTER)
            elif card_index == 2:  # Duo mode
                self.game_data['selected_mode'] = 'duo'
                self.transition_to_state(GameState.DUO_SELECT)
                
        elif self.current_state == GameState.AI_CHARACTER_SELECT:
            if card_index == 0:  # Obi-Wan
                self.game_data['selected_character'] = 'Obi-Wan'
                self.transition_to_state(GameState.AI_DIFFICULTY)
            elif card_index == 1:  # Vader
                self.game_data['selected_character'] = 'Vader'
                self.transition_to_state(GameState.AI_DIFFICULTY)
                
        elif self.current_state == GameState.AI_DIFFICULTY:
            difficulties = ['Padawan', 'Jedi Knight', 'Jedi Master']
            if card_index < len(difficulties):
                self.game_data['ai_difficulty'] = difficulties[card_index]
                self.transition_to_state(GameState.AI_GAME)
                
        elif self.current_state == GameState.PUZZLE_CHARACTER:
            if card_index == 0:  # Anakin
                self.game_data['selected_character'] = 'Anakin'
                self.transition_to_state(GameState.PUZZLE_LEVELS)
                
        elif self.current_state == GameState.PUZZLE_LEVELS:
            level = card_index + 1
            if level <= self.game_data['puzzle_level']:  # Only if unlocked
                self.game_data['current_puzzle_level'] = level
                self.transition_to_state(GameState.PUZZLE_GAME)
                
        elif self.current_state == GameState.DUO_SELECT:
            if card_index == 0:  # Create lobby
                self.transition_to_state(GameState.DUO_CREATE)
            elif card_index == 1:  # Join lobby
                self.transition_to_state(GameState.DUO_JOIN)
                
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
            
        for card in self.cards:
            card.update(dt, mouse_pos)
            
        for text in self.animated_texts:
            text.update(dt)
            
        for lightsaber in self.lightsabers:
            lightsaber.update(dt)
            
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
            elif self.transition_alpha >= 128 and self.next_state:
                # Halfway through transition, switch states
                pass
                
        if self.transition_alpha > 0 and not self.transitioning:
            self.transition_alpha -= 300 * dt
            if self.transition_alpha <= 0:
                self.transition_alpha = 0
                
        if self.transition_alpha >= 255:
            self.transitioning = False
            
    def draw(self):
        # Clear screen with space background
        self.screen.fill(COLORS['DARK_GRAY'])
        
        # Draw background particles (stars)
        self.background_particles.draw(self.screen)
        
        # Draw lightsaber effects
        for lightsaber in self.lightsabers:
            lightsaber.draw(self.screen)
            
        # Draw cards
        for card in self.cards:
            card.draw(self.screen, self.medium_font)
            
        # Draw buttons
        for button in self.buttons:
            button.draw(self.screen)
            
        # Draw animated texts
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
