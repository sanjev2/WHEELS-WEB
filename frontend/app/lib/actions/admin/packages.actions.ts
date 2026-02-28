import { adminPackagesApi } from "@/app/lib/api/admin/packages";

export const adminPackagesActions = {
  list: (token: string) => adminPackagesApi.list(token),
  create: (token: string, payload: Parameters<typeof adminPackagesApi.create>[1]) =>
    adminPackagesApi.create(token, payload),
  update: (token: string, id: string, payload: Parameters<typeof adminPackagesApi.update>[2]) =>
    adminPackagesApi.update(token, id, payload),
  remove: (token: string, id: string) => adminPackagesApi.remove(token, id),
};