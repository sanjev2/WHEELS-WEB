"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"

import { authApi } from "@/app/lib/api/auth"
import { resetPasswordSchema, type ResetPasswordData } from "../schema"

export default function ResetPasswordPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const token = useMemo(() => sp.get("token") || "", [sp])

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { resetToken: token, newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    form.setValue("resetToken", token)
  }, [token])

  const submit = async (values: ResetPasswordData) => {
    setApiError(null)
    startTransition(async () => {
      try {
        await authApi.resetPassword(values.resetToken, values.newPassword)
        router.push("/auth/login")
      } catch (e: any) {
        setApiError(e.message || "Failed to reset password")
      }
    })
  }

  return (
    <div className="space-y-4">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to login
      </Link>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">Reset Password</h1>
        <p className="text-sm text-gray-400">Choose a new password.</p>
      </div>

      {apiError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {apiError}
        </p>
      )}

      <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">New Password</label>
          <input type="password" {...form.register("newPassword")} />
          {form.formState.errors.newPassword && (
            <p className="text-xs text-red-400">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">Confirm Password</label>
          <input type="password" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={pending}>
          {pending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}
