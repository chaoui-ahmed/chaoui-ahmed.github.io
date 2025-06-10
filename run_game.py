#!/usr/bin/env python3
"""
Star Wars Game Launcher
Run this file to start the Star Wars themed strategy game.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from star_wars_game_complete import StarWarsGame
    
    def main():
        print("🌟 Starting The Stars - Star Wars Game 🌟")
        print("=" * 50)
        print("Controls:")
        print("- Mouse: Navigate menus and interact with games")
        print("- Click: Select options and make moves")
        print("- Type: Enter text in input fields")
        print("- ESC: Close the game")
        print("=" * 50)
        
        try:
            game = StarWarsGame()
            game.run()
        except KeyboardInterrupt:
            print("\nGame interrupted by user")
        except Exception as e:
            print(f"Error running game: {e}")
            print("Make sure you have pygame installed: pip install pygame")
        finally:
            print("Thanks for playing The Stars!")
    
    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install pygame: pip install pygame")
    sys.exit(1)
