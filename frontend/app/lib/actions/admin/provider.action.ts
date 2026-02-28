import { adminProvidersApi } from "@/app/lib/api/admin/provider"

export const adminProvidersActions = {
  list: (token: string) => adminProvidersApi.list(token),
  create: (token: string, payload: any) => adminProvidersApi.create(token, payload),
  update: (token: string, id: string, payload: any) => adminProvidersApi.update(token, id, payload),
  remove: (token: string, id: string) => adminProvidersApi.remove(token, id),
}