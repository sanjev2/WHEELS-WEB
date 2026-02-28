import { endpoints } from "./endpoints"
import { httpJson } from "./http"

export type PublicProvider = {
  _id: string
  name: string
  locationText?: string | null
  openFrom: string
  openTo: string
  lat: number
  lng: number
  placeId?: string | null
  categories: string[]
  isActive: boolean
}

export const providersPublicApi = {
  list: (category?: string) => {
    const url = new URL(endpoints.providers)
    if (category) url.searchParams.set("category", category)
    return httpJson<{ success: boolean; data: PublicProvider[] }>(url.toString(), { method: "GET" })
  },
}