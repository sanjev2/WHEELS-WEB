import { endpoints } from "./endpoints"
import { httpAuthJson } from "./http"

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type Order = {
  _id: string
  packageTitle: string
  category: string
  basePrice: number
  totalPrice: number
  durationMins?: number | null

  selectedOilType?: string | null
  selectedAddons?: string[]

  providerName: string

  status: OrderStatus
  createdAt: string
}

export const ordersApi = {
  myOrders: (token: string) =>
    httpAuthJson<{ success: boolean; data: Order[] }>(endpoints.myOrders, token, { method: "GET" }),

  createPaid: (token: string, payload: any) =>
    httpAuthJson<{ success: boolean; message: string; data: Order }>(endpoints.createPaidOrder, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}