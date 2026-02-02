"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const UPLOADS = process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:5000/uploads"

type User = {
  _id?: string
  id?: string
  name?: string
  email?: string
  role?: string
  contact?: string
  address?: string
  profile_picture?: string | null
}

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || ""

  const { token, isHydrated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [address, setAddress] = useState("")
  const [role, setRole] = useState("user")
  const [file, setFile] = useState<File | null>(null)

  const avatar = useMemo(() => {
    if (user?.profile_picture) return `${UPLOADS}/${user.profile_picture}`
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}`
  }, [user?.profile_picture, name])

  useEffect(() => {
    let ignore = false

    async function loadUser() {
      setError(null)

      // ✅ WAIT FOR COOKIE HYDRATION
      if (!isHydrated) return

      if (!token) {
        setLoading(false)
        setError("No token. Please login again.")
        return
      }

      if (!id) {
        setLoading(false)
        setError("Missing user id in URL.")
        return
      }

      try {
        setLoading(true)

        const res = await fetch(`${API_BASE}/admin/users/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })

        const raw = await res.text()
        let json: any = null
        try {
          json = raw ? JSON.parse(raw) : null
        } catch {
          json = null
        }

        if (!res.ok) {
          throw new Error(json?.message || raw?.slice(0, 250) || `Failed to fetch user (${res.status})`)
        }

        const u: User = json?.data ?? json ?? {}
        if (!u || (!u._id && !u.id)) throw new Error("User not found in API response.")

        if (ignore) return
        setUser(u)
        setName(u.name || "")
        setEmail(u.email || "")
        setContact(u.contact || "")
        setAddress(u.address || "")
        setRole(u.role || "user")
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load user")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadUser()
    return () => {
      ignore = true
    }
  }, [id, token, isHydrated])

  async function onSave() {
    setError(null)
    if (!isHydrated) return
    if (!token) return setError("No token. Please login again.")
    if (!id) return setError("Missing user id in URL.")

    setSaving(true)
    try {
      const form = new FormData()
      form.append("name", name.trim())
      form.append("email", email.trim())
      form.append("contact", contact.trim())
      form.append("address", address.trim())
      form.append("role", role.trim())

      // ✅ choose ONE upload field name that your backend uses:
      if (file) form.append("profilePicture", file)
      // if (file) form.append("profile_picture", file)

      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      const raw = await res.text()
      let json: any = null
      try {
        json = raw ? JSON.parse(raw) : null
      } catch {
        json = null
      }

      if (!res.ok) {
        throw new Error(json?.message || raw?.slice(0, 250) || `Update failed (${res.status})`)
      }

      router.replace("/admin/user")
    } catch (e: any) {
      setError(e?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    setError(null)
    if (!isHydrated) return
    if (!token) return setError("No token. Please login again.")
    if (!id) return setError("Missing user id in URL.")
    if (!confirm("Delete this user? This cannot be undone.")) return

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const raw = await res.text()
      if (!res.ok) throw new Error(raw?.slice(0, 250) || `Delete failed (${res.status})`)

      router.replace("/admin/user")
    } catch (e: any) {
      setError(e?.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  // ✅ If hydration not done, show stable loader (prevents UI jump)
  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">Loading session…</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">Loading user…</div>
          <div className="mt-2 text-xs text-gray-500">ID: {id || "missing"}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit User</h1>
          <p className="text-sm text-gray-500">Update user details and photo</p>
          <p className="mt-1 text-xs text-gray-400">ID: {id}</p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} className="h-14 w-14 rounded-full border object-cover" alt="avatar" />
            <div className="min-w-0">
              <div className="truncate font-bold text-gray-900">{user?.name || "—"}</div>
              <div className="truncate text-sm text-gray-500">{user?.email || "—"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact" value={contact} onChange={setContact} />
            <Field label="Address" value={address} onChange={setAddress} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-sm font-semibold text-gray-700">Role</div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm font-semibold text-gray-700">Replace Photo (optional)</div>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm hover:bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <Upload size={16} className="text-gray-500" />
                  {file ? file.name : "Choose image"}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={16} />
              Delete User
            </button>

            <button
              type="button"
              onClick={() => router.replace("/admin/user")}
              className="inline-flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  )
}
