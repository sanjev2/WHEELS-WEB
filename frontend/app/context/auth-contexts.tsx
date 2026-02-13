"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import Cookies from "js-cookie"
import type { LoginData, RegisterData } from "@/app/auth/schema"
import { authActions } from "@/app/lib/actions/auth-action"

export interface User {
  _id?: string
  name: string
  email: string
  contact?: string
  address?: string
  role?: "user" | "admin"
  createdAt?: string
  updatedAt?: string
  profile_picture?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  signup: (payload: RegisterData) => Promise<void>
  login: (payload: LoginData) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
  isLoading: boolean
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_COOKIE = "wheels_user"
const TOKEN_COOKIE = "wheels_token"

const COOKIE_OPTIONS = {
  expires: 1,
  path: "/",
  sameSite: "lax" as const,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cookies once
  useEffect(() => {
    const storedUser = Cookies.get(USER_COOKIE)
    const storedToken = Cookies.get(TOKEN_COOKIE)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        Cookies.remove(USER_COOKIE, { path: "/" })
      }
    }

    if (storedToken) setToken(storedToken)

    setIsHydrated(true)
  }, [])

  const persist = (nextUser: User | null, nextToken: string | null) => {
    if (nextUser) Cookies.set(USER_COOKIE, JSON.stringify(nextUser), COOKIE_OPTIONS)
    else Cookies.remove(USER_COOKIE, { path: "/" })

    if (nextToken) Cookies.set(TOKEN_COOKIE, nextToken, COOKIE_OPTIONS)
    else Cookies.remove(TOKEN_COOKIE, { path: "/" })

    setUser(nextUser)
    setToken(nextToken)
  }

  const signup = async (payload: RegisterData) => {
    setIsLoading(true)
    try {
      await authActions.signup(payload)
      window.location.href = "/auth/login"
    } finally {
      setIsLoading(false)
    }
  }

  // ⭐⭐⭐ THIS IS THE MAGIC FIX ⭐⭐⭐
  const login = async (payload: LoginData) => {
    setIsLoading(true)
    try {
      const { user: u, token: t } = await authActions.login(payload)
      persist(u, t)

      // Hard reload → same as manual refresh → UI perfect
      window.location.href = "/dashboard"
    } finally {
      setIsLoading(false)
    }
  }

  const refreshMe = async () => {
    const t = Cookies.get(TOKEN_COOKIE)
    if (!t) return
    const me = await authActions.me(t)
    persist(me, t)
  }

  const logout = () => {
    persist(null, null)
    window.location.href = "/"
  }

  const value = useMemo(
    () => ({ user, token, signup, login, logout, refreshMe, isLoading, isHydrated }),
    [user, token, isLoading, isHydrated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
