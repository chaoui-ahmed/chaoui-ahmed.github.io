"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function DynamicBackground() {
  const [lines, setLines] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>>([])

  useEffect(() => {
    const generateLine = () => {
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      const angle = Math.random() * Math.PI * 2
      const length = 200 + Math.random() * 400 // Lignes plus longues

      return {
        id: Date.now() + Math.random(),
        x1: startX,
        y1: startY,
        x2: startX + Math.cos(angle) * length,
        y2: startY + Math.sin(angle) * length,
      }
    }

    // Générer les lignes initiales
    const initialLines = Array.from({ length: 10 }, generateLine)
    setLines(initialLines)

    const addLine = () => {
      setLines((prevLines) => {
        const newLines = [...prevLines, generateLine()]
        if (newLines.length > 25) {
          // Plus de lignes simultanées
          newLines.shift()
        }
        return newLines
      })
    }

    const interval = setInterval(addLine, 1000) // Plus fréquent
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50/30" />
      <svg className="w-full h-full">
        <AnimatePresence>
          {lines.map((line) => (
            <motion.line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(196, 181, 253, 0.4)" // Opacité augmentée
              strokeWidth="3" // Trait plus épais
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 0.4,
                transition: {
                  duration: 3,
                  ease: "easeInOut",
                },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 1 },
              }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}
