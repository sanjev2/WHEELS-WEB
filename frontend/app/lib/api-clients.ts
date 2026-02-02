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
  const res = await fetch(`${API}${path}`, {
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
