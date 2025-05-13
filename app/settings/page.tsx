import { SecuritySettings } from "@/components/settings/security-settings"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64 md:p-8">
        <SecuritySettings />
      </div>
    </div>
  )
}
