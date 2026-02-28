import { endpoints } from "../endpoints"
import { httpAuthJson } from "../http"

export type AdminProvider = {
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

export const adminProvidersApi = {
  list: (token: string) =>
    httpAuthJson<{ success: boolean; data: AdminProvider[] }>(endpoints.adminProviders, token, { method: "GET" }),

  create: (token: string, payload: Omit<AdminProvider, "_id">) =>
    httpAuthJson<any>(endpoints.adminProviders, token, { method: "POST", body: JSON.stringify(payload) }),

  update: (token: string, id: string, payload: Omit<AdminProvider, "_id">) =>
    httpAuthJson<any>(endpoints.adminProviderById(id), token, { method: "PUT", body: JSON.stringify(payload) }),

  remove: (token: string, id: string) =>
    httpAuthJson<any>(endpoints.adminProviderById(id), token, { method: "DELETE" }),
}