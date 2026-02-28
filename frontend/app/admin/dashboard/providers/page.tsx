"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/app/context/auth-contexts"
import { isAdminVerified } from "@/app/lib/admin-session"
import { adminProvidersActions } from "@/app/lib/actions/admin/provider.action"
import type { AdminProvider } from "@/app/lib/api/admin/provider"

const CATEGORIES = ["SUV", "SEDAN", "HATCHBACK"] as const
const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 } // Kathmandu default

// ✅ IMPORTANT: Leaflet must not run on SSR
const MapPicker = dynamic(() => import("@/app/admin/components/MapPicker"), { ssr: false })

export default function AdminProvidersPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [items, setItems] = useState<AdminProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [editing, setEditing] = useState<AdminProvider | null>(null)
  const [name, setName] = useState("")
  const [locationText, setLocationText] = useState("")
  const [openFrom, setOpenFrom] = useState("09:00")
  const [openTo, setOpenTo] = useState("18:00")
  const [categories, setCategories] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  // map pin
  const [lat, setLat] = useState<number>(DEFAULT_CENTER.lat)
  const [lng, setLng] = useState<number>(DEFAULT_CENTER.lng)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminVerified()) router.replace("/dashboard")
  }, [router])

  async function load() {
    if (!token) return
    try {
      setLoading(true)
      setErr(null)
      const res = await adminProvidersActions.list(token)
      setItems(res.data)
    } catch (e: any) {
      setErr(e.message || "Failed to load providers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function reset() {
    setEditing(null)
    setName("")
    setLocationText("")
    setOpenFrom("09:00")
    setOpenTo("18:00")
    setCategories([])
    setIsActive(true)
    setLat(DEFAULT_CENTER.lat)
    setLng(DEFAULT_CENTER.lng)
  }

  function toggleCat(c: string) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  async function save() {
    if (!token) return
    try {
      setSaving(true)
      setErr(null)

      const payload = {
        name,
        locationText: locationText ? locationText : null,
        openFrom,
        openTo,
        lat,
        lng,
        placeId: null,
        categories,
        isActive,
      }

      if (editing) await adminProvidersActions.update(token, editing._id, payload)
      else await adminProvidersActions.create(token, payload)

      reset()
      await load()
    } catch (e: any) {
      setErr(e.message || "Failed to save provider")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!token) return
    try {
      setErr(null)
      await adminProvidersActions.remove(token, id)
      await load()
    } catch (e: any) {
      setErr(e.message || "Failed to delete provider")
    }
  }

  function edit(p: AdminProvider) {
    setEditing(p)
    setName(p.name || "")
    setLocationText(p.locationText || "")
    setOpenFrom(p.openFrom || "09:00")
    setOpenTo(p.openTo || "18:00")
    setCategories(Array.isArray(p.categories) ? p.categories : [])
    setIsActive(Boolean(p.isActive))
    setLat(Number(p.lat))
    setLng(Number(p.lng))
  }

  const mapCenter = useMemo(() => ({ lat, lng }), [lat, lng])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin: Service Providers</h2>
        <p className="text-sm text-slate-500">Add providers with open hours and FREE map pin (OpenStreetMap).</p>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {err}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div className="text-sm font-semibold text-slate-900">{editing ? "Edit Provider" : "Create Provider"}</div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border px-4 py-3 text-sm"
            placeholder="Provider name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-xl border px-4 py-3 text-sm"
            placeholder="Location text (e.g. Kalanki, Kathmandu)"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />

          <div className="rounded-xl border p-3">
            <div className="text-xs font-semibold text-slate-500">Open From</div>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={openFrom}
              onChange={(e) => setOpenFrom(e.target.value)}
            />
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs font-semibold text-slate-500">Open To</div>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={openTo}
              onChange={(e) => setOpenTo(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold text-slate-900">Supported Categories</div>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={categories.includes(c)} onChange={() => toggleCat(c)} />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* ✅ FREE MAP PIN */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-slate-900">Map Pin (OpenStreetMap)</div>

          <div className="text-xs text-slate-600">
            Lat: <span className="font-semibold">{mapCenter.lat.toFixed(6)}</span> • Lng:{" "}
            <span className="font-semibold">{mapCenter.lng.toFixed(6)}</span>
          </div>

          <div className="h-[320px] w-full overflow-hidden rounded-xl border">
            <MapPicker
              lat={lat}
              lng={lng}
              onChange={(la, ln) => {
                setLat(la)
                setLng(ln)
              }}
            />
          </div>

          <div className="text-xs text-slate-500">
            Tip: click on the map or drag the marker to set the exact pin.
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>

          {editing ? (
            <button
              onClick={reset}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">All Providers</div>

        {loading ? (
          <div className="mt-3 text-sm text-slate-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No providers yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((p) => (
              <div key={p._id} className="rounded-xl border p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-600">
                    {p.locationText || "—"} • {p.openFrom}–{p.openTo} • {p.isActive ? "Active" : "Inactive"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    <span className="font-semibold">Categories:</span>{" "}
                    {Array.isArray(p.categories) && p.categories.length ? p.categories.join(", ") : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    <span className="font-semibold">Pin:</span> {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => edit(p)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}