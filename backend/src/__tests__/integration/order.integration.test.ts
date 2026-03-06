// src/__tests__/integration/order.integration.test.ts
import mongoose from "mongoose"
import { api, ROUTES } from "./integration.helpers"

/**
 * ✅ NO AUTH FLOW:
 * We bypass auth by mocking the auth middleware used by routes.
 * This ensures req.user is always present.
 */
jest.mock("../../middleware/auth.middleware", () => {
  return {
    authMiddleware: (req: any, _res: any, next: any) => {
      req.user = {
        userId: "507f191e810c19729de860ea", // fixed valid ObjectId string
        email: "test@test.com",
        role: "user",
      }
      next()
    },
  }
})

/**
 * If any order route uses admin middleware too, bypass it as well.
 * (Safe even if not used.)
 */
jest.mock("../../middleware/admin.middleware", () => {
  return {
    adminMiddleware: (_req: any, _res: any, next: any) => next(),
  }
})

async function cleanupDb() {
  // ✅ safe + TS-friendly
  const db = (mongoose.connection as any).db
  if (!db) return

  const cols = await db.collections()
  for (const c of cols) {
    await c.deleteMany({})
  }
}

describe("Orders (integration) - NO AUTH FLOW", () => {
  beforeAll(async () => {
    await cleanupDb()
  })

  afterEach(async () => {
    await cleanupDb()
  })

  afterAll(async () => {
    // don't force close if other suites share connection
    // but it's fine if your global setup doesn't handle it
  })

  it("GET /api/orders/my -> 200 (mock-auth user)", async () => {
    const res = await api.get(ROUTES.ordersMy)

    expect(res.status).toBe(200)
    expect(res.body).toBeTruthy()

    // allow either {data: []} or {data: {..}} depending on your controller
    if ("data" in res.body) {
      expect(res.body.success).toBeTruthy()
    }
  })

  it("POST /api/orders/paid -> 400 when body missing (no auth)", async () => {
    // ✅ this endpoint exists in your helpers (ROUTES.ordersPaid)
    // We intentionally send empty payload -> should be validation error (400)
    const res = await api.post(ROUTES.ordersPaid).send({})

    // Most APIs return 400 for missing required fields
    // If your controller returns 422 instead, add it here.
    expect([400, 422]).toContain(res.status)
    expect(res.body).toBeTruthy()
  })
})