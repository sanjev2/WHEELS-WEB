"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"
import { isAdminVerified } from "@/app/lib/admin-session"
import { adminOrdersActions } from "@/app/lib/actions/admin/order.action"
import type { Order, OrderStatus } from "@/app/lib/api/order"
import { ORDER_STATUSES } from "@/app/lib/api/order"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdminVerified()) router.replace("/dashboard")
  }, [router])

  async function load() {
    if (!token) return
    try {
      setLoading(true)
      setErr(null)
      const res = await adminOrdersActions.list(token)
      setItems(res.data)
    } catch (e: any) {
      setErr(e.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function changeStatus(id: string, status: OrderStatus) {
    if (!token) return
    try {
      setErr(null)
      await adminOrdersActions.updateStatus(token, id, status)
      await load()
    } catch (e: any) {
      setErr(e.message || "Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">Admin: Orders</div>
        <div className="text-sm text-slate-500">Update status; user will see changes immediately.</div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{err}</div>
      )}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {loading ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-600">No orders yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((o) => (
              <div key={o._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{o.packageTitle}</div>
                    <div className="text-xs text-slate-600">
                      Provider: {o.providerName} • Total: ₹ {o.totalPrice}
                    </div>
                    <div className="text-xs text-slate-600">
                      Current status: <span className="font-semibold">{o.status}</span>
                    </div>
                  </div>

                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}