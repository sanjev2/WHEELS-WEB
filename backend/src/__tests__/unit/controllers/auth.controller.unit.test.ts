// src/__tests__/unit/controllers/auth.controller.unit.test.ts

// ✅ IMPORTANT: mock BEFORE importing controller (because userService is created at module scope)
jest.mock("zod", () => {
  const actual = jest.requireActual("zod")
  return {
    ...actual,
    // your code uses z.prettifyError(...) — provide it so tests don't crash
    prettifyError: (err: any) => {
      try {
        return err?.issues?.[0]?.message || "Validation error"
      } catch {
        return "Validation error"
      }
    },
  }
})

const createUserMock = jest.fn()
const loginUserMock = jest.fn()
const getMeMock = jest.fn()
const setProfilePictureMock = jest.fn()
const updateUserByIdMock = jest.fn()
const requestPasswordResetMock = jest.fn()
const verifyPasswordResetCodeMock = jest.fn()
const resetPasswordWithTokenMock = jest.fn()
const changePasswordMock = jest.fn()

jest.mock("../../../services/user.service", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      createUser: createUserMock,
      loginUser: loginUserMock,
      getMe: getMeMock,
      setProfilePicture: setProfilePictureMock,
      updateUserById: updateUserByIdMock,
      requestPasswordReset: requestPasswordResetMock,
      verifyPasswordResetCode: verifyPasswordResetCodeMock,
      resetPasswordWithToken: resetPasswordWithTokenMock,
      changePassword: changePasswordMock,
    })),
  }
})

const createSafeParseMock = jest.fn()
const loginSafeParseMock = jest.fn()

jest.mock("../../../dtos/user.dto", () => ({
  CreateUserDTO: { safeParse: createSafeParseMock },
  LoginUserDTO: { safeParse: loginSafeParseMock },
}))

