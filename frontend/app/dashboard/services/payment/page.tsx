"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/auth-contexts"
import { clearBookingDraft, loadBookingDraft } from "@/app/lib/booking-draft"

type Status =
  | "IDLE"
  | "INITIATING"
  | "REDIRECTING"
  | "RETURNED_SUCCESS"
  | "RETURNED_FAILED"

export default function PaymentPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const { token } = useAuth()

  const [draft, setDraft] = useState<ReturnType<typeof loadBookingDraft>>(null)
  const [status, setStatus] = useState<Status>("IDLE")
  const [err, setErr] = useState<string | null>(null)

  // eSewa logo (remote)
  const esewaLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Esewa_logo.webp/1200px-Esewa_logo.webp.png"

  const apiBase = useMemo(() => {
    // should be: http://localhost:5000/api
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  }, [])

  useEffect(() => {
    setDraft(loadBookingDraft())
  }, [])

  // If backend redirects back here with status=COMPLETE or paid=1
  useEffect(() => {
    const paid = sp.get("paid")
    const statusQ = sp.get("status")

    // ✅ If you choose to redirect to this page on success: ?paid=1
    if (paid === "1") {
      setStatus("RETURNED_SUCCESS")
      setErr(null)
      // small success animation delay, then go orders
      const t = setTimeout(() => {
        clearBookingDraft()
        router.replace("/dashboard/orders?paid=1")
      }, 1600)
      return () => clearTimeout(t)
    }

    // ✅ If backend redirects here with a failure/pending code
    if (statusQ && statusQ !== "COMPLETE") {
      setStatus("RETURNED_FAILED")
      setErr(`Payment status: ${statusQ}`)
    }
  }, [sp, router])

  function submitEsewaForm(esewaUrl: string, fields: Record<string, any>) {
    const form = document.createElement("form")
    form.method = "POST"
    form.action = esewaUrl

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = k
      input.value = String(v)
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  async function payWithEsewa() {
    if (!token) {
      setErr("You are not logged in.")
      return
    }
    if (!draft) {
      setErr("No booking selected.")
      return
    }

    try {
      setStatus("INITIATING")
      setErr(null)

      const resp = await fetch(`${apiBase}/esewa/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: JSON.stringify({
          total_amount: String(draft.totalPrice),
          booking: {
            carId: draft.carId,
            packageId: draft.packageId,
            packageTitle: draft.packageTitle,
            category: draft.category,
            basePrice: draft.basePrice,
            durationMins: draft.durationMins ?? null,
            selectedOilType: draft.selectedOilType ?? null,
            selectedAddons: draft.selectedAddons ?? [],
            providerId: draft.providerId,
            providerName: draft.providerName,
            totalPrice: draft.totalPrice,
          },
        }),
      })

      const json = await resp.json()
      if (!resp.ok || !json?.success) throw new Error(json?.message || "Failed to initiate eSewa")

      const { esewaUrl, fields } = json.data
      if (!esewaUrl || !fields) throw new Error("Invalid eSewa initiation response")

      setStatus("REDIRECTING")
      submitEsewaForm(esewaUrl, fields)
    } catch (e: any) {
      setStatus("IDLE")
      setErr(e.message || "Payment failed")
    }
  }

  const isBusy = status === "INITIATING" || status === "REDIRECTING"

  if (!draft) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <div className="text-lg font-semibold text-slate-900">Payment</div>
        <div className="text-sm text-slate-600">No booking selected. Please choose a package first.</div>
        <button
          onClick={() => router.push("/dashboard/services")}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Go to Services
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Payment</div>
        <p className="mt-2 text-sm text-slate-600">
          Pay securely with eSewa. You’ll be redirected to complete payment.
        </p>
      </div>

      {/* Success overlay (only if this page is used as success landing with ?paid=1) */}
      {status === "RETURNED_SUCCESS" ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-700">Payment Complete</div>
              <div className="text-lg font-bold text-slate-900">Thank you! 🎉</div>
              <div className="mt-1 text-sm text-slate-600">Redirecting to Orders…</div>
            </div>

            <div className="relative h-14 w-14">
              {/* pulse ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/10" />
              {/* check */}
              <div className="absolute inset-0 grid place-items-center rounded-full bg-emerald-600 text-white">
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <path
                    fill="currentColor"
                    d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-full origin-left bg-emerald-600 animate-[progress_1.6s_ease-in-out_forwards]" />
          </div>

          <style jsx>{`
            @keyframes progress {
              from {
                transform: scaleX(0);
              }
              to {
                transform: scaleX(1);
              }
            }
          `}</style>
        </div>
      ) : null}

      {/* Error */}
      {err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      {/* eSewa card */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {/* banner */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-white text-sm font-semibold">Pay with</div>
              <div className="text-white text-xl font-bold tracking-tight">eSewa</div>
              <div className="text-emerald-100 text-xs mt-1">Fast • Secure • Nepal’s popular wallet</div>
            </div>

            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-sm">
              <img src={esewaLogoUrl} alt="eSewa" className="h-8 w-auto" loading="lazy" />
            </div>
          </div>
        </div>

        {/* body */}
        <div className="p-6">
          <div className="text-sm font-semibold text-slate-900">Order Summary</div>

          <div className="mt-3 text-sm text-slate-700 space-y-1">
            <div>
              <span className="text-slate-500">Provider:</span>{" "}
              <span className="font-semibold">{draft.providerName}</span>
            </div>

            <div>
              <span className="text-slate-500">Package:</span>{" "}
              <span className="font-semibold">{draft.packageTitle}</span>
            </div>

            {draft.selectedOilType ? (
              <div>
                <span className="text-slate-500">Oil Type:</span>{" "}
                <span className="font-semibold">{draft.selectedOilType}</span>
              </div>
            ) : null}

            <div>
              <span className="text-slate-500">Add-ons:</span>{" "}
              <span className="font-semibold">
                {draft.selectedAddons.length ? draft.selectedAddons.join(", ") : "—"}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-slate-500">Total:</span>{" "}
              <span className="font-semibold text-slate-900">₹ {draft.totalPrice}</span>
            </div>
          </div>

          {/* actions */}
          <div className="mt-5 grid gap-2 md:grid-cols-2">
            <button
              onClick={payWithEsewa}
              disabled={isBusy || !token}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {status === "INITIATING" ? (
                <>
                  <Spinner />
                  Preparing…
                </>
              ) : status === "REDIRECTING" ? (
                <>
                  <Spinner />
                  Redirecting…
                </>
              ) : (
                "Pay with eSewa"
              )}
            </button>

            <button
              onClick={() => {
                clearBookingDraft()
                router.push("/dashboard/services")
              }}
              disabled={isBusy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            By clicking “Pay with eSewa”, you’ll be redirected to eSewa to complete the payment.
          </div>
        </div>
      </div>

      {/* Tip: If your backend redirects directly to /dashboard/orders?paid=1, the animation will show on Orders page.
          If you want animation here, change backend success redirect to:
          `${APP_BASE_URL}/dashboard/services/payment?paid=1`
          and then this page will show animation and auto-redirect to orders.
      */}
    </div>
  )
}

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  )
}