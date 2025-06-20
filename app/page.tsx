"use client"

import { useState } from "react"
import { ModeSelect } from "@/components/mode-select"
import { AIVsAIBattle } from "@/components/ai-vs-ai-battle"

export default function StarWarsGame() {
  const [currentView, setCurrentView] = useState<string>("mode-select")

  const handleModeSelect = (mode: string) => {
    setCurrentView(mode)
  }

  const handleBack = () => {
    setCurrentView("mode-select")
  }

  return (
    <div className="min-h-screen">
      {currentView === "mode-select" && <ModeSelect onModeSelect={handleModeSelect} />}
      {currentView === "ai-network" && <AIVsAIBattle onBack={handleBack} />}
      {currentView === "ai" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">AI Mode</h1>
            <p className="text-white mb-8">Coming soon...</p>
            <button
              onClick={handleBack}
              className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
      {currentView === "puzzle" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">Puzzle Mode</h1>
            <p className="text-white mb-8">Coming soon...</p>
            <button
              onClick={handleBack}
              className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
      {currentView === "duo" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">Duo Mode</h1>
            <p className="text-white mb-8">Coming soon...</p>
            <button
              onClick={handleBack}
              className="bg-yellow-400 text-black px-6 py-3 rounded font-bold hover:bg-yellow-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
