import { adminUsersApi } from "@/app/lib/api/admin/user"

export const adminUserActions = {
  // GET /api/admin/users
  list: (token: string) => adminUsersApi.getAll(token),

  // POST /api/admin/users  (FormData + Multer)
  createForm: (token: string, fd: FormData) =>
    adminUsersApi.create(token, fd),

  // GET /api/admin/users/:id
  getById: (token: string, id: string) =>
    adminUsersApi.getById(token, id),

  // PUT /api/admin/users/:id  (FormData)
  updateForm: (token: string, id: string, fd: FormData) =>
    adminUsersApi.update(token, id, fd),

  // DELETE /api/admin/users/:id
  remove: (token: string, id: string) =>
    adminUsersApi.remove(token, id),
}
