"use client"

import { AINetworkBattle } from "@/components/ai-network-battle"
import type { GameState } from "@/app/page"
import { useRouter } from "next/navigation"

export default function AINetworkBattlePage() {
  const router = useRouter()

  const handleNavigate = (state: GameState) => {
    router.push(`/${state}`)
  }

  return <AINetworkBattle onNavigate={handleNavigate} />
}
