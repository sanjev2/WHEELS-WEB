"use client"

import { useAuth } from "@/app/context/auth-contexts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateProfileSchema, type UpdateProfileData } from "../schema"
import { useEffect, useMemo, useState } from "react"
import { authApi } from "@/app/lib/api/auth"
import { Upload, UserCircle2, CheckCircle2, AlertTriangle } from "lucide-react"

function getPublicBase(apiBase: string) {
  return apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase
}

export default function UpdateProfile() {
  const { user, token, refreshMe } = useAuth()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  const PUBLIC_BASE = useMemo(() => getPublicBase(API_BASE), [API_BASE])

  const serverImage =
    user?.profile_picture ? `${PUBLIC_BASE}/public/profile_photo/${user.profile_picture}` : null

  const image = preview || serverImage

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      contact: user?.contact || "",
      address: user?.address || "",
    },
  })

  useEffect(() => {
    reset({
      name: user?.name || "",
      contact: user?.contact || "",
      address: user?.address || "",
    })
  }, [user, reset])

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onSubmit = async (values: UpdateProfileData) => {
    if (!token || !user?._id) return

    setSaving(true)
    setToast(null)

    try {
      const fd = new FormData()
      fd.append("name", values.name)
      fd.append("contact", values.contact)
      fd.append("address", values.address)
      if (file) fd.append("profilePicture", file)

      await authApi.updateUserForm(token, user._id, fd)
      await refreshMe()

      setToast({ type: "success", text: "Profile updated" })
      setFile(null)
    } catch (e: any) {
      setToast({ type: "error", text: e?.message || "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      {/* Card only – no page heading */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Profile details</div>
            <div className="text-xs text-slate-500">Visible to your account</div>
          </div>

          {toast && (
            <div
              className={[
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {toast.text}
            </div>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-6">
          {/* Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {image ? (
                <img
                  src={image}
                  alt="profile"
                  className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                  <UserCircle2 className="h-6 w-6 text-slate-300" />
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full name" error={errors.name?.message}>
              <input {...register("name")} className="input-compact" />
            </Field>

            <Field label="Contact" error={errors.contact?.message}>
              <input {...register("contact")} className="input-compact" />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address" error={errors.address?.message}>
                <input {...register("address")} className="input-compact" />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* -------- compact input style -------- */
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
