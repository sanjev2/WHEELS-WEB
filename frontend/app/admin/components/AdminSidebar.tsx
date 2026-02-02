"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, UserRound, LogOut, ShieldCheck } from "lucide-react"
import { clearAdminVerified } from "@/app/lib/admin-session"

const nav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/user", icon: UserRound },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="sticky top-0 h-screen w-[280px] shrink-0 border-r border-slate-200/80 bg-white shadow-sm flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="rounded-xl border border-emerald-100/60 bg-gradient-to-b from-emerald-50/80 to-white p-4.5 shadow-sm">
          <div className="text-[10px] font-bold tracking-widest text-emerald-700/80 uppercase">
            Wheels Control
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="text-base font-bold tracking-tight text-slate-900">
              Admin Portal
            </div>

            <div className="rounded-lg border border-emerald-200 bg-white p-1.5 text-emerald-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600">Secure tools &amp; management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4">
        <div className="mb-3.5 px-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Navigation
        </div>

        <div className="space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                    active
                      ? "border-emerald-500 bg-emerald-500/20 text-white"
                      : "border-slate-200 bg-white text-slate-600 group-hover:border-slate-300 group-hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Icon className="h-[16px] w-[16px]" />
                </span>

                <span className="flex-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Exit */}
      <div className="border-t border-slate-100 px-4 py-4">
        <button
          onClick={() => {
            clearAdminVerified()
            router.replace("/dashboard")
          }}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 hover:border-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white">
            <LogOut className="h-[16px] w-[16px]" />
          </span>
          Exit Admin
        </button>
      </div>
    </aside>
  )
}
