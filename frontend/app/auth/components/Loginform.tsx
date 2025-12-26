"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginSchema, type LoginData } from "../schema"
import { useTransition } from "react"
import { ArrowLeft } from "lucide-react"

export function LoginForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  })

  const [pending, setTransition] = useTransition()

  const submit = async (values: LoginData) => {
    setTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    })

    console.log("logi", values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-600">Sign in to continue your journey</p>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          className="h-9 text-sm"
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          {...register("password")}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className="h-9 text-sm"
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-9 w-full bg-[#5A9C41] hover:bg-[#4a8235] text-white font-semibold text-sm"
      >
        {isSubmitting || pending ? "Signing in..." : "Sign In"}
      </button>

      {/* Register Link */}
      <p className="text-center text-xs text-gray-600">
        New here?{" "}
        <Link href="/auth/signup" className="font-semibold text-[#5A9C41] hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}
