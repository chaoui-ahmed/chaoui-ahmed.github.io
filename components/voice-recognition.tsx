"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2 } from "lucide-react"

interface VoiceRecognitionProps {
  onMoveDetected: (move: string) => void
  validMoves: string[]
  isListening?: boolean
}

export default function VoiceRecognition({ onMoveDetected, validMoves, isListening = true }: VoiceRecognitionProps) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Vérifier si la reconnaissance vocale est disponible
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Voice recognition is not supported by your browser.")
      return
    }

    // Créer l'instance de reconnaissance vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = "en-US"

    recognitionInstance.onstart = () => {
      setListening(true)
      setError(null)
    }

    recognitionInstance.onerror = (event: any) => {
      setError(`Error: ${event.error}`)
      setListening(false)
    }

    recognitionInstance.onend = () => {
      setListening(false)
    }

    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex
      const result = event.results[current]
      const text = result[0].transcript.toLowerCase().trim()
      const currentConfidence = result[0].confidence

      setTranscript(text)
      setConfidence(Math.round(currentConfidence * 100))

      // Traiter uniquement si la confiance est suffisante
      if (currentConfidence > 0.7) {
        const move = extractMoveFromText(text)
        if (move) {
          if (validMoves.includes(move)) {
            speak(`Move played at ${move}`)
            onMoveDetected(move)
          } else {
            speak("Invalid move, try again")
          }
        }
      }
    }

    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [onMoveDetected, validMoves])

  // Démarrer/arrêter l'écoute en fonction de isListening
  useEffect(() => {
    if (recognition) {
      if (isListening && !listening) {
        try {
          recognition.start()
        } catch (e) {
          // Ignorer les erreurs si la reconnaissance est déjà en cours
        }
      } else if (!isListening && listening) {
        recognition.stop()
      }
    }
  }, [isListening, listening, recognition])

  // Fonction pour extraire un coup valide du texte (version simplifiée)
  const extractMoveFromText = (text: string): string | null => {
    // Recherche directe de format "A1", "B2", etc. seulement
    const directMatch = text.match(/\b([a-h])[- ]?([1-8])\b/i)
    if (directMatch) {
      return `${directMatch[1].toUpperCase()}${directMatch[2]}`
    }

    return null
  }

  // Fonction pour la synthèse vocale
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  // Fonction pour annoncer les coups valides
  const announceValidMoves = () => {
    const movesText =
      validMoves.length <= 5
        ? `Valid moves: ${validMoves.join(", ")}`
        : `${validMoves.length} valid moves available, including: ${validMoves.slice(0, 5).join(", ")}`

    speak(movesText)
  }

  return (
    <div className="mt-4 flex flex-col items-center space-y-3">
      <div className="flex space-x-3">
        <Button
          onClick={() => {
            if (listening) {
              recognition.stop()
            } else {
              try {
                recognition.start()
              } catch (e) {
                // Ignorer les erreurs si la reconnaissance est déjà en cours
              }
            }
          }}
          className={`${listening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
          disabled={!!error || !recognition}
        >
          {listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
          {listening ? "Stop listening" : "Activate voice"}
        </Button>

        <Button onClick={announceValidMoves} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Volume2 className="mr-2 h-4 w-4" />
          Valid moves
        </Button>
      </div>

      {listening && (
        <div className="text-sm text-gray-300">
          <p>
            Last command: <span className="text-yellow-400">{transcript || "..."}</span>
          </p>
          {confidence > 0 && (
            <p>
              Confidence: <span className="text-yellow-400">{confidence}%</span>
            </p>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="text-xs text-gray-400 text-center max-w-md">
        <p>Say "A1", "B2", "D4"</p>
      </div>
    </div>
  )
}
