"use client"

import { Settings, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": { title: "Admin Dashboard", subtitle: "System overview & management" },
  "/admin/user": { title: "Users", subtitle: "Manage users and roles" },
  "/admin/settings": { title: "Settings", subtitle: "Configure platform preferences" },
}

export default function AdminTopbar() {
  const pathname = usePathname()

  const meta =
    TITLES[pathname] ||
    (pathname.startsWith("/admin/user/")
      ? { title: "Edit User", subtitle: "Update user details" }
      : { title: "Admin Portal", subtitle: "System overview & management" })

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <div className="flex-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900">{meta.title}</div>
          <div className="mt-1 text-sm text-slate-500">{meta.subtitle}</div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Healthy
          </span>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verified
          </span>

          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
        </div>
      </div>
    </header>
  )
}
