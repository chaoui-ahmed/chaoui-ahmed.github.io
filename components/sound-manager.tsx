"use client"

import { useEffect, useRef, useState } from "react"

interface SoundManagerProps {
  onToggle?: (enabled: boolean) => void
}

export function SoundManager({ onToggle }: SoundManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Create audio element for background music
    audioRef.current = new Audio("/audio/imperial-march.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3

    // Auto-play when component mounts
    const playMusic = async () => {
      if (audioRef.current && soundEnabled) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.log("Auto-play prevented by browser")
        }
      }
    }

    playMusic()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    onToggle?.(newState)

    if (audioRef.current) {
      if (newState) {
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  // Handle user interaction to start music if auto-play failed
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (audioRef.current && soundEnabled && !isPlaying) {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.log("Could not play audio")
        }
      }
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [soundEnabled, isPlaying])

  return (
    <button
      onClick={toggleSound}
      className="fixed top-4 right-4 z-50 bg-gray-800/80 backdrop-blur-sm border border-yellow-400 text-yellow-400 p-3 rounded-lg hover:bg-gray-700/80 transition-all duration-300"
      style={{
        boxShadow: soundEnabled ? "0 0 10px rgba(251, 191, 36, 0.3)" : "none",
      }}
    >
      {soundEnabled ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      )}
    </button>
  )
}
