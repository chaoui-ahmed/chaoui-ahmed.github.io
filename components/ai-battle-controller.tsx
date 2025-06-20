"use client"

import { useState } from "react"
import { StarWarsButton } from "@/components/star-wars-button"
import { Bot, Play, Pause, RotateCcw, TrendingUp } from "lucide-react"

interface AIBattleControllerProps {
  isConnected: boolean
  onStartBattle: (algorithm: string) => void
  onStopBattle: () => void
  onResetStats: () => void
  battleStats: {
    movesPlayed: number
    averageThinkTime: number
    myAiWins: number
    opponentWins: number
    draws: number
  }
  isActive: boolean
  currentAlgorithm: string
  isThinking: boolean
}

const AI_ALGORITHMS = [
  { value: "Greedy Algorithm", name: "Greedy Algorithm", description: "Fast, captures most pieces immediately" },
  { value: "Minimax (Depth 3)", name: "Minimax (Depth 3)", description: "Strategic, looks 3 moves ahead" },
  { value: "Minimax (Depth 4)", name: "Minimax (Depth 4)", description: "Deep strategy, looks 4 moves ahead" },
  { value: "Monte Carlo", name: "Monte Carlo", description: "Probabilistic, runs random simulations" },
  { value: "Hybrid AI", name: "Hybrid AI", description: "Adaptive, switches strategy based on game phase" },
]

export function AIBattleController({
  isConnected,
  onStartBattle,
  onStopBattle,
  onResetStats,
  battleStats,
  isActive,
  currentAlgorithm,
  isThinking,
}: AIBattleControllerProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Hybrid AI")
  const [battleHistory, setBattleHistory] = useState<
    Array<{
      algorithm: string
      result: "win" | "loss" | "draw"
      moves: number
      timestamp: Date
    }>
  >([])

  const totalGames = battleStats.myAiWins + battleStats.opponentWins + battleStats.draws
  const winRate = totalGames > 0 ? ((battleStats.myAiWins / totalGames) * 100).toFixed(1) : "0"

  const handleStartBattle = () => {
    onStartBattle(selectedAlgorithm)
    setShowModal(false)
  }

  const selectedAlgorithmInfo = AI_ALGORITHMS.find((ai) => ai.value === selectedAlgorithm)

  return (
    <>
      {/* Battle Control Panel */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI BATTLE ARENA
          </h3>

          {isConnected && (
            <div className="flex gap-2">
              {!isActive ? (
                <StarWarsButton
                  onClick={() => setShowModal(true)}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  START BATTLE
                </StarWarsButton>
              ) : (
                <StarWarsButton
                  onClick={onStopBattle}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  STOP
                </StarWarsButton>
              )}

              <StarWarsButton onClick={onResetStats} variant="outline" size="sm" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                RESET
              </StarWarsButton>
            </div>
          )}
        </div>

        {/* Battle Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-900/30 border border-blue-500 rounded p-3">
            <div className="text-2xl font-bold text-blue-400">{battleStats.myAiWins}</div>
            <div className="text-xs text-blue-300">Victories</div>
          </div>

          <div className="bg-red-900/30 border border-red-500 rounded p-3">
            <div className="text-2xl font-bold text-red-400">{battleStats.opponentWins}</div>
            <div className="text-xs text-red-300">Defeats</div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-500 rounded p-3">
            <div className="text-2xl font-bold text-yellow-400">{winRate}%</div>
            <div className="text-xs text-yellow-300">Win Rate</div>
          </div>

          <div className="bg-green-900/30 border border-green-500 rounded p-3">
            <div className="text-2xl font-bold text-green-400">{battleStats.averageThinkTime.toFixed(0)}</div>
            <div className="text-xs text-green-300">Avg Think (ms)</div>
          </div>
        </div>

        {/* Current Battle Info */}
        {isActive && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">
                  <span className="text-yellow-400">Algorithm:</span> {currentAlgorithm}
                </p>
                <p className="text-white text-sm">
                  <span className="text-yellow-400">Moves:</span> {battleStats.movesPlayed}
                </p>
              </div>

              {isThinking && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">AI Thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Configure AI Battle</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-yellow-400 text-sm mb-2">Select Your AI Algorithm</label>
                <div className="space-y-2">
                  {AI_ALGORITHMS.map((ai) => (
                    <label
                      key={ai.value}
                      className="flex items-start gap-3 p-3 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        name="algorithm"
                        value={ai.value}
                        checked={selectedAlgorithm === ai.value}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-white font-medium">{ai.name}</div>
                        <div className="text-gray-300 text-sm">{ai.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500 rounded p-4">
                <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Battle Preview
                </h4>
                <p className="text-blue-200 text-sm mb-2">
                  <strong>{selectedAlgorithmInfo?.name}</strong> vs Opponent's AI
                </p>
                <p className="text-blue-200 text-xs">{selectedAlgorithmInfo?.description}</p>
                <div className="mt-3 text-xs text-blue-300">
                  • Moves will be played automatically • Real-time battle statistics • Watch strategic decisions unfold
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <StarWarsButton onClick={() => setShowModal(false)} variant="outline" size="sm">
                CANCEL
              </StarWarsButton>
              <StarWarsButton onClick={handleStartBattle} size="sm">
                DEPLOY AI
              </StarWarsButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
