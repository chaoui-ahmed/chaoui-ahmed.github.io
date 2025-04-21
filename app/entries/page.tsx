"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import { getAllEntries, getEntriesByDate, type JournalEntry } from "@/lib/storage"
import AnimatedBackground from "@/components/AnimatedBackground"
import Image from "next/image"

export default function Entries() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([])
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    const loadEntries = async () => {
      const allEntries = await getAllEntries()
      setEntries(allEntries)
    }
    loadEntries()
  }, [])

  const handleSearch = (results: JournalEntry[]) => {
    setSearchResults(results)
  }

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      const dayEntries = await getEntriesByDate(selectedDate)
      setSelectedDayEntries(dayEntries)
    } else {
      setSelectedDayEntries([])
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black">Mes Pixels</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Calendrier des Pixels</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} className="rounded-md border-black" />
              {selectedDayEntries.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold">Entrées du {date?.toLocaleDateString("fr-FR")}</h3>
                  {selectedDayEntries.map((entry) => (
                    <div key={entry.id} className="p-2 bg-orange-50 rounded-md">
                      <p className="text-sm">{entry.content.substring(0, 100)}...</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entry.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs bg-orange-200 text-orange-800 px-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {/* Afficher les photos */}
                      {entry.photos && entry.photos.length > 0 && (
                        <div className="mt-2 flex gap-1 overflow-x-auto">
                          {entry.photos.map((photo, i) => (
                            <div key={i} className="relative h-16 w-16 flex-shrink-0">
                              <Image
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${i + 1}`}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Recherche de Pixels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchBar onSearch={handleSearch} />

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((entry) => (
                    <div key={entry.id} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString("fr-FR")}</p>
                      <p className="mt-1">{entry.content.substring(0, 100)}...</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {/* Afficher les photos */}
                      {entry.photos && entry.photos.length > 0 && (
                        <div className="mt-2 flex gap-1 overflow-x-auto">
                          {entry.photos.map((photo, i) => (
                            <div key={i} className="relative h-16 w-16 flex-shrink-0">
                              <Image
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${i + 1}`}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link href="/trends">
                  <Button className="w-full bg-purple-200 hover:bg-purple-300 text-black">
                    Quelles sont mes tendances ?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
