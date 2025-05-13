"use client"

import { useMemo } from "react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    if (!password) return 0

    let score = 0

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Normalize to 0-4 range
    return Math.min(4, Math.floor(score / 2))
  }, [password])

  const getStrengthLabel = () => {
    if (!password) return "No password"
    switch (strength) {
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return "Very Weak"
    }
  }

  const getStrengthColor = () => {
    switch (strength) {
      case 1:
        return "bg-red-600"
      case 2:
        return "bg-yellow-600"
      case 3:
        return "bg-green-600"
      case 4:
        return "bg-emerald-500"
      default:
        return "bg-red-800"
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-full w-1/4 ${
              index < strength ? getStrengthColor() : "bg-gray-700"
            } ${index > 0 ? "ml-1" : ""}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Password strength: <span className="font-medium text-gray-300">{getStrengthLabel()}</span>
      </p>
    </div>
  )
}
