"use client"

import type { ReactNode } from "react"

interface StarWarsButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  disabled?: boolean
}

export function StarWarsButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: StarWarsButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-300 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500"
      case "secondary":
        return "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white border-gray-400 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700"
      case "danger":
        return "bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white border-red-400 hover:from-red-400 hover:via-red-500 hover:to-red-600"
      default:
        return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-300 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500"
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm"
      case "md":
        return "px-6 py-3 text-base"
      case "lg":
        return "px-8 py-4 text-xl"
      case "xl":
        return "px-12 py-6 text-2xl"
      default:
        return "px-6 py-3 text-base"
    }
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        font-bold tracking-wider border-2 rounded-xl
        relative overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        fontFamily: "Orbitron, monospace",
      }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  )
}
