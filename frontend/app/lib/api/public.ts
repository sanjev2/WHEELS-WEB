import { endpoints } from "./endpoints"
import { httpJson } from "./http"

export type PublicPackage = {
  _id: string
  title: string
  description?: string | null
  category: string
  price: number
  durationMins?: number | null

  // ✅ NEW
  engineOilTypes?: string[]
  services?: string[]
  addons?: string[]

  isActive: boolean
}

export const publicApi = {
  categories: () =>
    httpJson<{ success: boolean; data: string[] }>(endpoints.categories, { method: "GET" }),

  packages: (category?: string) => {
    const url = new URL(endpoints.publicPackages)
    if (category) url.searchParams.set("category", category)
    return httpJson<{ success: boolean; data: PublicPackage[] }>(url.toString(), { method: "GET" })
  },
}