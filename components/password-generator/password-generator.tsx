"use client"

import { useState, useEffect } from "react"
import { Check, Copy, RefreshCw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { generateSecurePassword } from "@/lib/password-utils"

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  // Generate password on initial load and when options change
  useEffect(() => {
    generatePassword()
  }, [length, includeUppercase, includeNumbers, includeSymbols])

  const generatePassword = () => {
    const newPassword = generateSecurePassword(length, includeUppercase, includeNumbers, includeSymbols)
    setPassword(newPassword)
    setCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(password)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  const handleSavePassword = async () => {
    const token = localStorage.getItem("access_token")
    const response = await fetch("/passwords/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Generated Password",
        username: "N/A",
        password,
        category: "Other",
        notes: "Password generated using the password generator",
      }),
    })

    if (response.ok) {
      console.log("Password saved successfully")
    } else {
      const error = await response.json()
      console.error("Failed to save password:", error.detail)
    }
  }

  // Calculate password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "None", color: "bg-gray-700" }

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
    const normalizedScore = Math.min(4, Math.floor(score / 2))

    switch (normalizedScore) {
      case 1:
        return { label: "Weak", color: "bg-red-600" }
      case 2:
        return { label: "Fair", color: "bg-yellow-600" }
      case 3:
        return { label: "Strong", color: "bg-green-600" }
      case 4:
        return { label: "Very Strong", color: "bg-emerald-500" }
      default:
        return { label: "Very Weak", color: "bg-red-800" }
    }
  }

  const strength = getPasswordStrength()

  return (
    <div className="mx-auto max-w-md p-4">
      <Card className="border-gray-800 bg-gray-900 text-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="mr-2 h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl font-bold">Password Generator</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={generatePassword}
              className="h-9 w-9 text-gray-400 hover:text-blue-400"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="sr-only">Generate new password</span>
            </Button>
          </div>
          <CardDescription className="text-gray-400">Create strong, unique passwords for your accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative rounded-md border border-gray-700 bg-gray-800 p-3">
            <p className="break-all pr-10 font-mono text-lg text-white">{password}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="absolute right-2 top-2 h-8 w-8 text-gray-400 hover:text-blue-400"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy password</span>
            </Button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="length" className="text-sm text-gray-400">
                Length: {length} characters
              </Label>
              <div className="flex items-center space-x-2">
                <div className={`h-2.5 w-2.5 rounded-full ${strength.color}`}></div>
                <span className="text-sm font-medium text-gray-300">{strength.label}</span>
              </div>
            </div>
            <Slider
              id="length"
              min={8}
              max={32}
              step={1}
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="cursor-pointer">
                Include Uppercase Letters
              </Label>
              <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="cursor-pointer">
                Include Numbers
              </Label>
              <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="cursor-pointer">
                Include Symbols
              </Label>
              <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            </div>
          </div>

          <Button onClick={copyToClipboard} className="w-full bg-blue-600 text-white hover:bg-blue-700">
            {copied ? "Copied!" : "Copy Password"}
          </Button>

          <Button
            onClick={handleSavePassword}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
          >
            Save Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
