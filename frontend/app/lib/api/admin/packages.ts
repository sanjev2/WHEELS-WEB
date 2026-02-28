import { endpoints } from "../endpoints"
import { httpAuthJson } from "../http"

export type AdminPackage = {
  _id: string
  title: string
  description?: string | null
  category: string
  price: number
  durationMins?: number | null

  // ✅ NEW: multiple
  engineOilTypes?: string[]

  // ✅ NEW: arrays
  services?: string[]
  addons?: string[]

  isActive: boolean
}

export const adminPackagesApi = {
  list: (token: string) =>
    httpAuthJson<{ success: boolean; data: AdminPackage[] }>(endpoints.adminPackages, token, {
      method: "GET",
    }),

  create: (
    token: string,
    payload: {
      title: string
      description?: string | null
      category: string
      price: number
      durationMins?: number | null

      engineOilTypes?: string[]
      services?: string[]
      addons?: string[]

      isActive: boolean
    }
  ) =>
    httpAuthJson<{ success: boolean; message: string; data: AdminPackage }>(
      endpoints.adminPackages,
      token,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  update: (
    token: string,
    id: string,
    payload: {
      title: string
      description?: string | null
      category: string
      price: number
      durationMins?: number | null

      engineOilTypes?: string[]
      services?: string[]
      addons?: string[]

      isActive: boolean
    }
  ) =>
    httpAuthJson<{ success: boolean; message: string; data: AdminPackage }>(
      endpoints.adminPackageById(id),
      token,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  remove: (token: string, id: string) =>
    httpAuthJson<{ success: boolean; message: string }>(endpoints.adminPackageById(id), token, {
      method: "DELETE",
    }),
}