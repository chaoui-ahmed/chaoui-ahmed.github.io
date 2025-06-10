"use client"

import { useEffect, useState } from "react"
import { Brain, Zap, Target, Clock } from "lucide-react"

interface AIBattleVisualizerProps {
  isActive: boolean
  currentPlayer: "you" | "opponent"
  lastMove: string | null
  thinkingTime: number
  algorithm: string
  moveHistory: Array<{
    player: string
    move: string
    timestamp: number
    evaluation?: number
  }>
}

export function AIBattleVisualizer({
  isActive,
  currentPlayer,
  lastMove,
  thinkingTime,
  algorithm,
  moveHistory,
}: AIBattleVisualizerProps) {
  const [animationPhase, setAnimationPhase] = useState<"thinking" | "moving" | "idle">("idle")

  useEffect(() => {
    if (isActive && currentPlayer === "you") {
      setAnimationPhase("thinking")
      const timer = setTimeout(() => {
        setAnimationPhase("moving")
        setTimeout(() => setAnimationPhase("idle"), 500)
      }, thinkingTime)
      return () => clearTimeout(timer)
    }
  }, [isActive, currentPlayer, thinkingTime])

  if (!isActive) return null

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-purple-400 font-bold flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI BATTLE ANALYSIS
        </h4>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300">{thinkingTime}ms</span>
          </div>

          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-green-300">{algorithm}</span>
          </div>
        </div>
      </div>

      {/* Battle Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className={`p-3 rounded border-2 transition-all ${
            currentPlayer === "you" ? "border-yellow-400 bg-yellow-900/20" : "border-gray-600 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentPlayer === "you" ? "bg-yellow-400 animate-pulse" : "bg-gray-500"
              }`}
            ></div>
            <span className="text-white font-medium">Your AI</span>
          </div>
          <p className="text-xs text-gray-300">{algorithm}</p>
          {animationPhase === "thinking" && currentPlayer === "you" && (
            <div className="flex items-center gap-1 mt-2 text-yellow-400">
              <Zap className="w-3 h-3 animate-pulse" />
              <span className="text-xs">Calculating...</span>
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded border-2 transition-all ${
            currentPlayer === "opponent" ? "border-red-400 bg-red-900/20" : "border-gray-600 bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentPlayer === "opponent" ? "bg-red-400 animate-pulse" : "bg-gray-500"
              }`}
            ></div>
            <span className="text-white font-medium">Opponent AI</span>
          </div>
          <p className="text-xs text-gray-300">Unknown Algorithm</p>
          {currentPlayer === "opponent" && (
            <div className="flex items-center gap-1 mt-2 text-red-400">
              <Zap className="w-3 h-3 animate-pulse" />
              <span className="text-xs">Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Moves */}
      {moveHistory.length > 0 && (
        <div className="bg-gray-800/50 rounded p-3">
          <h5 className="text-purple-300 text-sm font-medium mb-2">Recent Moves</h5>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {moveHistory.slice(-3).map((move, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className={`${move.player === "you" ? "text-yellow-400" : "text-red-400"}`}>
                  {move.player === "you" ? "Your AI" : "Opponent"}: {move.move}
                </span>
                <span className="text-gray-400">{new Date(move.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
