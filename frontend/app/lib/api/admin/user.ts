import { endpoints } from "../endpoints"

async function parse(res: Response) {
  const raw = await res.text()
  let data: any = null
  try {
    data = raw ? JSON.parse(raw) : null
  } catch {
    data = null
  }
  return { raw, data }
}

export async function adminAuthFetch<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type when using FormData
    },
  })

  const { raw, data } = await parse(res)

  if (!res.ok) {
    throw new Error(data?.message || raw?.slice(0, 200) || "Request failed")
  }

  return data as T
}

export const adminUsersApi = {
  // ✅ NEW: supports page/limit/search
  getAll: (token: string, params?: { page?: number; limit?: number; search?: string }) => {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const search = (params?.search ?? "").trim()

    const url = new URL(endpoints.adminUsers)
    url.searchParams.set("page", String(page))
    url.searchParams.set("limit", String(limit))
    if (search) url.searchParams.set("search", search)

    return adminAuthFetch<{
      success: boolean
      data: any[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(url.toString(), token)
  },

  getById: (token: string, id: string) => adminAuthFetch<any>(endpoints.adminUserById(id), token),

  create: (token: string, formData: FormData) =>
    adminAuthFetch<any>(endpoints.adminUsers, token, { method: "POST", body: formData }),

  update: (token: string, id: string, formData: FormData) =>
    adminAuthFetch<any>(endpoints.adminUserById(id), token, { method: "PUT", body: formData }),

  remove: (token: string, id: string) =>
    adminAuthFetch<any>(endpoints.adminUserById(id), token, { method: "DELETE" }),
}
