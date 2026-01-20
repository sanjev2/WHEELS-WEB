"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import type { LoginData, RegisterData } from "@/app/auth/schema"

export interface User {
  _id?: string
  name: string
  email: string
  contact?: string
  address?: string
  role?: "user" | "admin"
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  signup: (payload: RegisterData) => Promise<void>
  login: (payload: LoginData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_COOKIE = "wheels_user"
const TOKEN_COOKIE = "wheels_token"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = Cookies.get(USER_COOKIE)
    const storedToken = Cookies.get(TOKEN_COOKIE)

    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedToken) setToken(storedToken)

    setIsLoading(false)
  }, [])

  // ✅ SIGNUP (send confirmPassword + role)
  const signup = async (payload: RegisterData) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // ✅ IMPORTANT: backend expects role + confirmPassword
        body: JSON.stringify({
          ...payload,
          role: "user",
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Signup failed")

      // supports: { token, user } OR { user } OR user directly
      const userObj: User = data.user ?? data
      const tokenStr: string | undefined = data.token

      // cookies
      Cookies.set(USER_COOKIE, JSON.stringify(userObj), { expires: 1 })

      if (tokenStr) {
        Cookies.set(TOKEN_COOKIE, tokenStr, { expires: 1 })
        setToken(tokenStr)
      } else {
        Cookies.remove(TOKEN_COOKIE)
        setToken(null)
      }

      setUser(userObj)

      // after signup -> login
      router.push("/auth/login")
    } catch (err: any) {
      throw new Error(err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ LOGIN
// ✅ LOGIN (FIXED for your backend response: { data: user, token })
const login = async (payload: LoginData) => {
  setIsLoading(true)
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    // ✅ If backend returns error message like "User not found"
    if (!res.ok) {
      throw new Error(data?.message || "Login failed")
    }

    // ✅ Your backend returns user inside `data`
    const userObj: User = data.data
    const tokenStr: string = data.token

    if (!tokenStr) throw new Error("Token missing from login response.")
    if (!userObj?.email || !userObj?.name) throw new Error("User missing from login response.")

    Cookies.set(USER_COOKIE, JSON.stringify(userObj), { expires: 1 })
    Cookies.set(TOKEN_COOKIE, tokenStr, { expires: 1 })

    setUser(userObj)
    setToken(tokenStr)

    router.push("/dashboard")
  } catch (err: any) {
    throw new Error(err.message || "Login failed")
  } finally {
    setIsLoading(false)
  }
}

const logout = () => {
  setUser(null)
  setToken(null)

  // Remove on default path
  Cookies.remove(USER_COOKIE)
  Cookies.remove(TOKEN_COOKIE)

  // Remove on root path (most common)
  Cookies.remove(USER_COOKIE, { path: "/" })
  Cookies.remove(TOKEN_COOKIE, { path: "/" })

  // Remove on current path (sometimes cookies were set on /auth)
  Cookies.remove(USER_COOKIE, { path: "/auth" })
  Cookies.remove(TOKEN_COOKIE, { path: "/auth" })

  router.push("/")
}



  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
