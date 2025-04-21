import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"
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
      <body className={`${inter.className} bg-[#f5f5f0]`}>
        <SupabaseInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