import type { Request, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth.middleware"
import { AuthController } from "../../../controllers/auth.controller"

function makeRes() {
  const res: Partial<Response> = {}
  ;(res.status as any) = jest.fn().mockReturnValue(res)
  ;(res.json as any) = jest.fn().mockReturnValue(res)
  return res as Response & { status: jest.Mock; json: jest.Mock }
}

function makeReq(partial: Partial<Request> = {}) {
  return partial as Request
}

function makeAuthReq(partial: Partial<AuthRequest> = {}) {
  return partial as AuthRequest
}

describe("AuthController (unit)", () => {
  const controller = new AuthController()

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.ADMIN_PANEL_CODE
  })

  // -------------------------
  // register
  // -------------------------
  it("register -> 400 when DTO validation fails", async () => {
    const req = makeReq({ body: {} })
    const res = makeRes()

    createSafeParseMock.mockReturnValue({
      success: false,
      error: { issues: [{ message: "Invalid" }] },
    })

    await controller.register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
    expect(createUserMock).not.toHaveBeenCalled()
  })

  it("register -> 201 and strips password from returned user", async () => {
    const req = makeReq({ body: { name: "A" } })
    const res = makeRes()

    createSafeParseMock.mockReturnValue({ success: true, data: { name: "A" } })

    createUserMock.mockResolvedValue({
      _id: "u1",
      email: "a@test.com",
      password: "hashed",
    })

    await controller.register(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    const payload = res.json.mock.calls[0][0]
    expect(payload.success).toBe(true)
    expect(payload.data.password).toBeUndefined()
    expect(payload.data.email).toBe("a@test.com")
  })

  it("register -> uses error.statusCode if service throws", async () => {
    const req = makeReq({ body: { name: "A" } })
    const res = makeRes()

    createSafeParseMock.mockReturnValue({ success: true, data: { name: "A" } })

    const err: any = new Error("Boom")
    err.statusCode = 409
    createUserMock.mockRejectedValue(err)

    await controller.register(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Boom" }))
  })

  // -------------------------
  // login
  // -------------------------
  it("login -> 400 when DTO validation fails", async () => {
    const req = makeReq({ body: {} })
    const res = makeRes()

    loginSafeParseMock.mockReturnValue({
      success: false,
      error: { issues: [{ message: "Invalid" }] },
    })

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(loginUserMock).not.toHaveBeenCalled()
  })

  it("login -> 200 returns token and safe user", async () => {
    const req = makeReq({ body: { email: "a@test.com", password: "x" } })
    const res = makeRes()

    loginSafeParseMock.mockReturnValue({
      success: true,
      data: { email: "a@test.com", password: "x" },
    })

    loginUserMock.mockResolvedValue({
      token: "tok123",
      user: { _id: "u1", email: "a@test.com", password: "hashed" },
    })

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.json.mock.calls[0][0]
    expect(body.token).toBe("tok123")
    expect(body.data.password).toBeUndefined()
    expect(body.data.email).toBe("a@test.com")
  })

  it("login -> 500 if service throws without statusCode", async () => {
    const req = makeReq({ body: { email: "a@test.com", password: "x" } })
    const res = makeRes()

    loginSafeParseMock.mockReturnValue({ success: true, data: { email: "a@test.com", password: "x" } })
    loginUserMock.mockRejectedValue(new Error("Nope"))

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })

  // -------------------------
  // me
  // -------------------------
  it("me -> 401 when req.user missing", async () => {
    const req = makeAuthReq({ user: undefined })
    const res = makeRes()

    await controller.me(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(getMeMock).not.toHaveBeenCalled()
  })

  it("me -> 200 returns safe user", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "user" } })
    const res = makeRes()

    getMeMock.mockResolvedValue({ _id: "u1", email: "a@test.com", password: "hashed" })

    await controller.me(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.json.mock.calls[0][0]
    expect(body.data.password).toBeUndefined()
    expect(body.data.email).toBe("a@test.com")
  })

  it("me -> uses error.statusCode when service throws", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "user" } })
    const res = makeRes()

    const err: any = new Error("Not found")
    err.statusCode = 404
    getMeMock.mockRejectedValue(err)

    await controller.me(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Not found" }))
  })

  // -------------------------
  // uploadProfilePicture
  // -------------------------
  it("uploadProfilePicture -> 401 when user missing", async () => {
    const req = makeAuthReq({ user: undefined })
    const res = makeRes()

    await controller.uploadProfilePicture(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(setProfilePictureMock).not.toHaveBeenCalled()
  })

  it("uploadProfilePicture -> 400 when file missing", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "user" } })
    const res = makeRes()

    ;(req as any).file = undefined

    await controller.uploadProfilePicture(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(setProfilePictureMock).not.toHaveBeenCalled()
  })

  it("uploadProfilePicture -> 200 returns filename + url + safe user", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "user" } })
    const res = makeRes()

    ;(req as any).file = { filename: "pic.png" }

    setProfilePictureMock.mockResolvedValue({
      _id: "u1",
      email: "a@test.com",
      password: "hashed",
      profile_picture: "pic.png",
    })

    await controller.uploadProfilePicture(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.json.mock.calls[0][0]
    expect(body.data.filename).toBe("pic.png")
    expect(body.data.url).toBe("/public/profile_photo/pic.png")
    expect(body.data.user.password).toBeUndefined()
  })

  // -------------------------
  // verifyAdmin
  // -------------------------
  it("verifyAdmin -> 401 when user missing", async () => {
    const req = makeAuthReq({ user: undefined, body: {} })
    const res = makeRes()

    await controller.verifyAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("verifyAdmin -> 403 when role is not admin", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "user" }, body: {} })
    const res = makeRes()

    await controller.verifyAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it("verifyAdmin -> 500 when ADMIN_PANEL_CODE not configured", async () => {
    const req = makeAuthReq({ user: { userId: "u1", email: "a@test.com", role: "admin" }, body: {} })
    const res = makeRes()

    await controller.verifyAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it("verifyAdmin -> 200 when code matches", async () => {
    process.env.ADMIN_PANEL_CODE = "1234"
    const req = makeAuthReq({
      user: { userId: "u1", email: "a@test.com", role: "admin" },
      body: { code: "1234" },
    })
    const res = makeRes()

    await controller.verifyAdmin(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Admin verified" })
  })

  // -------------------------
  // updateUser
  // -------------------------
  it("updateUser -> 401 when user missing", async () => {
    const req = makeAuthReq({ user: undefined, params: { id: "u1" } as any, body: {} })
    const res = makeRes()

    await controller.updateUser(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it("updateUser -> 403 when not self and not admin", async () => {
    const req = makeAuthReq({
      user: { userId: "u1", email: "a@test.com", role: "user" },
      params: { id: "u2" } as any,
      body: { name: "X" },
    })
    const res = makeRes()

    await controller.updateUser(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it("updateUser -> 400 when body empty and no file", async () => {
    const req = makeAuthReq({
      user: { userId: "u1", email: "a@test.com", role: "user" },
      params: { id: "u1" } as any,
      body: {},
    })
    const res = makeRes()

    await controller.updateUser(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it("updateUser -> 200 updates self, removes empty-string fields", async () => {
    const req = makeAuthReq({
      user: { userId: "u1", email: "a@test.com", role: "user" },
      params: { id: "u1" } as any,
      body: { name: "New", address: "" },
    })
    const res = makeRes()

    updateUserByIdMock.mockResolvedValue({ _id: "u1", email: "a@test.com", password: "hashed", name: "New" })

    await controller.updateUser(req, res)

    expect(updateUserByIdMock).toHaveBeenCalledWith("u1", { name: "New" })
    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.json.mock.calls[0][0]
    expect(body.data.password).toBeUndefined()
    expect(body.data.name).toBe("New")
  })

  // -------------------------
  // forgot / verify-reset / reset / change-password
  // -------------------------
  it("forgotPassword -> 200 returns success", async () => {
    const req = makeReq({ body: { email: "a@test.com" } })
    const res = makeRes()

    requestPasswordResetMock.mockResolvedValue({ sent: true })

    await controller.forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(requestPasswordResetMock).toHaveBeenCalledWith("a@test.com")
  })

  it("verifyResetCode -> 200 returns success", async () => {
    const req = makeReq({ body: { email: "a@test.com", code: "999" } })
    const res = makeRes()

    verifyPasswordResetCodeMock.mockResolvedValue({ ok: true })

    await controller.verifyResetCode(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(verifyPasswordResetCodeMock).toHaveBeenCalledWith("a@test.com", "999")
  })

  it("resetPassword -> 200 calls service with token + new password", async () => {
    const req = makeReq({ body: { resetToken: "rtok", newPassword: "New@123" } })
    const res = makeRes()

    resetPasswordWithTokenMock.mockResolvedValue(undefined)

    await controller.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(resetPasswordWithTokenMock).toHaveBeenCalledWith("rtok", "New@123")
  })

  it("changePassword -> 401 when user missing", async () => {
    const req = makeAuthReq({ user: undefined, body: { currentPassword: "a", newPassword: "b" } })
    const res = makeRes()

    await controller.changePassword(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it("changePassword -> 200 calls service", async () => {
    const req = makeAuthReq({
      user: { userId: "u1", email: "a@test.com", role: "user" },
      body: { currentPassword: "Old@123", newPassword: "New@123" },
    })
    const res = makeRes()

    changePasswordMock.mockResolvedValue(undefined)

    await controller.changePassword(req, res)

    expect(changePasswordMock).toHaveBeenCalledWith("u1", "Old@123", "New@123")
    expect(res.status).toHaveBeenCalledWith(200)
  })
})