import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"
// Ajouter l'import pour SupabaseInitializer
import SupabaseInitializer from "@/components/SupabaseInitializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "✧Camille's Pixels✧",
  description: "Journal intime personnel de Camille",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-white`}>
        {/* Ajouter le composant SupabaseInitializer dans le body, juste avant le Toaster */}
        <SupabaseInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
