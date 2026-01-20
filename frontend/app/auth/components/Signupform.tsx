"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerSchema, type RegisterData } from "../schema"
import { useTransition, useState } from "react"
import { useAuth } from "@/app/context/auth-contexts"

export function SignupForm() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()

  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, setTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  })

  const submit = async (values: RegisterData) => {
    setApiError(null)

    setTransition(async () => {
      try {
        await signup(values)
        setSuccess(true)

        setTimeout(() => {
          router.push("/auth/login")
        }, 1500)
      } catch (err: any) {
        setApiError(err.message || "Signup failed")
      }
    })
  }

  if (success) {
    return (
      <div className="success-modal">
        <div className="success-content">
          <div className="success-icon">
            <svg className="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="success-title">Account Created Successfully!</h2>
          <p className="success-message">Welcome to WHEELS! Your account has been created.</p>
          <div className="success-loader">
            <div className="loader-bar"></div>
          </div>
          <p className="success-redirect">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3">
      <div className="text-center space-y-0.5">
        <h1 className="text-lg font-bold text-gray-900">Create Account</h1>
        <p className="text-xs text-gray-600">Join WHEELS to start your journey</p>
      </div>

      {apiError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{apiError}</p>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-medium text-gray-700">
          Full Name
        </label>
        <input id="name" {...register("name")} type="text" autoComplete="name" placeholder="John Doe" className="h-9 text-sm" />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-gray-700">
          Email Address
        </label>
        <input id="email" {...register("email")} type="email" autoComplete="email" placeholder="example@email.com" className="h-9 text-sm" />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="contact" className="text-xs font-medium text-gray-700">
          Contact Number
        </label>
        <input id="contact" {...register("contact")} type="tel" autoComplete="tel" placeholder="+977 9876543210" className="h-9 text-sm" />
        {errors.contact && <p className="text-xs text-red-600">{errors.contact.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="address" className="text-xs font-medium text-gray-700">
          Address
        </label>
        <input id="address" {...register("address")} type="text" autoComplete="street-address" placeholder="123 Main Street, Kathmandu" className="h-9 text-sm" />
        {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-gray-700">
          Password
        </label>
        <input id="password" {...register("password")} type="password" autoComplete="new-password" placeholder="Enter your password" className="h-9 text-sm" />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">
          Confirm Password
        </label>
        <input id="confirmPassword" {...register("confirmPassword")} type="password" autoComplete="new-password" placeholder="Confirm your password" className="h-9 text-sm" />
        {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending || isLoading}
        className="h-9 w-full bg-[#5A9C41] hover:bg-[#4a8235] text-white font-semibold text-sm"
      >
        {isSubmitting || pending || isLoading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[#5A9C41] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
