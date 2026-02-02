export async function httpJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed"
    throw new Error(msg)
  }
  return data as T
}

export async function httpAuthJson<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed"
    throw new Error(msg)
  }
  return data as T
}

export async function httpAuthForm<T>(
  url: string,
  token: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  // IMPORTANT: do NOT set Content-Type manually for FormData
  const res = await fetch(url, {
    ...options,
    method: options.method || "POST",
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed"
    throw new Error(msg)
  }
  return data as T
}
