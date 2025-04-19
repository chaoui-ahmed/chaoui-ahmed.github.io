import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function EntriesLoading() {
  return (
    <div className="min-h-screen bg-white">
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
              <Skeleton className="h-[350px] w-full rounded-md" />
            </CardContent>
          </Card>
          <Card className="shadow-md border border-black bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Recherche de Pixels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
