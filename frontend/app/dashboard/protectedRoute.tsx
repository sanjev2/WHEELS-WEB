"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isHydrated } = useAuth()

  useEffect(() => {
    if (isHydrated && !token) router.replace("/auth/login")
  }, [isHydrated, token, router])

  // ✅ Important: do NOT render dashboard until cookies restored
  if (!isHydrated) {
    return <div className="p-10 text-sm text-gray-500">Loading...</div>
  }

  if (!token) return null

  return <>{children}</>
}
