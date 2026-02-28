"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"
import { isAdminVerified } from "@/app/lib/admin-session"
import { adminPackagesActions } from "@/app/lib/actions/admin/packages.actions"
import type { AdminPackage } from "@/app/lib/api/admin/packages"

const OIL_TYPES = ["Synthetic", "Fully Synthetic"] as const
const CATEGORIES = ["SUV", "SEDAN", "HATCHBACK"] as const

export default function AdminPackagesPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [items, setItems] = useState<AdminPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // form
  const [editing, setEditing] = useState<AdminPackage | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("SUV")
  const [price, setPrice] = useState<number>(0)
  const [durationMins, setDurationMins] = useState<number>(30)

  // ✅ NEW: array
  const [engineOilTypes, setEngineOilTypes] = useState<string[]>([])

  const [isActive, setIsActive] = useState(true)

  // services/addons
  const [services, setServices] = useState<string[]>([])
  const [addons, setAddons] = useState<string[]>([])
  const [serviceInput, setServiceInput] = useState("")
  const [addonInput, setAddonInput] = useState("")

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminVerified()) router.replace("/dashboard")
  }, [router])

  async function load() {
    if (!token) return
    try {
      setLoading(true)
      setErr(null)
      const res = await adminPackagesActions.list(token)
      setItems(res.data)
    } catch (e: any) {
      setErr(e.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function resetForm() {
    setEditing(null)
    setTitle("")
    setDescription("")
    setCategory("SUV")
    setPrice(0)
    setDurationMins(30)
    setEngineOilTypes([])
    setIsActive(true)

    setServices([])
    setAddons([])
    setServiceInput("")
    setAddonInput("")
  }

  function toggleOilType(v: string) {
    setEngineOilTypes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  function addService() {
    const v = serviceInput.trim()
    if (!v) return
    setServices((prev) => [...prev, v])
    setServiceInput("")
  }

  function removeService(i: number) {
    setServices((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addAddon() {
    const v = addonInput.trim()
    if (!v) return
    setAddons((prev) => [...prev, v])
    setAddonInput("")
  }

  function removeAddon(i: number) {
    setAddons((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function save() {
    if (!token) return
    try {
      setSaving(true)
      setErr(null)

      const payload = {
        title,
        description: description ? description : null,
        category,
        price,
        durationMins: Number.isFinite(durationMins) ? durationMins : null,

        // ✅ array
        engineOilTypes,

        services,
        addons,
        isActive,
      }

      if (editing) {
        await adminPackagesActions.update(token, editing._id, payload)
      } else {
        await adminPackagesActions.create(token, payload)
      }

      resetForm()
      await load()
    } catch (e: any) {
      setErr(e.message || "Failed to save package")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!token) return
    try {
      setErr(null)
      await adminPackagesActions.remove(token, id)
      await load()
    } catch (e: any) {
      setErr(e.message || "Failed to delete package")
    }
  }

  function startEdit(p: AdminPackage) {
    setEditing(p)
    setTitle(p.title || "")
    setDescription(p.description || "")
    setCategory((p.category as any) || "SUV")
    setPrice(Number(p.price || 0))
    setDurationMins(Number(p.durationMins || 0))
    setIsActive(Boolean(p.isActive))

    setEngineOilTypes(Array.isArray(p.engineOilTypes) ? p.engineOilTypes : [])
    setServices(Array.isArray(p.services) ? p.services : [])
    setAddons(Array.isArray(p.addons) ? p.addons : [])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin: Packages</h2>
        <p className="text-sm text-slate-500">
          Create packages with services, multiple oil types, addons and time taken.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {err}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div className="text-sm font-semibold text-slate-900">
          {editing ? "Edit package" : "Create package"}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Time to complete (minutes)"
            type="number"
            value={durationMins}
            onChange={(e) => setDurationMins(Number(e.target.value))}
          />

          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm md:col-span-2"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ✅ Engine Oil Types */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-semibold text-slate-900">Engine Oil Types (optional)</div>
          <div className="mt-3 flex flex-col gap-2">
            {OIL_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={engineOilTypes.includes(t)} onChange={() => toggleOilType(t)} />
                {t}
              </label>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Selected: {engineOilTypes.length ? engineOilTypes.join(", ") : "—"}
          </div>
        </div>

        {/* Services */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-semibold text-slate-900">Services included</div>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="e.g. Oil filter change"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addService()
                }
              }}
            />
            <button
              onClick={addService}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {services.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {s}
                <button onClick={() => removeService(i)} className="text-red-600 hover:text-red-700" title="Remove">
                  ✕
                </button>
              </span>
            ))}
            {services.length === 0 && <div className="text-xs text-slate-500">No services added yet.</div>}
          </div>
        </div>

        {/* Addons */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-semibold text-slate-900">Addons</div>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="e.g. Interior cleaning"
              value={addonInput}
              onChange={(e) => setAddonInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addAddon()
                }
              }}
            />
            <button
              onClick={addAddon}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {addons.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {a}
                <button onClick={() => removeAddon(i)} className="text-red-600 hover:text-red-700" title="Remove">
                  ✕
                </button>
              </span>
            ))}
            {addons.length === 0 && <div className="text-xs text-slate-500">No addons added yet.</div>}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving || !title || price < 0}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>

          {editing ? (
            <button
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">All packages</div>

        {loading ? (
          <div className="mt-3 text-sm text-slate-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No packages yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((p) => (
              <div key={p._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {p.title} • <span className="text-emerald-700">{p.category}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      ₹ {p.price} • {p.durationMins ? `${p.durationMins} mins` : "—"} • Oil:{" "}
                      {Array.isArray(p.engineOilTypes) && p.engineOilTypes.length ? p.engineOilTypes.join(", ") : "—"} •{" "}
                      {p.isActive ? "Active" : "Inactive"}
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      <span className="font-semibold">Services:</span>{" "}
                      {Array.isArray(p.services) && p.services.length ? p.services.join(", ") : "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      <span className="font-semibold">Addons:</span>{" "}
                      {Array.isArray(p.addons) && p.addons.length ? p.addons.join(", ") : "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}