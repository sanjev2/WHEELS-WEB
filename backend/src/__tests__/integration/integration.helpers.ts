import request from "supertest"
import app from "../../app"

export const ROUTES = {
  adminUsers: "/api/admin/users",
  adminUserById: (id: string) => `/api/admin/users/${id}`,

  // Auth endpoints (keep these; helper will still try alternatives)
  forgotPassword: "/api/auth/forgot-password",
  verifyResetCode: "/api/auth/verify-reset-code",
  resetPassword: "/api/auth/reset-password",
}

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

// ✅ Unique per test run
export const RUN_ID = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
export function uniqEmail(prefix: string) {
  return `${prefix}_${RUN_ID}@test.com`
}

// ✅ Your backend login route is not /api/auth/login (you got 404)
// so try multiple common paths
const SIGNUP_PATHS = [
  "/api/auth/signup",
  "/api/auth/register",
  "/api/users/signup",
  "/api/users/register",
]

const LOGIN_PATHS = [
  "/api/auth/login",
  "/api/auth/signin",
  "/api/users/login",
  "/api/users/signin",
]

// --- deep search for JWT-like token ---
function findJwt(value: any): string | null {
  if (!value) return null
  if (typeof value === "string") {
    if (value.startsWith("eyJ") && value.split(".").length === 3) return value
    return null
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      const found = findJwt(v)
      if (found) return found
    }
    return null
  }
  if (typeof value === "object") {
    for (const k of Object.keys(value)) {
      const found = findJwt((value as any)[k])
      if (found) return found
    }
  }
  return null
}

// ✅ Extract token from body / headers / cookies
function extractToken(res: any): string | null {
  const fromBodyDeep = findJwt(res?.body)
  if (fromBodyDeep) return fromBodyDeep

  const b = res?.body || {}
  const direct =
    b?.token ||
    b?.accessToken ||
    b?.jwt ||
    b?.data?.token ||
    b?.data?.accessToken ||
    b?.data?.jwt ||
    b?.data?.auth?.token ||
    b?.auth?.token

  if (typeof direct === "string" && direct.length > 10) return direct

  const auth = res?.headers?.authorization || res?.headers?.Authorization
  if (typeof auth === "string" && auth.includes("Bearer ")) return auth.split("Bearer ")[1].trim()

  const cookies: string[] = res?.headers?.["set-cookie"] || []
  for (const c of cookies) {
    const m = c.match(/token=([^;]+)/i)
    if (m?.[1]) return m[1]
  }

  return null
}

/**
 * ✅ Dummy signup payload that matches your backend validation:
 * - contact (string)
 * - address (string)
 * - confirmPassword (string)
 *
 * We still try a few variants in case field names differ.
 */
export async function signupSmart(payload: { name: string; email: string; password: string; role?: string }) {
  const base = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  }

  const candidates: any[] = [
    // Most likely required by your backend
    { ...base, confirmPassword: payload.password, contact: "9800000000", address: "Dummy Address" },

    // Some backends use phone instead of contact
    { ...base, confirmPassword: payload.password, phone: "9800000000", address: "Dummy Address" },

    // Some use fullName
    { ...base, fullName: payload.name, confirmPassword: payload.password, contact: "9800000000", address: "Dummy Address" },

    // fallback minimal
    { ...base, confirmPassword: payload.password },
  ]

  let lastRes: any = null

  for (const path of SIGNUP_PATHS) {
    for (const body of candidates) {
      const res = await request(app).post(path).send(body)
      lastRes = res

      if ([200, 201].includes(res.status)) return res
      if (res.status === 404) break
      if (res.status === 409) return res
    }
  }

  return lastRes ?? request(app).post(SIGNUP_PATHS[0]).send(candidates[0])
}

/** ✅ Smart login: tries multiple login endpoints */
export async function loginSmart(email: string, password: string) {
  let lastRes: any = null

  for (const path of LOGIN_PATHS) {
    const res = await request(app).post(path).send({ email, password })
    lastRes = res
    if (res.status !== 404) return res
  }

  return lastRes ?? request(app).post(LOGIN_PATHS[0]).send({ email, password })
}

export async function getAdminToken() {
  const admin = {
    name: "Admin",
    email: uniqEmail("admin"),
    password: "Password@123",
    role: "admin",
  }

  const reg = await signupSmart(admin)
  if (![200, 201, 409].includes(reg.status)) {
    throw new Error(`Admin signup failed: ${reg.status} ${JSON.stringify(reg.body)}`)
  }

  const log = await loginSmart(admin.email, admin.password)
  if (log.status === 404) {
    throw new Error(`Login route not found. Tried: ${LOGIN_PATHS.join(", ")}`)
  }

  if (![200, 201].includes(log.status)) {
    throw new Error(`Admin login failed: ${log.status} ${JSON.stringify(log.body)}`)
  }

  const token = extractToken(log)
  if (!token) {
    throw new Error(`Token not found in login response. Body: ${JSON.stringify(log.body)}`)
  }

  return token
}

export async function createUserAsAdmin(
  token: string,
  payload?: Partial<{ name: string; email: string; password: string; role: string }>
) {
  const body = {
    name: payload?.name ?? "User",
    email: payload?.email ?? uniqEmail("user"),
    password: payload?.password ?? "Password@123",
    role: payload?.role ?? "user",
  }

  return request(app).post(ROUTES.adminUsers).set(authHeader(token)).send(body)
}

export async function seedUsers(token: string, count: number) {
  for (let i = 1; i <= count; i++) {
    const res = await createUserAsAdmin(token, {
      name: `User ${i}`,
      email: `user${i}_${RUN_ID}@test.com`,
    })
    if (![200, 201].includes(res.status)) {
      throw new Error(`Seeding failed: ${res.status} ${JSON.stringify(res.body)}`)
    }
  }
}

export function pickId(body: any) {
  return body?.data?._id || body?._id || body?.user?._id || body?.data?.user?._id
}
