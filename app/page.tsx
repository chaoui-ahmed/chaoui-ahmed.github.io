"use client"

import { useState, useEffect } from "react"
import JournalEntry from "@/components/JournalEntry"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import AccessCodeModal from "@/components/AccessCodeModal"
import AccessCodeLogin from "@/components/AccessCodeLogin"
import { getAccessCode } from "@/lib/storage"

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasAccessCode, setHasAccessCode] = useState(false)

  useEffect(() => {
    // Vérifier si un code d'accès existe déjà
    const existingCode = getAccessCode()
    setHasAccessCode(!!existingCode)

    // Si un code existe, on peut initialiser directement
    if (existingCode) {
      setIsInitialized(true)
    }
  }, [])

  const handleAccessCodeComplete = () => {
    setHasAccessCode(true)
    setIsInitialized(true)
  }

  // Si l'utilisateur n'a pas encore de code d'accès, afficher la modal
  if (!hasAccessCode) {
    return (
      <main className="min-h-screen bg-[#f5f5f0]">
        <AnimatedBackground />
        <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-center mb-6 text-black">✧Camille's Pixels✧</h1>
          <AccessCodeModal onComplete={handleAccessCodeComplete} />
        </div>
      </main>
    )
  }

  // Si l'utilisateur n'est pas encore initialisé, afficher la page de connexion
  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-[#f5f5f0]">
        <AnimatedBackground />
        <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-center mb-6 text-black">✧Camille's Pixels✧</h1>
          <AccessCodeLogin onSuccess={() => setIsInitialized(true)} />
        </div>
      </main>
    )
  }

  // Afficher la page principale
  return (
    <main className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-black">✧Camille's Pixels✧</h1>
        <JournalEntry />
      </div>
    </main>
  )
}
