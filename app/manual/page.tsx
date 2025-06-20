"use client"

import { useState } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import { ChevronLeft, ChevronRight, Home, Search } from "lucide-react"
import Link from "next/link"

const sections = [
  { id: "getting-started", title: "Getting Started", icon: "🚀" },
  { id: "game-modes", title: "Game Modes", icon: "🎮" },
  { id: "how-to-play", title: "How to Play", icon: "📖" },
  { id: "voice-recognition", title: "Voice Recognition", icon: "🎤" },
  { id: "controls", title: "Controls", icon: "🎯" },
  { id: "characters", title: "Characters", icon: "👥" },
  { id: "tips--strategies", title: "Tips & Strategies", icon: "💡" },
  { id: "troubleshooting", title: "Troubleshooting", icon: "🔧" },
]

export default function ManualPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSections = sections.filter((section) => section.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const nextSection = () => {
    setCurrentSection((prev) => (prev + 1) % sections.length)
  }

  const prevSection = () => {
    setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 text-white">
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <StarWarsButton variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </StarWarsButton>
                </Link>
                <h1 className="text-3xl font-bold text-yellow-400" style={{ fontFamily: "Orbitron, monospace" }}>
                  THE STARS - USER MANUAL
                </h1>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search manual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-yellow-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-black/30 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "Orbitron, monospace" }}>
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {(searchTerm ? filteredSections : sections).map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(sections.findIndex((s) => s.id === section.id))}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentSection === sections.findIndex((s) => s.id === section.id)
                          ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-yellow-400"
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-black/30 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{sections[currentSection]?.icon}</span>
                    <h2 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: "Orbitron, monospace" }}>
                      {sections[currentSection]?.title}
                    </h2>
                  </div>
                  <div className="text-sm text-gray-400">
                    {currentSection + 1} of {sections.length}
                  </div>
                </div>

                {/* Section Content */}
                <div className="prose prose-invert prose-yellow max-w-none">
                  {currentSection === 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-yellow-400">System Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                        <li>Internet connection</li>
                        <li>Microphone (optional, for voice commands)</li>
                        <li>Speakers/headphones (recommended)</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-400">First Launch</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Open the game in your web browser</li>
                        <li>
                          Click <strong>"BEGIN YOUR JOURNEY"</strong> on the main menu
                        </li>
                        <li>Select your preferred game mode</li>
                        <li>Choose your character</li>
                        <li>Start playing!</li>
                      </ol>
                    </div>
                  )}

                  {currentSection === 1 && (
                    <div className="space-y-6">
                      <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-blue-400 mb-3">🤖 AI Battle</h3>
                        <p className="text-gray-300 mb-3">
                          Fight against intelligent AI opponents in strategic Othello battles.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>3 difficulty levels: Padawan, Jedi Knight, Jedi Master</li>
                          <li>Character selection (Luke, Vader, Obi-Wan, etc.)</li>
                          <li>Voice recognition support</li>
                          <li>Real-time move validation</li>
                        </ul>
                      </div>

                      <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">🧩 Training Academy</h3>
                        <p className="text-gray-300 mb-3">
                          Solve challenging sliding puzzles to train your strategic mind.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>15 progressive difficulty levels</li>
                          <li>Star-based completion tracking</li>
                          <li>Multiple grid sizes (3x3 to 5x5)</li>
                          <li>Character-themed puzzles</li>
                        </ul>
                      </div>

                      <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">👥 Multiplayer Arena</h3>
                        <p className="text-gray-300 mb-3">Challenge friends in real-time multiplayer battles.</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>Create or join game lobbies</li>
                          <li>Real-time synchronization</li>
                          <li>Voice recognition support</li>
                          <li>Spectator mode</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentSection === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-yellow-400">Othello Rules (AI Battle & Multiplayer)</h3>
                      <p className="text-gray-300">
                        The Stars uses classic Othello/Reversi rules with a Star Wars theme.
                      </p>

                      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">Objective</h4>
                        <p className="text-gray-300">
                          Control more territory than your opponent when the board is full.
                        </p>
                      </div>

                      <h4 className="font-semibold text-yellow-400">Basic Rules:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Players take turns placing pieces on the 8x8 board</li>
                        <li>You must "capture" opponent pieces by flanking them</li>
                        <li>Captured pieces flip to your color</li>
                        <li>If you can't make a valid move, your turn is skipped</li>
                        <li>Game ends when the board is full or no moves are possible</li>
                      </ol>

                      <h3 className="text-xl font-semibold text-yellow-400">Sliding Puzzle Rules (Training Academy)</h3>
                      <p className="text-gray-300">Arrange numbered tiles in sequential order.</p>
                      <p className="text-gray-300">
                        <strong>Objective:</strong> Arrange tiles from 1 to N in order, with the empty space in the
                        bottom-right.
                      </p>
                    </div>
                  )}

                  {currentSection === 3 && (
                    <div className="space-y-6">
                      <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-red-400 mb-3">🎤 Voice Commands</h3>
                        <p className="text-gray-300 mb-3">Control the game with your voice!</p>

                        <h4 className="font-semibold text-yellow-400 mb-2">Setup:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-300 mb-4">
                          <li>
                            Click the <strong>"Enable Voice"</strong> button during gameplay
                          </li>
                          <li>Allow microphone access when prompted</li>
                          <li>Wait for the "Listening..." indicator</li>
                        </ol>

                        <h4 className="font-semibold text-yellow-400 mb-2">Commands:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>Say coordinates clearly: "A1", "B2", "C3", etc.</li>
                          <li>Letters A-H for columns, numbers 1-8 for rows</li>
                          <li>Speak in English for best recognition</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">Tips for Better Recognition:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>Speak clearly and at normal volume</li>
                          <li>Use a quiet environment</li>
                          <li>Wait for the "Listening..." indicator</li>
                          <li>Pronounce letters and numbers distinctly</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentSection === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-yellow-400">Mouse Controls</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>
                          <strong>Left Click:</strong> Select options, make moves, interact with UI
                        </li>
                        <li>
                          <strong>Hover:</strong> Preview moves and see tooltips
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-400">Keyboard Shortcuts</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>
                          <strong>Spacebar:</strong> Toggle voice recognition (when available)
                        </li>
                        <li>
                          <strong>Escape:</strong> Return to previous screen
                        </li>
                        <li>
                          <strong>Enter:</strong> Confirm selections
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-400">Touch Controls (Mobile)</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>
                          <strong>Tap:</strong> Select and interact
                        </li>
                        <li>
                          <strong>Long Press:</strong> Access context menus
                        </li>
                      </ul>
                    </div>
                  )}

                  {currentSection === 5 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                          <h3 className="text-xl font-semibold text-blue-400 mb-3">Light Side</h3>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-yellow-400">Luke Skywalker</h4>
                              <p className="text-sm text-gray-300 italic">"The Force will be with you"</p>
                              <p className="text-sm text-gray-300">
                                Balanced gameplay style, recommended for beginners
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-yellow-400">Obi-Wan Kenobi</h4>
                              <p className="text-sm text-gray-300 italic">
                                "These aren't the droids you're looking for"
                              </p>
                              <p className="text-sm text-gray-300">Strategic and defensive</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-yellow-400">C-3PO</h4>
                              <p className="text-sm text-gray-300 italic">"The odds of successfully navigating..."</p>
                              <p className="text-sm text-gray-300">Perfect for puzzle modes</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                          <h3 className="text-xl font-semibold text-red-400 mb-3">Dark Side</h3>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-yellow-400">Darth Vader</h4>
                              <p className="text-sm text-gray-300 italic">"I find your lack of faith disturbing"</p>
                              <p className="text-sm text-gray-300">Aggressive and powerful, intimidating presence</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === 6 && (
                    <div className="space-y-6">
                      <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Othello Strategy</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-yellow-400">Early Game:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Control the center squares</li>
                              <li>Avoid giving opponent corner access</li>
                              <li>Think several moves ahead</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-400">End Game:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Count pieces carefully</li>
                              <li>Look for game-ending moves</li>
                              <li>Don't give up until the last piece</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">Puzzle Strategy</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          <li>Work on corners first</li>
                          <li>Create the top row early</li>
                          <li>Use the empty space efficiently</li>
                          <li>Think before moving</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentSection === 7 && (
                    <div className="space-y-6">
                      <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-red-400 mb-3">Common Issues</h3>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-yellow-400">Voice Recognition Not Working:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Check microphone permissions</li>
                              <li>Ensure browser supports Web Speech API</li>
                              <li>Try refreshing the page</li>
                              <li>Use Chrome or Edge for best compatibility</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-yellow-400">Game Running Slowly:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Close other browser tabs</li>
                              <li>Disable browser extensions</li>
                              <li>Check internet connection</li>
                              <li>Try a different browser</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                        <h3 className="text-xl font-semibold text-blue-400 mb-3">Browser Compatibility</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-400">Fully Supported:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Chrome 80+</li>
                              <li>Edge 80+</li>
                              <li>Firefox 75+</li>
                              <li>Safari 14+</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-400">Limited Support:</h4>
                            <ul className="list-disc list-inside text-gray-300">
                              <li>Older browsers may lack voice recognition</li>
                              <li>Some features may be disabled on mobile</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-yellow-400/30">
                  <StarWarsButton onClick={prevSection} disabled={currentSection === 0} variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </StarWarsButton>

                  <div className="text-sm text-gray-400">
                    Page {currentSection + 1} of {sections.length}
                  </div>

                  <StarWarsButton
                    onClick={nextSection}
                    disabled={currentSection === sections.length - 1}
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </StarWarsButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
