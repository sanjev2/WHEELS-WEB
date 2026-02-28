"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"

import { authApi } from "@/app/lib/api/auth"
import {
  forgotPasswordSchema,
  verifyResetCodeSchema,
  type ForgotPasswordData,
  type VerifyResetCodeData,
} from "../schema"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const emailForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const codeForm = useForm<VerifyResetCodeData>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: { email: "", code: "" },
  })

  const sendCode = async (values: ForgotPasswordData) => {
    setApiError(null)
    startTransition(async () => {
      try {
        await authApi.forgotPassword(values.email)
        setEmail(values.email)
        codeForm.setValue("email", values.email)
        setStep("code")
      } catch (e: any) {
        setApiError(e.message || "Failed to send code")
      }
    })
  }

  const verifyCode = async (values: VerifyResetCodeData) => {
    setApiError(null)
    startTransition(async () => {
      try {
        const r = await authApi.verifyResetCode(values.email, values.code)
        const resetToken = r?.data?.resetToken
        if (!resetToken) throw new Error("Reset token not received")

        router.push(`/auth/reset-password?token=${encodeURIComponent(resetToken)}`)
      } catch (e: any) {
        setApiError(e.message || "Invalid code")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* back */}
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to login
      </Link>

      {/* title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white">Forgot Password</h1>
        <p className="text-sm text-gray-400">
          {step === "email"
            ? "Enter your email to receive a verification code."
            : "Enter the code sent to your email."}
        </p>
      </div>

      {apiError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {apiError}
        </p>
      )}

      {/* ================= EMAIL ================= */}
      {step === "email" ? (
        <form onSubmit={emailForm.handleSubmit(sendCode)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input type="email" {...emailForm.register("email")} />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-red-400">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={pending}>
            {pending ? "Sending..." : "Send Code"}
          </button>
        </form>
      ) : (
        /* ================= CODE ================= */
        <form onSubmit={codeForm.handleSubmit(verifyCode)} className="space-y-3">
          <div className="text-sm text-gray-400 text-center">
            Code sent to <span className="font-semibold text-white">{email}</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Verification Code
            </label>
            <input placeholder="123456" {...codeForm.register("code")} />
            {codeForm.formState.errors.code && (
              <p className="text-xs text-red-400">
                {codeForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={pending}>
            {pending ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full h-10 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 transition"
          >
            Change Email
          </button>
        </form>
      )}
    </div>
  )
}
