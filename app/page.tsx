"use client"

import JournalEntry from "@/components/JournalEntry"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import AuthCheck from "@/components/auth-check"

export default function Home() {
  return (
    <AuthCheck>
      <main className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900">
        <AnimatedBackground />
        <Navbar />
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-black dark:text-white">✧Camille's Pixels✧</h1>
          <JournalEntry />
        </div>
      </main>
    </AuthCheck>
  )
}
