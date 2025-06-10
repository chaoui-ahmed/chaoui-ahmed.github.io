# The Stars - Star Wars Game

A comprehensive Star Wars-themed strategy game built with Python and Pygame, featuring multiple game modes including AI battles, puzzle challenges, and multiplayer functionality.

## Features

### 🎮 Game Modes
- **AI Battle**: Play Othello against AI opponents with three difficulty levels
- **Training Academy**: Solve sliding puzzles across 15 challenging levels
- **Multiplayer Arena**: Create or join lobbies for multiplayer battles

### 🎨 Visual Features
- Animated star field background
- Particle effects and animations
- Glowing text and UI elements
- Millennium Falcon animations
- Lightsaber effects
- Smooth transitions between screens

### 🤖 AI Opponents
- **Padawan**: Random move AI for beginners
- **Jedi Knight**: Greedy strategy AI for intermediate players
- **Jedi Master**: Advanced AI with strategic positioning

### 🧩 Puzzle System
- Progressive difficulty sliding puzzles
- Star-based completion tracking
- Increasing grid sizes as you advance
- Visual feedback and animations

## Installation

1. **Install Python 3.7+**
   \`\`\`bash
   python --version  # Should be 3.7 or higher
   \`\`\`

2. **Install Pygame**
   \`\`\`bash
   pip install pygame
   \`\`\`

3. **Run the Game**
   \`\`\`bash
   python run_game.py
   \`\`\`

## Game Controls

- **Mouse**: Navigate menus and interact with games
- **Left Click**: Select options, make moves, and interact with UI elements
- **Keyboard**: Type in input fields for lobby creation/joining
- **ESC**: Close the game (standard window close)

## Game Modes Guide

### AI Battle Mode
1. Choose your character (Jedi Master or Sith Lord)
2. Select AI difficulty level
3. Play Othello against the AI
4. Try to capture more pieces than your opponent

### Training Academy
1. Select from 15 available puzzle levels
2. Solve sliding puzzles by arranging numbers in order
3. Complete levels to unlock stars
4. Progress through increasingly difficult challenges

### Multiplayer Arena
1. **Create Lobby**: Set up a new multiplayer session
2. **Join Lobby**: Enter a lobby code to join existing games
3. Share lobby codes with friends to play together

## Technical Details

### Architecture
- **Game States**: Modular state management system
- **Particle System**: Dynamic background effects
- **Animation System**: Smooth transitions and effects
- **UI Framework**: Custom button and text rendering

### Game Logic
- **Othello Engine**: Complete rule implementation with move validation
- **Puzzle Generator**: Randomized solvable puzzle creation
- **AI System**: Multiple difficulty levels with different strategies

### Performance
- **60 FPS**: Smooth gameplay experience
- **Efficient Rendering**: Optimized drawing and particle systems
- **Memory Management**: Proper cleanup and resource handling

## File Structure

\`\`\`
star-wars-game/
├── star_wars_game_complete.py  # Main game file
├── run_game.py                 # Game launcher
├── requirements.txt            # Python dependencies
└── README.md                  # This file
\`\`\`

## Customization

### Adding New Levels
Modify the `puzzle_levels_completed` list in `GameData` to add more puzzle levels.

### Adjusting AI Difficulty
Edit the AI strategy methods in the `OthelloGame` class to create custom difficulty levels.

### Visual Customization
Modify the `COLORS` dictionary to change the game's color scheme.

## Troubleshooting

### Common Issues

1. **Pygame not found**
   \`\`\`bash
   pip install pygame
   \`\`\`

2. **Game runs slowly**
   - Close other applications
   - Reduce particle count in `add_stars_background()`

3. **Font issues**
   - The game uses system fonts as fallback
   - Install additional fonts if needed

### Performance Tips
- Run on systems with dedicated graphics for best performance
- Ensure Python 3.7+ for optimal compatibility
- Close unnecessary background applications

## Contributing

Feel free to contribute to this project by:
- Adding new game modes
- Improving AI algorithms
- Creating new visual effects
- Optimizing performance
- Adding sound effects

## License

This project is open source and available under the MIT License.

## Credits

- Built with Python and Pygame
- Inspired by Star Wars universe
- Game mechanics based on classic strategy games
- Particle effects and animations for enhanced visual experience

---

**May the Force be with you!** 🌟
