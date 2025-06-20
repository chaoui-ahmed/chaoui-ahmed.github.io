import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import { DynamicBackground } from "@/components/dynamic-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ahmed Chaoui",
  description: "Portfolio d'Ahmed Chaoui - Étudiant en ingénierie",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AC-KylEovDuzrHN7jQGZPoChwnNBrEbUQ.png",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AC-KylEovDuzrHN7jQGZPoChwnNBrEbUQ.png",
        type: "image/png",
      },
    ],
    apple: [{ url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AC-KylEovDuzrHN7jQGZPoChwnNBrEbUQ.png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AC-KylEovDuzrHN7jQGZPoChwnNBrEbUQ.png"
        />
      </head>
      <body className={`${inter.className} relative min-h-screen`}>
        <DynamicBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
