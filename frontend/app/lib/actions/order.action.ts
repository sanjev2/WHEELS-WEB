import { ordersApi } from "@/app/lib/api/order"

export const ordersActions = {
  myOrders: (token: string) => ordersApi.myOrders(token),
  createPaid: (token: string, payload: any) => ordersApi.createPaid(token, payload),
}