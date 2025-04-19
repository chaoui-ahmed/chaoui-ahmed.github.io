"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { searchEntriesByHashtag, searchEntriesByContent } from "@/lib/storage"
import type { JournalEntry } from "@/types/JournalEntry"

interface SearchBarProps {
  onSearch: (results: JournalEntry[]) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"hashtag" | "content">("hashtag")

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results =
        searchType === "hashtag" ? await searchEntriesByHashtag(searchTerm) : await searchEntriesByContent(searchTerm)
      onSearch(results)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <div className="flex w-full sm:w-auto">
        <Button
          onClick={() => setSearchType("hashtag")}
          className={`flex-1 sm:flex-initial ${searchType === "hashtag" ? "bg-orange-300" : "bg-gray-200"} text-black`}
        >
          Hashtags
        </Button>
        <Button
          onClick={() => setSearchType("content")}
          className={`flex-1 sm:flex-initial ${searchType === "content" ? "bg-orange-300" : "bg-gray-200"} text-black`}
        >
          Contenu
        </Button>
      </div>
      <div className="flex w-full">
        <Input
          placeholder={`Rechercher par ${searchType === "hashtag" ? "hashtag" : "mot"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border-black focus:border-orange-300"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="ml-2 bg-orange-300 hover:bg-orange-400 text-black">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
