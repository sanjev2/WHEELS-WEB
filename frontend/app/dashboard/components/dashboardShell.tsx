"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  User,
  ShoppingCart,
  Car,
  ClipboardList,
  Settings,
  LogOut,
  Shield,
  X,
  Loader2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/app/context/auth-contexts"
import { setAdminVerified } from "@/app/lib/admin-session"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout, token, isHydrated } = useAuth()

  const [adminOpen, setAdminOpen] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)

  // ✅ Redirect ONLY in effect (never in render)
  useEffect(() => {
    if (!isHydrated) return
    if (!token) router.replace("/auth/login")
  }, [isHydrated, token, router])

  const navItems = useMemo(
    () => [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: User, label: "Profile", href: "/dashboard/profile" },
      { icon: ShoppingCart, label: "Services", href: "/dashboard/services" },
      { icon: Car, label: "Vehicles", href: "/dashboard/vehicles" },
      { icon: ClipboardList, label: "Orders", href: "/dashboard/orders" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    []
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const pageTitle = useMemo(() => {
    const match = navItems.find((i) => isActive(i.href))
    return match ? match.label : "Dashboard"
  }, [pathname, navItems])

  const handleAdminClick = () => {
    setAdminError(null)
    setAdminCode("")
    setAdminOpen(true)
  }

  const verifyAdminAndGo = async () => {
    setAdminLoading(true)
    setAdminError(null)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

      const res = await fetch(`${API_BASE}/auth/admin/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: adminCode }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setAdminError(data?.message || "Verification failed.")
        setAdminLoading(false)
        return
      }

      setAdminVerified(15)
      setAdminOpen(false)
      setAdminLoading(false)
      router.push("/admin/dashboard")
    } catch {
      setAdminLoading(false)
      setAdminError("Network error. Please try again.")
    }
  }

  // ✅ During hydration or missing token, keep UI stable (do NOT render dashboard UI)
  if (!isHydrated || !token) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="rounded-2xl border bg-white px-5 py-3 text-sm text-gray-600 shadow-sm">
          Loading session…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-[260px] border-r border-slate-200/80 bg-white shadow-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 grid place-items-center shadow-sm">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Wheels</div>
              <div className="text-xs text-slate-500">Dashboard</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1">
            <div className="mb-2 px-2 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              Menu
            </div>

            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all",
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
                      active
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Dashboard
                </div>
                <h1 className="mt-1 text-xl font-semibold text-slate-900">{pageTitle}</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdminClick}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700
                             hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700
                             hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <section className="flex-1 p-6 overflow-auto">{children}</section>
        </main>
      </div>

      {/* Admin Modal */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Admin Verification</h3>
                <p className="mt-1 text-sm text-slate-500">Enter the admin code to continue.</p>
              </div>

              <button
                onClick={() => setAdminOpen(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <label className="text-sm font-semibold text-slate-700">Admin Code</label>
              <input
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter code"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none
                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />

              {adminError && <p className="mt-3 text-sm font-semibold text-red-600">{adminError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => setAdminOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={verifyAdminAndGo}
                disabled={!adminCode || adminLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
                           hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {adminLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
