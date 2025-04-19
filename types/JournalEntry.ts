export interface JournalEntry {
  id: string
  content: string
  mood: string
  hashtags: string[]
  date: string
  photos?: string[]
}
