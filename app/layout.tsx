import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GameProvider } from "@/contexts/game-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Stars - Star Wars Game",
  description: "A Star Wars themed strategy game experience",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  )
}
