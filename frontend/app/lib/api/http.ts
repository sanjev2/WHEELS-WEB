async function parse(res: Response) {
  const raw = await res.text();
  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  return { raw, data };
}

function buildErrorMessage(url: string, res: Response, parsed: { raw: string; data: any }) {
  const serverMsg =
    parsed?.data?.message ||
    parsed?.data?.error ||
    (typeof parsed?.data === "string" ? parsed.data : null) ||
    parsed?.raw?.slice(0, 300) ||
    "";

  return `Request failed (${res.status} ${res.statusText})\nURL: ${url}\n${serverMsg}`;
}

/** JSON request without auth */
export async function httpJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const parsed = await parse(res);

  if (!res.ok) {
    throw new Error(buildErrorMessage(url, res, parsed));
  }

  return parsed.data as T;
}

/** JSON request with auth token */
export async function httpAuthJson<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const parsed = await parse(res);

  if (!res.ok) {
    throw new Error(buildErrorMessage(url, res, parsed));
  }

  return parsed.data as T;
}

/** FormData request with auth token (do NOT set Content-Type) */
export async function httpAuthForm<T>(
  url: string,
  token: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    method: options.method || "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const parsed = await parse(res);

  if (!res.ok) {
    throw new Error(buildErrorMessage(url, res, parsed));
  }

  return parsed.data as T;
}