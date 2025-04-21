import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Settings, TrendingUp, Download, PenTool } from "lucide-react"
import Image from "next/image"

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-md p-4 border-b border-black sticky top-0 z-50 dark:bg-gray-800/80 dark:border-gray-700">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="mb-4 sm:mb-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sans%20titre-10-2h0y8ANkFcd9BdM3i40mHIDVvCyfDZ.png"
            alt="Camille's Pixels Logo"
            width={40}
            height={40}
            className="object-contain hover:scale-110 transition-transform"
          />
        </Link>
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
            >
              <PenTool className="mr-2 h-4 w-4" />
              Nouveau Pixel
            </Button>
          </Link>
          <Link href="/entries">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Entrées
            </Button>
          </Link>
          <Link href="/trends">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Tendances
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
            >
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </Link>
          <Link href="/export-import">
            <Button
              variant="ghost"
              className="text-black hover:text-orange-400 dark:text-white dark:hover:text-orange-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter/Importer
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
