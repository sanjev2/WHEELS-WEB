"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/app/context/auth-contexts"
import { ordersActions } from "@/app/lib/actions/order.action"
import type { Order } from "@/app/lib/api/order"

export default function OrdersPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        if (!token) {
          if (!mounted) return
          setItems([])
          return
        }
        const res = await ordersActions.myOrders(token)
        if (!mounted) return
        setItems(res.data)
      } catch (e: any) {
        if (!mounted) return
        setErr(e.message || "Failed to load orders")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [token])

  const active = useMemo(() => items.filter((o) => o.status !== "COMPLETED"), [items])
  const history = useMemo(() => items.filter((o) => o.status === "COMPLETED"), [items])

  if (loading) return <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">Loading…</div>

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {err}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">My Orders</div>
        <div className="text-sm text-slate-500">Track status and view completed history.</div>
      </div>

      <Section title="Active Orders" items={active} empty="No active orders." />
      <Section title="Order History" items={history} empty="No completed orders yet." />
    </div>
  )
}

function Section({ title, items, empty }: { title: string; items: Order[]; empty: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>

      {items.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600">{empty}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((o) => (
            <div key={o._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{o.packageTitle}</div>
                  <div className="text-xs text-slate-600">
                    Provider: {o.providerName} • Status: <span className="font-semibold">{o.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Total: <span className="font-semibold">₹ {o.totalPrice}</span>
                  </div>
                  {o.selectedOilType ? (
                    <div className="mt-1 text-xs text-slate-600">
                      Oil: <span className="font-semibold">{o.selectedOilType}</span>
                    </div>
                  ) : null}
                  <div className="mt-1 text-xs text-slate-600">
                    Add-ons: <span className="font-semibold">{o.selectedAddons?.length ? o.selectedAddons.join(", ") : "—"}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}