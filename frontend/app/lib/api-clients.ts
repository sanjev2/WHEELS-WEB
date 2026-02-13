const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function parse(res: Response) {
  const raw = await res.text()
  let data: any = null
  try {
    data = raw ? JSON.parse(raw) : null
  } catch {}
  return { raw, data }
}

export async function apiAuthWithToken<T>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // ✅ support full URL OR relative path
  const url = path.startsWith("http") ? path : `${API}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type when using FormData
    },
    cache: "no-store",
  })

  const { raw, data } = await parse(res)

  if (!res.ok) {
    // ✅ include status in error for easier debugging
    const msg = data?.message || raw?.slice(0, 300) || `Request failed (${res.status})`
    throw new Error(msg)
  }

  return data as T
}

export const adminUsersApi = {
  // ✅ supports page/limit/search
  getAll: (token: string, params?: { page?: number; limit?: number; search?: string }) => {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 50
    const search = (params?.search ?? "").trim()

    const qs = new URLSearchParams()
    qs.set("page", String(page))
    qs.set("limit", String(limit))
    if (search) qs.set("search", search)

    // ✅ IMPORTANT: pass RELATIVE path, not full URL
    return apiAuthWithToken<{
      success: boolean
      data: any[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>(token, `/admin/users?${qs.toString()}`)
  },

  getById: (token: string, id: string) =>
    apiAuthWithToken<any>(token, `/admin/users/${id}`),

  create: (token: string, formData: FormData) =>
    apiAuthWithToken<any>(token, `/admin/users`, { method: "POST", body: formData }),

  update: (token: string, id: string, formData: FormData) =>
    apiAuthWithToken<any>(token, `/admin/users/${id}`, { method: "PUT", body: formData }),

  remove: (token: string, id: string) =>
    apiAuthWithToken<any>(token, `/admin/users/${id}`, { method: "DELETE" }),
}
