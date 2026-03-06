// src/__tests__/integration/admin.vehicles.integration.test.ts
import { api, authHeader, makeToken } from "./integration.helpers"

describe("Admin Vehicles (integration)", () => {
  // ✅ Mint admin token for middleware
  const adminToken = makeToken({ userId: "admin_test", email: "admin@test.com", role: "admin" })

  it("POST create -> 201", async () => {
    const res = await api
      .post("/api/admin/vehicles")
      .set(authHeader(adminToken))
      .send({ name: "Vehicle 1", category: "SUV", isActive: true })

    expect([200, 201]).toContain(res.status)
    expect(res.body.success).toBe(true)
    expect(res.body.data?._id).toBeTruthy()
  })

  it("PUT update -> 400 when empty body", async () => {
    // create first
    const created = await api
      .post("/api/admin/vehicles")
      .set(authHeader(adminToken))
      .send({ name: "Vehicle 2", category: "SUV", isActive: true })

    const id = created.body.data._id

    const res = await api.put(`/api/admin/vehicles/${id}`).set(authHeader(adminToken)).send({})

    // ✅ correct API behavior should be 400 if no fields provided
    expect(res.status).toBe(400)
  })

  it("PUT update -> 200 when valid", async () => {
    const created = await api
      .post("/api/admin/vehicles")
      .set(authHeader(adminToken))
      .send({ name: "Vehicle 3", category: "SUV", isActive: true })

    const id = created.body.data._id

    const res = await api
      .put(`/api/admin/vehicles/${id}`)
      .set(authHeader(adminToken))
      .send({ name: "Updated Vehicle 3" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe("Updated Vehicle 3")
  })

  it("DELETE remove -> 200", async () => {
    const created = await api
      .post("/api/admin/vehicles")
      .set(authHeader(adminToken))
      .send({ name: "Vehicle 4", category: "SUV", isActive: true })

    const id = created.body.data._id

    const res = await api.delete(`/api/admin/vehicles/${id}`).set(authHeader(adminToken))

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})