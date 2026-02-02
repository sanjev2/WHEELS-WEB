import type { ReactNode } from "react"
import DashboardShell from "@/app/dashboard/components/dashboardShell"
import ProtectedRoute from "@/app/dashboard/protectedRoute"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  )
}
