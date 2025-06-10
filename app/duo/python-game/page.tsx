"use client"

import { PythonBridge } from "@/components/python-bridge"
import { useRouter } from "next/navigation"

export default function PythonGamePage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/duo/character-select")
  }

  return <PythonBridge onBack={handleBack} />
}
