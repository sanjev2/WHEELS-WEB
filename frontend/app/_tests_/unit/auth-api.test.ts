describe("authApi", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: "http://localhost:5000/api" }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  function load() {
    // mock ./http *before* importing authApi
    jest.doMock("@/app/lib/api/http", () => ({
      httpJson: jest.fn(),
      httpAuthJson: jest.fn(),
      httpAuthForm: jest.fn(),
    }))

    // now import modules
    const { authApi } = require("@/app/lib/api/auth")
    const { endpoints } = require("@/app/lib/api/endpoints")
    const http = require("@/app/lib/api/http")
    return { authApi, endpoints, http }
  }

  it("signup calls httpJson with role=user merged", async () => {
    const { authApi, endpoints, http } = load()

    http.httpJson.mockResolvedValue({ success: true })

    await authApi.signup({ name: "A", email: "a@a.com", password: "123456" })

    expect(http.httpJson).toHaveBeenCalledWith(
      endpoints.signup,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "A",
          email: "a@a.com",
          password: "123456",
          role: "user",
        }),
      })
    )
  })

  it("login maps response into { user, token }", async () => {
    const { authApi, endpoints, http } = load()

    http.httpJson.mockResolvedValue({
      success: true,
      message: "ok",
      data: { _id: "u1", role: "user", email: "a@a.com", name: "A" },
      token: "token-xyz",
    })

    const res = await authApi.login({ email: "a@a.com", password: "123456" })

    expect(http.httpJson).toHaveBeenCalledWith(
      endpoints.login,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@a.com", password: "123456" }),
      })
    )
    expect(res).toEqual({
      user: { _id: "u1", role: "user", email: "a@a.com", name: "A" },
      token: "token-xyz",
    })
  })

  it("me calls httpAuthJson and returns data only", async () => {
    const { authApi, endpoints, http } = load()

    http.httpAuthJson.mockResolvedValue({
      success: true,
      message: "ok",
      data: { _id: "u1", role: "user" },
    })

    const res = await authApi.me("token-123")

    expect(http.httpAuthJson).toHaveBeenCalledWith(endpoints.me, "token-123", { method: "GET" })
    expect(res).toEqual({ _id: "u1", role: "user" })
  })

  it("updateUserForm calls httpAuthForm with updateUser endpoint", async () => {
    const { authApi, endpoints, http } = load()

    http.httpAuthForm.mockResolvedValue({ ok: true })

    const fd = new FormData()
    await authApi.updateUserForm("token-123", "u1", fd)

    expect(http.httpAuthForm).toHaveBeenCalledWith(
      endpoints.updateUser("u1"),
      "token-123",
      fd,
      { method: "PUT" }
    )
  })

  it("uploadProfilePicture calls httpAuthForm with uploadProfile endpoint", async () => {
    const { authApi, endpoints, http } = load()

    http.httpAuthForm.mockResolvedValue({ ok: true })

    const fd = new FormData()
    await authApi.uploadProfilePicture("token-123", fd)

    expect(http.httpAuthForm).toHaveBeenCalledWith(
      endpoints.uploadProfile,
      "token-123",
      fd,
      { method: "POST" }
    )
  })

  it("forgotPassword calls httpJson with email", async () => {
    const { authApi, endpoints, http } = load()

    http.httpJson.mockResolvedValue({ ok: true })

    await authApi.forgotPassword("a@a.com")

    expect(http.httpJson).toHaveBeenCalledWith(
      endpoints.forgotPassword,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@a.com" }),
      })
    )
  })

  it("verifyResetCode calls httpJson with email+code", async () => {
    const { authApi, endpoints, http } = load()

    http.httpJson.mockResolvedValue({ ok: true })

    await authApi.verifyResetCode("a@a.com", "9999")

    expect(http.httpJson).toHaveBeenCalledWith(
      endpoints.verifyResetCode,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@a.com", code: "9999" }),
      })
    )
  })

  it("resetPassword calls httpJson with resetToken+newPassword", async () => {
    const { authApi, endpoints, http } = load()

    http.httpJson.mockResolvedValue({ ok: true })

    await authApi.resetPassword("reset-token", "newpass")

    expect(http.httpJson).toHaveBeenCalledWith(
      endpoints.resetPassword,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ resetToken: "reset-token", newPassword: "newpass" }),
      })
    )
  })

  it("changePassword calls httpAuthJson with currentPassword+newPassword", async () => {
    const { authApi, endpoints, http } = load()

    http.httpAuthJson.mockResolvedValue({ ok: true })

    await authApi.changePassword("token-123", "old", "new")

    expect(http.httpAuthJson).toHaveBeenCalledWith(
      endpoints.changePassword,
      "token-123",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ currentPassword: "old", newPassword: "new" }),
      })
    )
  })
})