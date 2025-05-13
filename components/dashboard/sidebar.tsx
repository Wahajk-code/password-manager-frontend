"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { KeyRound, LogOut, Settings, Shield, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

function NavItem({ icon: Icon, label, href, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-100",
        active && "bg-gray-800 text-gray-100",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 p-4 transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center justify-center py-4">
            <Shield className="mr-2 h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-white">SecureVault</h1>
          </div>

          <nav className="flex-1 space-y-1">
            <NavItem icon={KeyRound} label="Vault" href="/dashboard" active />
            <NavItem icon={Shield} label="Password Generator" href="/generator" />
            <NavItem icon={Settings} label="Settings" href="/settings" />
          </nav>

          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-400"
              onClick={() => console.log("Logout")}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
