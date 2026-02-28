export type BookingDraft = {
  // ✅ required to save order later
  carId: string

  // package
  packageId: string
  packageTitle: string
  category: string

  basePrice: number
  durationMins?: number | null

  // selections
  selectedOilType?: string | null
  selectedAddons: string[]

  // provider
  providerId: string
  providerName: string

  totalPrice: number
}

const KEY = "wheels_booking_draft"

export function saveBookingDraft(draft: BookingDraft) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(draft))
}

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as BookingDraft
  } catch {
    return null
  }
}

export function clearBookingDraft() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}