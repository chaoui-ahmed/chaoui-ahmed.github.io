"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import { getAllEntries } from "@/lib/storage"
import { useEffect, useState } from "react"

const moodToScore: { [key: string]: number } = {
  parfait: 5,
  bien: 4,
  ca_va: 3,
  bof: 2,
  pas_ouf: 1,
}

export default function Trends() {
  const [weeklyData, setWeeklyData] = useState([
    { day: "Lun", score: 0 },
    { day: "Mar", score: 0 },
    { day: "Mer", score: 0 },
    { day: "Jeu", score: 0 },
    { day: "Ven", score: 0 },
    { day: "Sam", score: 0 },
    { day: "Dim", score: 0 },
  ])

  useEffect(() => {
    const fetchData = async () => {
      const entries = await getAllEntries()
      if (entries.length > 0) {
        const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
        const moodsByDay = new Map(weekDays.map((day) => [day, [] as number[]]))

        entries.forEach((entry) => {
          const date = new Date(entry.date)
          const day = weekDays[date.getDay()]
          const score = moodToScore[entry.mood] || 0
          moodsByDay.get(day)?.push(score)
        })

        const averageData = weekDays.map((day) => ({
          day: day,
          score: moodsByDay.get(day)?.length
            ? (moodsByDay.get(day)?.reduce((a, b) => a + b, 0) || 0) / (moodsByDay.get(day)?.length || 1)
            : 0,
        }))

        // Réorganiser pour commencer par Lundi
        const mondayIndex = averageData.findIndex((d) => d.day === "Lun")
        const reorderedData = [...averageData.slice(mondayIndex), ...averageData.slice(0, mondayIndex)]

        setWeeklyData(reorderedData)
      }
    }

    fetchData()
  }, [])

  const getBarColor = (score: number) => {
    if (score <= 1) return "#fecaca" // rouge pastel
    if (score <= 2) return "#fed7aa" // orange pastel
    if (score <= 3) return "#fef08a" // jaune pastel
    if (score <= 4) return "#bbf7d0" // vert pastel
    return "#e9d5ff" // violet pastel
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black">Mes Tendances</h1>
        <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">Humeur par Jour de la Semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid black",
                  }}
                />
                <Bar dataKey="score">
                  {weeklyData.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="score" fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
