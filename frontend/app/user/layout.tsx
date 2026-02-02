"use client"

import { useAuth } from "@/app/context/auth-contexts"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login")
  }, [user, isLoading, router])

  if (!user) return null
  return <>{children}</>
}
