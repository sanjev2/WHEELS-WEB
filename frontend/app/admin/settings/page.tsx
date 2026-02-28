"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/app/context/auth-contexts"
import { authApi } from "@/app/lib/api/auth"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
  })

type ChangePasswordData = z.infer<typeof changePasswordSchema>

export default function SettingsPage() {
  const { token } = useAuth()
  const [pending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const submit = async (values: ChangePasswordData) => {
    setApiError(null)
    setSuccess(null)

    if (!token) {
      setApiError("Please login to change your password.")
      return
    }

    startTransition(async () => {
      try {
        await authApi.changePassword(token, values.currentPassword, values.newPassword)
        setSuccess("Password updated successfully.")
        form.reset()
      } catch (e: any) {
        setApiError(e?.message || "Failed to update password")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Settings</div>
        <p className="mt-2 text-sm text-slate-600">Manage your account settings.</p>
      </div>

      {/* Alerts */}
      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {apiError}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {/* Change Password Card */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-base font-semibold text-slate-900">Change Password</div>
        <p className="mt-1 text-sm text-slate-600">
          Enter your current password to set a new one.
        </p>

        <form onSubmit={form.handleSubmit(submit)} className="mt-5 space-y-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter current password"
              {...form.register("currentPassword")}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter new password"
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-red-600">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Confirm new password"
              {...form.register("confirmNewPassword")}
            />
            {form.formState.errors.confirmNewPassword && (
              <p className="text-xs text-red-600">
                {form.formState.errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                form.reset()
                setApiError(null)
                setSuccess(null)
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}