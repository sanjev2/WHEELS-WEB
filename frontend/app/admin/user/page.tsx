"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"
import { adminUsersApi } from "@/app/lib/api/admin/user"

type User = {
  _id: string
  name: string
  email: string
  role: string
  contact?: string
  address?: string
  profile_picture?: string | null
}

export default function AdminUsersPage() {
  const { token, isLoading, isHydrated } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number }>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canPrev = pagination.page > 1
  const canNext = pagination.page < pagination.totalPages

  const load = async (opts?: { nextPage?: number; nextLimit?: number; nextSearch?: string }) => {
    if (!token) {
      setError("No token. Please login again.")
      setLoading(false)
      return
    }

    const nextPage = opts?.nextPage ?? page
    const nextLimit = opts?.nextLimit ?? limit
    const nextSearch = (opts?.nextSearch ?? search).trim()

    setLoading(true)
    setError(null)

    try {
      const res = await adminUsersApi.getAll(token, { page: nextPage, limit: nextLimit, search: nextSearch })
      setUsers((res.data || []) as User[])
      setPagination(res.pagination || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 })
      setPage(nextPage)
      setLimit(nextLimit)
    } catch (e: any) {
      setError(e.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // initial load
  useEffect(() => {
    if (isLoading) return
    if (!isHydrated) return
    if (!token) {
      setError("No token. Please login again.")
      setLoading(false)
      return
    }
    load({ nextPage: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading, isHydrated])

  const onSearchSubmit = async () => {
    await load({ nextPage: 1, nextSearch: search })
  }

  const onDelete = async (id: string, name: string) => {
    if (!token) return
    const ok = confirm(`Delete "${name}"? This cannot be undone.`)
    if (!ok) return

    setDeletingId(id)
    setError(null)

    try {
      await adminUsersApi.remove(token, id)
      // reload same page (but if last item deleted, go back a page safely)
      const nextPage = Math.min(page, Math.max(1, (pagination.totalPages || 1)))
      await load({ nextPage })
    } catch (e: any) {
      setError(e.message || "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const shownCount = useMemo(() => users.length, [users])

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
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800
                       shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link
            href="/admin/users/create"
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Search + meta */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchSubmit()
              }}
              placeholder="Search by name, email, contact, address..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none
                         focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSearchSubmit}
              className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Search
            </button>

            <select
              value={limit}
              onChange={(e) => load({ nextPage: 1, nextLimit: Number(e.target.value) })}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none
                         focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-gray-500">
          Showing <span className="text-gray-900">{shownCount}</span> on page{" "}
          <span className="text-gray-900">{pagination.page}</span> of{" "}
          <span className="text-gray-900">{pagination.totalPages}</span> — Total:{" "}
          <span className="text-gray-900">{pagination.total}</span>
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
          ) : users.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500">No users found.</div>
          ) : (
            users.map((u) => (
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
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">{u.contact}</span>
                        )}
                        {u.address && (
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1">{u.address}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <Link
                      href={`/admin/users/${u._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-800
                                 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-[0.99]"
                    >
                      <Pencil className="h-4 w-4" />
                      View
                    </Link>

                    <Link
                      href={`/admin/users/${u._id}/edit`}
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

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-gray-200/70 px-5 py-4">
          <button
            onClick={() => canPrev && load({ nextPage: page - 1 })}
            disabled={!canPrev || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800
                       hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="text-sm font-semibold text-gray-700">
            Page <span className="text-gray-900">{pagination.page}</span> /{" "}
            <span className="text-gray-900">{pagination.totalPages}</span>
          </div>

          <button
            onClick={() => canNext && load({ nextPage: page + 1 })}
            disabled={!canNext || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800
                       hover:bg-gray-50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Note: Deleting a user is permanent. Consider disabling accounts if you need audit history.
      </div>
    </div>
  )
}
