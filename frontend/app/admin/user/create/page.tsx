"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, UserPlus, ArrowLeft, Shield, Mail, Phone, MapPin, KeyRound, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

type Role = "user" | "admin"

export default function CreateUserPage() {
  const router = useRouter()
  const { token, isLoading } = useAuth()

  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [address, setAddress] = useState("")
  const [role, setRole] = useState<Role>("user")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const passwordScore = useMemo(() => {
    const p = password || ""
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[a-z]/.test(p)) score++
    if (/\d/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return Math.min(score, 5)
  }, [password])

  const passwordLabel = useMemo(() => {
    if (!password) return "—"
    if (passwordScore <= 2) return "Weak"
    if (passwordScore === 3) return "Okay"
    if (passwordScore === 4) return "Strong"
    return "Very strong"
  }, [password, passwordScore])

  const passwordOk = useMemo(() => password.length >= 6, [password])
  const confirmOk = useMemo(() => !!confirmPassword && password === confirmPassword, [password, confirmPassword])

  const avatarPreview = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (isLoading) return

    if (!token) {
      setError("No token. Please login again.")
      return
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required.")
      return
    }

    if (!confirmPassword.trim()) {
      setError("Confirm password is required.")
      return
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.")
      return
    }

    setSaving(true)
    try {
      const form = new FormData()
      form.append("name", name.trim())
      form.append("email", email.trim())
      form.append("contact", contact.trim())
      form.append("address", address.trim())
      form.append("role", role)
      form.append("password", password)

      // ✅ backend expects confirmPassword, so send it
      form.append("confirmPassword", confirmPassword)

      // ✅ IMPORTANT: choose ONE that matches backend multer field name
      if (file) form.append("profilePicture", file)
      // if (file) form.append("profile_picture", file)

      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ don't set Content-Type for FormData
        },
        body: form,
      })

      const contentType = res.headers.get("content-type") || ""
      const raw = await res.text()

      let data: any = null
      if (contentType.includes("application/json")) {
        try {
          data = raw ? JSON.parse(raw) : null
        } catch {
          data = null
        }
      }

      if (!res.ok) {
        const msg = data?.message || raw?.slice(0, 220) || "Failed to create user."
        throw new Error(msg)
      }

      setSuccess("User created successfully ✅")

      setName("")
      setEmail("")
      setContact("")
      setAddress("")
      setRole("user")
      setPassword("")
      setConfirmPassword("")
      setFile(null)

      setTimeout(() => router.replace("/admin/user"), 500)
    } catch (e: any) {
      setError(e?.message || "Failed")
    } finally {
      setSaving(false)
    }
  }

  const disabled = saving || isLoading

  return (
    <div className="min-h-[calc(100vh-40px)]">
      {/* Premium background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-28 left-10 h-[420px] w-[620px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-10 top-32 h-[360px] w-[560px] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <UserPlus size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Create User</h1>
              <p className="mt-0.5 text-sm text-gray-600">Add a new user and optionally upload a profile photo.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" title="Create failed" message={error} />
        )}
        {success && (
          <Alert type="success" title="Success" message={success} />
        )}

        <form onSubmit={submit} className="rounded-[28px] border border-gray-200 bg-white/80 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Shield size={16} className="text-emerald-700" />
                New User Details
              </div>
              <div className="mt-1 text-sm text-gray-500">Passwords must match. Role controls access level.</div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Admin Portal
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left: form */}
            <div className="space-y-6">
              <Section title="Basic Information" subtitle="These details will be used for the user profile.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    placeholder="John Doe"
                    icon={<UserPlus size={16} />}
                    required
                  />
                  <Field
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="john@email.com"
                    type="email"
                    icon={<Mail size={16} />}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Contact"
                    value={contact}
                    onChange={setContact}
                    placeholder="98XXXXXXXX"
                    icon={<Phone size={16} />}
                  />
                  <Field
                    label="Address"
                    value={address}
                    onChange={setAddress}
                    placeholder="Kumaripati, Lalitpur"
                    icon={<MapPin size={16} />}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <LabelRow label="Role" hint="Choose user or admin" />
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <Shield size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <LabelRow label="Profile Photo" hint="Optional" />
                    <FilePicker
                      file={file}
                      setFile={setFile}
                      previewUrl={avatarPreview}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Security" subtitle="Create a strong password for the user.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordField
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    icon={<KeyRound size={16} />}
                    helper={`Strength: ${passwordLabel}`}
                    ok={password ? passwordOk : undefined}
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    icon={<CheckCircle2 size={16} />}
                    helper={confirmPassword ? (confirmOk ? "Passwords match" : "Does not match") : "Re-enter password"}
                    ok={confirmPassword ? confirmOk : undefined}
                  />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                  Tip: Use at least 8 characters, a number, and a symbol for stronger security.
                </div>
              </Section>

              {/* Footer actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-gray-500">
                  If you see <span className="font-mono">Unexpected token &lt;</span>, your request hit an HTML page (wrong endpoint / server).
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.replace("/admin/user")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={disabled}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {disabled ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: preview card */}
            <aside className="space-y-4">
              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-gray-900">Preview</div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
                    {role}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-gray-400">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-base font-extrabold text-gray-900">{name.trim() || "Full Name"}</div>
                    <div className="truncate text-sm text-gray-600">{email.trim() || "email@example.com"}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm">
                  <MiniRow label="Contact" value={contact.trim() || "—"} />
                  <MiniRow label="Address" value={address.trim() || "—"} />
                </div>

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Password strength</span>
                    <span className="font-bold">{passwordLabel}</span>
                  </div>
                  <div className="mt-2">
                    <StrengthBar score={passwordScore} />
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-extrabold text-gray-900">Quick checks</div>
                <div className="mt-3 space-y-2">
                  <CheckItem ok={!!name.trim()} label="Name filled" />
                  <CheckItem ok={!!email.trim()} label="Email filled" />
                  <CheckItem ok={passwordOk} label="Password length OK" />
                  <CheckItem ok={confirmOk} label="Passwords match" />
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------- UI Components ---------- */

function Alert({
  type,
  title,
  message,
}: {
  type: "error" | "success"
  title: string
  message: string
}) {
  const isError = type === "error"
  return (
    <div
      className={[
        "rounded-[22px] border px-4 py-3 text-sm shadow-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-900",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={["mt-0.5", isError ? "text-red-700" : "text-emerald-700"].join(" ")}>
          {isError ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold">{title}</div>
          <div className="mt-0.5 break-words text-sm opacity-90">{message}</div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-gray-900">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  )
}

function LabelRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <div className="text-sm font-semibold text-gray-800">
        {label}
        <span className="ml-1 text-emerald-700">*</span>
      </div>
      {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-800">
          {label}
          {required ? <span className="ml-1 text-emerald-700">*</span> : null}
        </div>
      </div>
      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">{icon}</div>
        ) : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition",
            icon ? "pl-10" : "",
            "focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100",
          ].join(" ")}
        />
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  icon,
  helper,
  ok,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
  helper?: string
  ok?: boolean
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {typeof ok === "boolean" ? (
          <div className={["text-xs font-semibold", ok ? "text-emerald-700" : "text-red-600"].join(" ")}>
            {ok ? "OK" : "Check"}
          </div>
        ) : null}
      </div>

      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">{icon}</div>
        ) : null}
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition",
            icon ? "pl-10" : "",
            "focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100",
          ].join(" ")}
        />
      </div>

      {helper ? <div className="mt-1 text-xs text-gray-500">{helper}</div> : null}
    </div>
  )
}

function FilePicker({
  file,
  setFile,
  previewUrl,
}: {
  file: File | null
  setFile: (f: File | null) => void
  previewUrl: string | null
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-gray-400">
              <ImageIcon size={16} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900">{file ? file.name : "No file selected"}</div>
          <div className="truncate text-xs text-gray-500">PNG/JPG, optional</div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50">
          <Upload size={16} />
          Choose
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {file ? (
        <button
          type="button"
          onClick={() => setFile(null)}
          className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Remove
        </button>
      ) : null}
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="truncate text-sm font-bold text-gray-900">{value}</div>
    </div>
  )
}

function StrengthBar({ score }: { score: number }) {
  // score 0..5
  const bars = [0, 1, 2, 3, 4]
  return (
    <div className="flex gap-2">
      {bars.map((i) => (
        <div
          key={i}
          className={[
            "h-2 w-full rounded-full",
            score >= i + 1 ? "bg-emerald-600" : "bg-gray-200",
          ].join(" ")}
        />
      ))}
    </div>
  )
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="text-sm font-semibold text-gray-800">{label}</div>
      <div className={ok ? "text-emerald-700" : "text-gray-400"}>{ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}</div>
    </div>
  )
}
