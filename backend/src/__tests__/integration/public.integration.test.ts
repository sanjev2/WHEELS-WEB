import { api } from "./integration.helpers"

describe("Public routes (integration)", () => {
  it("GET /api/categories -> 200", async () => {
    const res = await api.get("/api/categories")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it("GET /api/vehicles -> 200", async () => {
    const res = await api.get("/api/vehicles")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("GET /api/packages -> 200", async () => {
    const res = await api.get("/api/packages")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("GET /api/providers -> 200", async () => {
    const res = await api.get("/api/providers")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})