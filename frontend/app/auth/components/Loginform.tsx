"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { loginSchema, type LoginData } from "../schema"
import { useTransition, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, setTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  })

  const submit = async (values: LoginData) => {
    setApiError(null)
    setTransition(async () => {
      try {
        await login(values)
      } catch (err: any) {
        setApiError(err.message || "Login failed")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-600">Sign in to continue your journey</p>
      </div>

      {apiError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{apiError}</p>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-gray-700">
          Email Address
        </label>
        <input id="email" {...register("email")} type="email" autoComplete="email" placeholder="example@email.com" className="h-9 text-sm" />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-gray-700">
          Password
        </label>
        <input id="password" {...register("password")} type="password" autoComplete="current-password" placeholder="Enter your password" className="h-9 text-sm" />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div className="text-right">
  <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#5A9C41] hover:underline">
    Forgot password?
  </Link>
</div>


      <button
        type="submit"
        disabled={isSubmitting || pending || isLoading}
        className="h-9 w-full bg-[#5A9C41] hover:bg-[#4a8235] text-white font-semibold text-sm"
      >
        {isSubmitting || pending || isLoading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-gray-600">
        New here?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#5A9C41] hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}
