"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Shield, Activity, ChevronRight, UserRoundCog, Sparkles } from "lucide-react"
import { useAuth } from "@/app/context/auth-contexts"
import { adminUsersApi } from "@/app/lib/api-clients" // ✅ IMPORTANT: import this

type UserT = {
  _id: string
  name: string
  email: string
  role?: "user" | "admin" | string | string[]
}

type UsersListResponse = {
  success: boolean
  data: UserT[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export default function AdminDashboardPage() {
  const { token, isLoading } = useAuth()

  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [adminCount, setAdminCount] = useState<number>(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [status, setStatus] = useState<"Healthy" | "Degraded">("Healthy")
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!token) {
      setTotalUsers(0)
      setAdminCount(0)
      setStatsLoading(false)
      setStatus("Degraded")
      setUpdatedAt(new Date())
      return
    }

    let cancelled = false

    const isAdminRole = (role: UserT["role"]) => {
      if (!role) return false
      if (Array.isArray(role)) return role.some((r) => String(r).toLowerCase() === "admin")
      return String(role).toLowerCase() === "admin"
    }

    ;(async () => {
      setStatsLoading(true)
      setStatus("Healthy")

      try {
        // page size for stats scan (bigger = fewer requests)
        const LIMIT = 100

        // 1) Fetch first page to get totals
        const first: UsersListResponse = await adminUsersApi.getAll(token, { page: 1, limit: LIMIT })
        if (cancelled) return

        setTotalUsers(first.pagination?.total ?? first.data?.length ?? 0)

        // 2) Count admins across all pages
        let admins = (first.data ?? []).filter((u) => isAdminRole(u.role)).length
        const totalPages = first.pagination?.totalPages ?? 1

        for (let page = 2; page <= totalPages; page++) {
          const next: UsersListResponse = await adminUsersApi.getAll(token, { page, limit: LIMIT })
          if (cancelled) return
          admins += (next.data ?? []).filter((u) => isAdminRole(u.role)).length
        }

        setAdminCount(admins)
        setUpdatedAt(new Date())
        setStatus("Healthy")
      } catch (err: any) {
        console.error("Failed to load admin stats:", err?.message || err)
        if (cancelled) return
        setTotalUsers(0)
        setAdminCount(0)
        setUpdatedAt(new Date())
        setStatus("Degraded")
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, isLoading])

  const updatedLabel = updatedAt
    ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "—"

  return (
    <div className="space-y-8">
      {/* Page Header / Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-slate-100/30 blur-3xl" />

        <div className="relative p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                System overview &amp; management
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome, Admin
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Manage users, roles, and keep the platform secure with quick access to your most used tools.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="/admin/user"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
              >
                <UserRoundCog className="h-[18px] w-[18px]" />
                Manage Users
                <ChevronRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="text-xs text-slate-500">
                Tip: Use <span className="font-semibold text-slate-700">Manage Users</span> for roles &amp; access control
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          title="Total Users"
          value={statsLoading ? "—" : String(totalUsers)}
          icon={<Users className="h-[18px] w-[18px]" />}
          tone="emerald"
          badge={statsLoading ? "Loading" : undefined}
          meta={statsLoading ? "Fetching…" : updatedLabel}
        />
        <Stat
          title="Admins"
          value={statsLoading ? "—" : String(adminCount)}
          icon={<Shield className="h-[18px] w-[18px]" />}
          tone="slate"
          badge={statsLoading ? "Loading" : undefined}
          meta={statsLoading ? "Fetching…" : updatedLabel}
        />
        <Stat
          title="System Status"
          value={statsLoading ? "Checking…" : status}
          icon={<Activity className="h-[18px] w-[18px]" />}
          tone={status === "Healthy" ? "sky" : "slate"}
          badge={status === "Healthy" ? "Live" : "Issue"}
          meta={statsLoading ? "Verifying API…" : updatedLabel}
        />
      </div>

      {/* Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Quick Actions</h3>
              <p className="mt-1 text-sm text-slate-600">Most used admin actions in one place</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Shortcuts
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionCard
              href="/admin/user"
              title="User Management"
              desc="Create, update, delete users and assign roles"
              accent="emerald"
            />
            <ActionCard
              href="/admin/settings"
              title="System Settings"
              desc="Update platform configuration and preferences"
              accent="sky"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Security</h3>
              <p className="mt-1 text-sm text-slate-600">Admin session verification status</p>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              Verified
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5">
            <div className="text-sm font-semibold text-emerald-800">Access Verified</div>
            <div className="mt-1 text-xs leading-relaxed text-emerald-700">
              Your admin session is active. Leaving the portal may require re-verification.
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">Recommended: verify only on trusted devices</div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  title,
  value,
  icon,
  tone,
  badge,
  meta,
}: {
  title: string
  value: string
  icon: React.ReactNode
  tone: "emerald" | "sky" | "slate"
  badge?: string
  meta?: string
}) {
  const toneStyles =
    tone === "emerald"
      ? "border-emerald-100/60 bg-gradient-to-b from-emerald-50/80 to-white"
      : tone === "sky"
      ? "border-sky-100/60 bg-gradient-to-b from-sky-50/80 to-white"
      : "border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white"

  const iconStyles =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "sky"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-slate-200 bg-slate-50 text-slate-700"

  return (
    <div className={`rounded-xl border p-6 shadow-sm transition hover:shadow-md ${toneStyles}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-700">{title}</div>
            {badge && (
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
          <div className="mt-2 text-xs text-slate-500">{meta || "—"}</div>
        </div>

        <div className={`rounded-xl border p-3 shadow-sm ${iconStyles}`}>{icon}</div>
      </div>
    </div>
  )
}

function ActionCard({
  href,
  title,
  desc,
  accent,
}: {
  href: string
  title: string
  desc: string
  accent: "emerald" | "sky"
}) {
  const accentRing =
    accent === "emerald"
      ? "hover:border-emerald-200 hover:ring-emerald-100"
      : "hover:border-sky-200 hover:ring-sky-100"

  const accentText = accent === "emerald" ? "text-emerald-700" : "text-sky-700"

  return (
    <Link
      href={href}
      className={[
        "group block rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all",
        "hover:shadow-md hover:ring-4",
        accentRing,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-bold tracking-tight text-slate-900">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</div>

          <div className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${accentText}`}>
            Open
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-700 shadow-sm">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  )
}
