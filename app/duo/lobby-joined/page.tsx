"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LobbyJoinedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#444444] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e2af00] mb-4">Connexion Réussie</h2>
          <p className="text-white">Vous avez rejoint le lobby</p>
        </div>

        <Card className="bg-[#071b3f] border-2 border-[#e2af00] w-96 mx-auto">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#444444] rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#e2af00]">
                <span className="text-white text-xs">C-3PO</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#444444] rounded p-4">
                <p className="text-[#e2af00] font-bold mb-2">Statut de la Connexion</p>
                <p className="text-white text-sm">✅ Connecté au lobby</p>
                <p className="text-white text-sm">⏳ En attente du début de la partie</p>
              </div>

              <Button
                onClick={() => router.push("/duo/multiplayer-game")}
                className="w-full bg-[#e2af00] hover:bg-[#e3b700] text-[#071b3f] font-bold"
              >
                PRÊT À JOUER
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <button onClick={() => router.push("/duo/join")} className="text-[#e2af00] hover:text-[#e3b700] underline">
            ← Changer de lobby
          </button>
        </div>
      </div>
    </div>
  )
}
