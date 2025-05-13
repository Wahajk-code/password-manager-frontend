"use client"

import { useState, useEffect } from "react"
import { Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordList } from "@/components/dashboard/password-list"
import { Sidebar } from "@/components/dashboard/sidebar"

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [passwords, setPasswords] = useState([])

  // Fetch passwords from the backend
  useEffect(() => {
    const fetchPasswords = async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch("/passwords/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPasswords(data)
      } else {
        console.error("Failed to fetch passwords")
      }
    }

    fetchPasswords()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Password Vault</h1>

            <div className="relative flex w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                type="search"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-gray-700 bg-gray-800 pl-10 pr-10 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 text-gray-500 hover:text-gray-300"
              >
                <Filter className="h-5 w-5" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <PasswordList passwords={passwords} />
            </TabsContent>
            <TabsContent value="social">
              <PasswordList passwords={passwords.filter(p => p.category === "Social")} />
            </TabsContent>
            <TabsContent value="banking">
              <PasswordList passwords={passwords.filter(p => p.category === "Banking")} />
            </TabsContent>
            <TabsContent value="other">
              <PasswordList passwords={passwords.filter(p => p.category === "Other")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
