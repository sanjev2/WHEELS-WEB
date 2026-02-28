"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"
import { getActiveCarId } from "@/app/lib/active-car"
import { carsActions } from "@/app/lib/actions/car.action"
import { publicActions } from "@/app/lib/actions/public"
import type { Car } from "@/app/lib/api/cars"
import type { PublicPackage } from "@/app/lib/api/public"

export default function ServicesPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [activeCar, setActiveCar] = useState<Car | null>(null)
  const [packages, setPackages] = useState<PublicPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setErr(null)

        const activeCarId = getActiveCarId()
        if (!activeCarId || !token) {
          if (!mounted) return
          setActiveCar(null)
          setPackages([])
          return
        }

        const carsRes = await carsActions.listMine(token)
        const found = carsRes.data.find((c) => c._id === activeCarId) || null

        if (!found) {
          if (!mounted) return
          setActiveCar(null)
          setPackages([])
          return
        }

        const pkgsRes = await publicActions.packages(found.category)
        const onlyActive = pkgsRes.data.filter((p) => p.isActive)

        if (!mounted) return
        setActiveCar(found)
        setPackages(onlyActive)
      } catch (e: any) {
        if (!mounted) return
        setErr(e.message || "Failed to load packages")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [token])

  if (loading) {
    return <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">Loading…</div>
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {err}
      </div>
    )
  }

  if (!activeCar) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Services / Packages</div>
        <p className="mt-2 text-sm text-slate-600">
          Please select your car first. Packages will show based on your car category.
        </p>
        <button
          onClick={() => router.push("/dashboard/vehicles")}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Go to Vehicles
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active Car Banner */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm text-slate-600">Showing packages for:</div>
        <div className="text-base font-semibold text-slate-900">
          {activeCar.make} {activeCar.model} ({activeCar.year}) •{" "}
          <span className="text-emerald-700">{activeCar.category}</span>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
          No packages available for this category.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => {
            const services = Array.isArray(p.services) ? p.services : []
            const addons = Array.isArray(p.addons) ? p.addons : []
            const oils = Array.isArray((p as any).engineOilTypes) ? ((p as any).engineOilTypes as string[]) : []

            return (
              <div key={p._id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">{p.category}</div>

                <div className="mt-2 text-base font-semibold text-slate-900">{p.title}</div>

                {p.description ? <div className="mt-2 text-sm text-slate-600">{p.description}</div> : null}

                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-slate-900">₹ {p.price}</div>

                  {p.durationMins ? (
                    <div className="text-xs text-slate-500">Duration: {p.durationMins} mins</div>
                  ) : null}

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Oil Types:</span> {oils.length ? oils.join(", ") : "—"}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Services:</span>{" "}
                    {services.length ? services.slice(0, 3).join(", ") + (services.length > 3 ? "…" : "") : "—"}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Add-ons:</span>{" "}
                    {addons.length ? addons.slice(0, 3).join(", ") + (addons.length > 3 ? "…" : "") : "—"}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => router.push(`/dashboard/services/${p._id}`)}
                  >
                    View
                  </button>

                  <button
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={() => router.push(`/dashboard/services/${p._id}`)}
                  >
                    Book
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}