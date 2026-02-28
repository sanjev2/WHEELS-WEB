import { endpoints } from "../endpoints"
import { httpAuthJson } from "../http"
import type { Order, OrderStatus } from "../order"

export const adminOrdersApi = {
  list: (token: string) =>
    httpAuthJson<{ success: boolean; data: Order[] }>(endpoints.adminOrders, token, { method: "GET" }),

  updateStatus: (token: string, id: string, status: OrderStatus) =>
    httpAuthJson<any>(endpoints.adminOrderStatus(id), token, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}