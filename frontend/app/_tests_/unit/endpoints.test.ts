describe("endpoints", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: "http://localhost:5000/api" }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it("builds static endpoints from NEXT_PUBLIC_API_URL", () => {
    const { endpoints } = require("@/app/lib/api/endpoints")

    expect(endpoints.signup).toBe("http://localhost:5000/api/auth/signup")
    expect(endpoints.login).toBe("http://localhost:5000/api/auth/login")
    expect(endpoints.me).toBe("http://localhost:5000/api/auth/me")
    expect(endpoints.uploadProfile).toBe("http://localhost:5000/api/auth/upload-profile-picture")
    expect(endpoints.adminUsers).toBe("http://localhost:5000/api/admin/users")
    expect(endpoints.adminOrders).toBe("http://localhost:5000/api/admin/orders")
  })

  it("builds dynamic endpoints using id", () => {
    const { endpoints } = require("@/app/lib/api/endpoints")

    expect(endpoints.updateUser("u1")).toBe("http://localhost:5000/api/auth/u1")
    expect(endpoints.adminUserById("u1")).toBe("http://localhost:5000/api/admin/users/u1")
    expect(endpoints.adminProviderById("p1")).toBe("http://localhost:5000/api/admin/providers/p1")
    expect(endpoints.adminOrderStatus("o1")).toBe("http://localhost:5000/api/admin/orders/o1/status")
  })

  it("falls back to default base URL when env missing", () => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.NEXT_PUBLIC_API_URL

    const { endpoints } = require("@/app/lib/api/endpoints")

    expect(endpoints.login).toBe("http://localhost:5000/api/auth/login")
  })
})