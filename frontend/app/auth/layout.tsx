import type React from "react"
import type { Metadata } from "next"
import "../styles/auth.css"

export const metadata: Metadata = {
  title: "Authentication - WHEELS",
  description: "Sign in or create an account",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-container">{children}</div>
}
