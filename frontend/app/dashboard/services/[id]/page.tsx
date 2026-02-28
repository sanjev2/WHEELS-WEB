"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"
import { getActiveCarId } from "@/app/lib/active-car"
import { carsActions } from "@/app/lib/actions/car.action"
import { publicActions } from "@/app/lib/actions/public"
import { providersPublicActions } from "@/app/lib/actions/provider.public.action"
import type { Car } from "@/app/lib/api/cars"
import type { PublicPackage } from "@/app/lib/api/public"
import type { PublicProvider } from "@/app/lib/api/provider.public"
import { saveBookingDraft } from "@/app/lib/booking-draft"

export default function ServiceBookingPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { token } = useAuth()

  const [activeCar, setActiveCar] = useState<Car | null>(null)
  const [pkg, setPkg] = useState<PublicPackage | null>(null)
  const [providers, setProviders] = useState<PublicProvider[]>([])

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // selections
  const [oilType, setOilType] = useState<string>("")
  const [addons, setAddons] = useState<string[]>([])

  // provider selection (ONLY ONE place)
  const [providerId, setProviderId] = useState<string>("")
  const [showProvider, setShowProvider] = useState(false)

  const providerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setErr(null)

        const activeCarId = getActiveCarId()
        if (!activeCarId || !token) {
          if (!mounted) return
          router.replace("/dashboard/vehicles")
          return
        }

        // 1) find active car
        const carsRes = await carsActions.listMine(token)
        const foundCar = carsRes.data.find((c) => c._id === activeCarId) || null
        if (!foundCar) {
          if (!mounted) return
          router.replace("/dashboard/vehicles")
          return
        }

        // 2) packages for that category → find selected package id
        const pkgsRes = await publicActions.packages(foundCar.category)
        const foundPkg = pkgsRes.data.find((p) => p._id === params.id) || null
        if (!foundPkg) {
          if (!mounted) return
          setActiveCar(foundCar)
          setPkg(null)
          setProviders([])
          setErr("Package not found for your selected car category.")
          return
        }

        // 3) providers for that category
        const provRes = await providersPublicActions.list(foundCar.category)
        const provList = provRes.data || []

        // init defaults
        const oils =
          Array.isArray((foundPkg as any).engineOilTypes)
            ? ((foundPkg as any).engineOilTypes as string[])
            : []
        const defaultOil = oils.length ? oils[0] : ""

        if (!mounted) return
        setActiveCar(foundCar)
        setPkg(foundPkg)
        setProviders(provList)

        setOilType(defaultOil)
        setAddons([])
        setProviderId("")
        setShowProvider(false)
      } catch (e: any) {
        if (!mounted) return
        setErr(e.message || "Failed to load booking details")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [params.id, token, router])

  const availableOils = useMemo(() => {
    const oils = (pkg as any)?.engineOilTypes
    return Array.isArray(oils) ? (oils as string[]) : []
  }, [pkg])

  const availableAddons = useMemo(() => (Array.isArray(pkg?.addons) ? pkg!.addons! : []), [pkg])
  const services = useMemo(() => (Array.isArray(pkg?.services) ? pkg!.services! : []), [pkg])

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === providerId) || null,
    [providers, providerId]
  )

  const totalPrice = useMemo(() => (pkg ? pkg.price : 0), [pkg])

  function toggleAddon(name: string) {
    setAddons((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))
  }

  function openProviderSection() {
    if (!pkg) return

    // If oil types exist, user must select one
    if (availableOils.length > 0 && !oilType) {
      setErr("Please select an engine oil type.")
      return
    }

    setErr(null)
    setShowProvider(true)

    // smooth scroll to provider section
    setTimeout(() => {
      providerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  function continueToPayment() {
    if (!pkg || !activeCar) return

    if (availableOils.length > 0 && !oilType) {
      setErr("Please select an engine oil type.")
      return
    }

    if (!providerId) {
      setErr("Please select a service provider.")
      setShowProvider(true)
      setTimeout(() => {
        providerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
      return
    }

    setErr(null)

    saveBookingDraft({
      carId: activeCar._id,

      packageId: pkg._id,
      packageTitle: pkg.title,
      category: pkg.category,

      basePrice: pkg.price,
      durationMins: pkg.durationMins ?? null,

      selectedOilType: availableOils.length ? oilType : null,
      selectedAddons: addons,

      providerId,
      providerName: selectedProvider?.name || "Selected Provider",

      totalPrice,
    })

    router.push("/dashboard/services/payment")
  }

  if (loading) {
    return <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">Loading…</div>
  }

  if (err && !pkg) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <div className="text-lg font-semibold text-slate-900">Booking</div>
        <div className="text-sm font-semibold text-red-700">{err}</div>
        <button
          onClick={() => router.push("/dashboard/services")}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to Services
        </button>
      </div>
    )
  }

  if (!pkg || !activeCar) return null

  return (
    <div className="space-y-5">
      {err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      {/* Package details */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">{pkg.category}</div>
        <div className="mt-2 text-xl font-semibold text-slate-900">{pkg.title}</div>
        {pkg.description ? <div className="mt-2 text-sm text-slate-600">{pkg.description}</div> : null}

        <div className="mt-4 text-sm text-slate-700">
          For:{" "}
          <span className="font-semibold text-slate-900">
            {activeCar.make} {activeCar.model} ({activeCar.year})
          </span>{" "}
          • <span className="font-semibold text-emerald-700">{activeCar.category}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Base Price: ₹ {pkg.price}</div>
          {pkg.durationMins ? <div className="text-xs text-slate-500">Duration: {pkg.durationMins} mins</div> : null}
        </div>
      </div>

      {/* Services list */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Services Included</div>
        {services.length === 0 ? (
          <div className="mt-2 text-sm text-slate-600">No services listed.</div>
        ) : (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
            {services.map((s, i) => (
              <li key={`${s}-${i}`}>{s}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Step 1: Oil type */}
      {availableOils.length > 0 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Step 1: Select Engine Oil Type</div>
          <div className="mt-3 space-y-2">
            {availableOils.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="radio" name="oil" checked={oilType === t} onChange={() => setOilType(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Addons */}
      {availableAddons.length > 0 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Step 2: Select Add-ons</div>
          <div className="mt-3 space-y-2">
            {availableAddons.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={addons.includes(a)} onChange={() => toggleAddon(a)} />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Provider (ONLY ONE PLACE) */}
      <div ref={providerRef} className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Step 3: Choose Provider</div>
            <div className="mt-1 text-sm text-slate-600">
              Select provider and continue to payment.
            </div>
          </div>

          <button
            onClick={openProviderSection}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {showProvider ? "Provider Open" : "Select Provider"}
          </button>
        </div>

        {/* Smooth collapse/expand */}
        <div
          className={[
            "transition-all duration-300 ease-in-out overflow-hidden",
            showProvider ? "max-h-[700px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0",
          ].join(" ")}
        >
          {providers.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
              No active providers available for this category.
            </div>
          ) : (
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
            >
              <option value="">Select provider…</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} • {p.openFrom}-{p.openTo} {p.locationText ? `• ${p.locationText}` : ""}
                </option>
              ))}
            </select>
          )}

          {/* Summary */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Summary</div>
            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <div>
                <span className="text-slate-500">Package:</span>{" "}
                <span className="font-semibold">{pkg.title}</span>
              </div>

              {availableOils.length > 0 ? (
                <div>
                  <span className="text-slate-500">Oil Type:</span>{" "}
                  <span className="font-semibold">{oilType || "—"}</span>
                </div>
              ) : null}

              <div>
                <span className="text-slate-500">Add-ons:</span>{" "}
                <span className="font-semibold">{addons.length ? addons.join(", ") : "—"}</span>
              </div>

              <div>
                <span className="text-slate-500">Provider:</span>{" "}
                <span className="font-semibold">{selectedProvider?.name || "—"}</span>
              </div>

              <div>
                <span className="text-slate-500">Total:</span>{" "}
                <span className="font-semibold">₹ {totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <button
            onClick={continueToPayment}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            disabled={providers.length > 0 && showProvider && !providerId}
          >
            Continue to Payment
          </button>

          <button
            onClick={() => router.push("/dashboard/services")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}