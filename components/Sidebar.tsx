import { CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 p-4 shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">My Journal</h1>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <CalendarDays className="mr-2 h-4 w-4" />
          Entries
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>
    </div>
  )
}
