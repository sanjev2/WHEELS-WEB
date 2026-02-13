"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"
import { adminUsersApi } from "@/app/lib/api/admin/user"

const UPLOADS = process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:5000/uploads"

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || ""

  const { token, isHydrated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const avatar = useMemo(() => {
    if (user?.profile_picture) return `${UPLOADS}/${user.profile_picture}`
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
  }, [user?.profile_picture, user?.name])

  useEffect(() => {
    let ignore = false

    const run = async () => {
      if (!isHydrated) return
      if (!token) {
        setError("No token. Please login again.")
        setLoading(false)
        return
      }
      if (!id) {
        setError("Missing user id.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await adminUsersApi.getById(token, id)
        if (!ignore) setUser(res?.data ?? null)
      } catch (e: any) {
        if (!ignore) setError(e.message || "Failed to load user")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    run()
    return () => {
      ignore = true
    }
  }, [id, token, isHydrated])

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
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">Loading user…</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">User Detail</h1>
          <p className="text-sm text-gray-500">ID: {id}</p>
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

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!user ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">User not found.</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} className="h-14 w-14 rounded-full border object-cover" alt="avatar" />
              <div className="min-w-0">
                <div className="truncate font-bold text-gray-900">{user.name}</div>
                <div className="truncate text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-6 text-sm">
            <Row label="Role" value={user.role} />
            <Row label="Contact" value={user.contact} />
            <Row label="Address" value={user.address} />
          </div>

          <div className="border-t p-6">
            <Link
              href={`/admin/users/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Pencil className="h-4 w-4" />
              Edit User
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-3">
      <div className="font-semibold text-gray-700">{label}</div>
      <div className="text-gray-900">{value || "—"}</div>
    </div>
  )
}
