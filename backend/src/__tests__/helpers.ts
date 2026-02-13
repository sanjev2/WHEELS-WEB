import request from "supertest"
import app from "../app"

export const ROUTES = {
  signup: "/api/auth/signup",
  login: "/api/auth/login",
  forgotPassword: "/api/auth/forgot-password",
  verifyResetCode: "/api/auth/verify-reset-code",
  resetPassword: "/api/auth/reset-password",

  adminUsers: "/api/admin/users",
  adminUserById: (id: string) => `/api/admin/users/${id}`,
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// ✅ Handles common token shapes
export function extractToken(body: any) {
  return (
    body?.token ||
    body?.data?.token ||
    body?.accessToken ||
    body?.data?.accessToken ||
    body?.data?.access_token ||
    body?.access_token
  )
}

export async function signup(payload: { name: string; email: string; password: string; role?: string }) {
  return request(app).post(ROUTES.signup).send(payload)
}

export async function login(email: string, password: string) {
  return request(app).post(ROUTES.login).send({ email, password })
}

export async function getAdminToken() {
  const admin = {
    name: "Admin",
    email: "admin@test.com",
    password: "Password@123",
    role: "admin",
  }

  await signup(admin)
  const res = await login(admin.email, admin.password)

  const token = extractToken(res.body)
  if (!token) {
    throw new Error(
      "Token not found in login response. Please check /api/auth/login response body (token location)."
    )
  }
  return token as string
}

export async function createUserAsAdmin(token: string, i: number) {
  // ✅ JSON create (multer won't run because not multipart)
  return request(app)
    .post(ROUTES.adminUsers)
    .set(authHeader(token))
    .send({
      name: `User ${i}`,
      email: `user${i}@test.com`,
      password: "Password@123",
      role: "user",
    })
}

export async function seedUsers(token: string, count: number) {
  for (let i = 1; i <= count; i++) {
    const res = await createUserAsAdmin(token, i)
    if (![200, 201].includes(res.status)) {
      throw new Error(`Seed failed at user ${i}: ${res.status} ${JSON.stringify(res.body)}`)
    }
  }
}

export function pickId(body: any) {
  return body?.data?._id || body?._id || body?.user?._id || body?.data?.user?._id
}
