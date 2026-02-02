"use client"

import { useAuth } from "@/app/context/auth-contexts"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminSidebar from "./components/AdminSidebar"
import AdminTopbar from "./components/AdminTopbar"
import { isAdminVerified } from "@/app/lib/admin-session"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user || user.role !== "admin") {
      router.replace("/dashboard")
      return
    }

    if (!isAdminVerified()) {
      router.replace("/dashboard")
      return
    }

    setAllowed(true)

    const interval = setInterval(() => {
      if (!isAdminVerified()) router.replace("/dashboard")
    }, 5000)

    return () => clearInterval(interval)
  }, [user, isLoading, router])

  if (isLoading || !allowed) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-6 py-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-800">Checking admin access...</div>
          <div className="text-xs text-gray-500 mt-1">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar in NORMAL flow */}
        <div className="w-[270px] shrink-0">
          <AdminSidebar />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <AdminTopbar />
          <main className="px-6 py-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
