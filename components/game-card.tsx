"use client"

import { motion } from "framer-motion"
import { StarWarsButton } from "@/components/star-wars-button"
import { useState } from "react"

interface GameCardProps {
  title?: string
  character?: string
  showButtons?: boolean
  showStars?: boolean
  starCount?: number
  showLightsaber?: boolean
  isLarge?: boolean
  showCreateLobby?: boolean
  showJoinLobby?: boolean
  className?: string
  buttons?: Array<{ label: string; action: string }>
  onButtonClick?: (action: string) => void
  hoverCharacters?: string[]
  onHover?: (isHovering: boolean) => void
  showPowerGauge?: boolean
  powerLevel?: number
}

export function GameCard({
  title = "THE STARS",
  character,
  showButtons = false,
  showStars = false,
  starCount = 0,
  showLightsaber = false,
  isLarge = false,
  showCreateLobby = false,
  showJoinLobby = false,
  className = "",
  buttons = [],
  onButtonClick,
  hoverCharacters = [],
  onHover,
  showPowerGauge = false,
  powerLevel = 0,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(false)
  }

  const handleButtonClick = (action: string) => {
    onButtonClick?.(action)
  }

  const cardWidth = isLarge ? "w-80" : "w-64"
  const cardHeight = isLarge ? "h-64" : "h-48"

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          ${cardWidth} ${cardHeight} bg-[#071b3f] border-2 border-[#e2af00] rounded-xl p-4 
          cursor-pointer transition-all duration-300 relative overflow-hidden
          ${className}
        `}
        style={{
          boxShadow: isHovered ? "0 0 30px rgba(226, 175, 0, 0.5)" : "0 0 10px rgba(226, 175, 0, 0.2)",
        }}
      >
        {/* Animated background glow */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500"
          />
        )}

        {/* Title */}
        <div className="text-center mb-4 relative z-10">
          <div className="bg-[#e2af00] text-[#071b3f] px-3 py-1 rounded text-sm font-bold inline-block">{title}</div>
        </div>

        {/* Character display */}
        {character && (
          <div className="flex-1 flex items-center justify-center mb-4 relative z-10">
            <div className="w-20 h-20 bg-[#444444] rounded-lg flex items-center justify-center border border-[#e2af00]">
              <span className="text-white text-xs text-center px-2">{character}</span>
            </div>
          </div>
        )}

        {/* Lightsaber effect */}
        {showLightsaber && (
          <div className="flex-1 flex items-center justify-center mb-4 relative z-10">
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: ["0 0 10px #65ddfe", "0 0 20px #65ddfe", "0 0 10px #65ddfe"],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-1 h-16 bg-[#65ddfe] rounded-full"
              />
              <motion.div
                animate={{
                  boxShadow: ["0 0 10px #e2af00", "0 0 20px #e2af00", "0 0 10px #e2af00"],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                className="w-1 h-16 bg-[#e2af00] rounded-full absolute top-0 left-4"
              />
            </div>
          </div>
        )}

        {/* Stars display */}
        {showStars && (
          <div className="flex justify-center mb-4 relative z-10">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  animate={
                    i < starCount
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                  className={`w-4 h-4 ${i < starCount ? "text-[#e2af00]" : "text-[#65ddfe]"}`}
                >
                  ⭐
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Power gauge */}
        {showPowerGauge && (
          <div className="mb-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs">Power:</span>
              <span className="text-[#e2af00] font-bold text-xs">{powerLevel}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${powerLevel}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 rounded-full bg-gradient-to-r from-[#e2af00] to-[#65ddfe]"
                style={{
                  boxShadow: "0 0 10px currentColor",
                }}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        {showButtons && (
          <div className="space-y-2 relative z-10">
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <StarWarsButton
                  key={index}
                  onClick={() => handleButtonClick(button.action)}
                  className="w-full"
                  size="sm"
                >
                  {button.label}
                </StarWarsButton>
              ))
            ) : (
              <>
                <div className="text-center text-white text-xs mb-2">CHOOSE YOUR PATH</div>
                <StarWarsButton onClick={() => handleButtonClick("ai")} className="w-full" size="sm">
                  AI
                </StarWarsButton>
                <StarWarsButton onClick={() => handleButtonClick("puzzle")} className="w-full" size="sm">
                  PUZZLE
                </StarWarsButton>
                <StarWarsButton onClick={() => handleButtonClick("duo")} className="w-full" size="sm">
                  DUO
                </StarWarsButton>
              </>
            )}
          </div>
        )}

        {/* Create lobby buttons */}
        {showCreateLobby && (
          <div className="space-y-2 relative z-10">
            <div className="text-center text-white text-xs mb-2">CREATE A LOBBY</div>
            <StarWarsButton onClick={() => handleButtonClick("solo")} className="w-full" size="sm">
              SOLO 6 vs 1
            </StarWarsButton>
            <StarWarsButton onClick={() => handleButtonClick("alliance")} className="w-full" size="sm">
              ALLIANCE
            </StarWarsButton>
          </div>
        )}

        {/* Join lobby button */}
        {showJoinLobby && (
          <div className="space-y-2 relative z-10">
            <div className="text-center text-white text-xs mb-2">JOIN A LOBBY</div>
            <StarWarsButton onClick={() => handleButtonClick("join")} className="w-full" size="sm">
              JOIN
            </StarWarsButton>
          </div>
        )}
      </motion.div>

      {/* Hover characters display */}
      {isHovered && hoverCharacters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-20"
        >
          {hoverCharacters.map((char, index) => (
            <div
              key={index}
              className="bg-[#071b3f] border border-[#e2af00] rounded-lg p-2 text-white text-xs text-center min-w-[80px]"
            >
              {char}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
