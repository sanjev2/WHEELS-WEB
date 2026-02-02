"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Search, RefreshCw } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"
import { apiAuthWithToken } from "@/app/lib/api-clients"

type User = {
  _id: string
  name: string
  email: string
  role: string
  contact?: string
  address?: string
  profile_picture?: string | null
}

type ApiResponse = { success: boolean; data: User[] }

export default function AdminUserPage() {
  const { token, isLoading } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return users
    return users.filter((u) => {
      const hay = `${u.name} ${u.email} ${u.role}`.toLowerCase()
      return hay.includes(query)
    })
  }, [users, q])

  const load = async () => {
    if (!token) {
      setError("No token. Please login again.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await apiAuthWithToken<ApiResponse>(token, "/admin/users")
      setUsers(res.data || [])
    } catch (e: any) {
      setError(e.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!token) {
      setError("No token. Please login again.")
      setLoading(false)
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading])

  const onDelete = async (id: string, name: string) => {
    if (!token) return
    const ok = confirm(`Delete "${name}"? This cannot be undone.`)
    if (!ok) return

    setDeletingId(id)
    setError(null)

    // optimistic UI
    const prev = users
    setUsers((cur) => cur.filter((u) => u._id !== id))

    try {
      await apiAuthWithToken(token, `/admin/users/${id}`, { method: "DELETE" })
    } catch (e: any) {
      // rollback if delete failed
      setUsers(prev)
      setError(e.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage users, roles and profiles.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800
                       shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link
            href="/admin/user/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
                       shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none
                         focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Showing <span className="text-gray-900">{filtered.length}</span> /{" "}
            <span className="text-gray-900">{users.length}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm">
        <div className="border-b border-gray-200/70 bg-gradient-to-b from-gray-50 to-white px-5 py-4">
          <div className="text-sm font-bold text-gray-900">User Directory</div>
          <div className="mt-1 text-xs text-gray-500">Edit or delete users.</div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-5 py-8 text-sm text-gray-500">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500">No users found.</div>
          ) : (
            filtered.map((u) => (
              <div key={u._id} className="px-5 py-4 hover:bg-gray-50/60 transition">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-gray-900">{u.name}</div>
                        <div className="truncate text-xs text-gray-500">{u.email}</div>
                      </div>

                      <span
                        className={[
                          "ml-2 inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[11px] font-bold",
                          u.role === "admin"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-gray-200 bg-gray-50 text-gray-700",
                        ].join(" ")}
                      >
                        {u.role}
                      </span>
                    </div>

                    {(u.contact || u.address) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        {u.contact && (
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                            {u.contact}
                          </span>
                        )}
                        {u.address && (
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                            {u.address}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <Link
                      href={`/admin/user/${u._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-800
                                 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-[0.99]"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(u._id, u.name)}
                      disabled={deletingId === u._id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700
                                 shadow-sm transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === u._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Note: Deleting a user is permanent. Consider disabling accounts if you need audit history.
      </div>
    </div>
  )
}
