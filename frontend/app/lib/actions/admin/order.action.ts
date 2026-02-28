import { adminOrdersApi } from "@/app/lib/api/admin/order"
import type { OrderStatus } from "@/app/lib/api/order"

export const adminOrdersActions = {
  list: (token: string) => adminOrdersApi.list(token),
  updateStatus: (token: string, id: string, status: OrderStatus) => adminOrdersApi.updateStatus(token, id, status),
}