"use client"
import { useNavigate } from "react-router-dom"
import { Users } from "lucide-react"

import { StarWarsButton } from "./ui/star-wars-button"

export const AIDifficulty = () => {
  const navigate = useNavigate()

  const onNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <div className="flex flex-col gap-4">
      <StarWarsButton
        onClick={() => onNavigate("ai/easy")}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 p-6"
      >
        <div className="text-left">
          <div className="font-bold">EASY</div>
          <div className="text-sm opacity-80">Suitable for beginners</div>
        </div>
      </StarWarsButton>

      <StarWarsButton
        onClick={() => onNavigate("ai/normal")}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 p-6"
      >
        <div className="text-left">
          <div className="font-bold">NORMAL</div>
          <div className="text-sm opacity-80">A balanced challenge</div>
        </div>
      </StarWarsButton>

      <StarWarsButton
        onClick={() => onNavigate("ai/hard")}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 p-6"
      >
        <div className="text-left">
          <div className="font-bold">HARD</div>
          <div className="text-sm opacity-80">For experienced players</div>
        </div>
      </StarWarsButton>

      <StarWarsButton
        onClick={() => onNavigate("ai/network-battle")}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 p-6"
      >
        <Users className="w-6 h-6" />
        <div className="text-left">
          <div className="font-bold">NETWORK BATTLE</div>
          <div className="text-sm opacity-80">Battle AIs from other PCs</div>
        </div>
      </StarWarsButton>
    </div>
  )
}
