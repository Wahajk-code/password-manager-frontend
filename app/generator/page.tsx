import { PasswordGenerator } from "@/components/password-generator/password-generator"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function GeneratorPage() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-2xl font-bold text-white md:text-3xl">Password Generator</h1>
          <PasswordGenerator />
        </div>
      </div>
    </div>
  )
}
