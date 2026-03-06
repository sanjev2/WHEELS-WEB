import request from "supertest"
import app from "../../app"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../../config"

export const api = request(app)

export const ROUTES = {
  signup: "/api/auth/signup",
  login: "/api/auth/login",
  me: "/api/auth/me",
  changePassword: "/api/auth/change-password",

  cars: "/api/cars",

  publicCategories: "/api/categories",
  publicVehicles: "/api/vehicles",
  publicPackages: "/api/packages",
  publicProviders: "/api/providers",

  adminUsers: "/api/admin/users",
  adminVehicles: "/api/admin/vehicles",
  adminPackages: "/api/admin/packages",
  adminProviders: "/api/admin/providers",
  adminOrders: "/api/admin/orders",
  ordersPaid: "/api/orders/paid",
  ordersMy: "/api/orders/my",
  esewaInitiate: "/api/esewa/initiate",
}

export const RUN_ID = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
export const uniqEmail = (p: string) => `${p}_${RUN_ID}@test.com`

export async function signupUser(payload?: Partial<any>) {
  const body = {
    name: "Test User",
    email: uniqEmail("user"),
    contact: "9800000000",
    address: "KTM",
    password: "Password@123",
    confirmPassword: "Password@123",
    ...payload,
  }
  return request(app).post(ROUTES.signup).send(body)
}

export async function loginUser(email: string, password = "Password@123") {
  return request(app).post(ROUTES.login).send({ email, password })
}

export async function createUserAndToken(role: "user" | "admin" = "user") {
  const email = uniqEmail(role)
  await signupUser({ email, role })

  const login = await loginUser(email)

  // ✅ support both response shapes
  const token = login.body?.token || login.body?.data?.token

  return { email, token }
}

export const makeToken = (payload: { userId: string; email: string; role: "user" | "admin" }) => {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" })
}

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

export const newObjectId = () => new mongoose.Types.ObjectId().toString()

export const uniq = (p = "x") => `${p}_${Date.now()}_${Math.floor(Math.random() * 10000)}`