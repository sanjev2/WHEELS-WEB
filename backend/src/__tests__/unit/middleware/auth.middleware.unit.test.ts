import { authMiddleware } from "../../../middleware/auth.middleware"
import { mockNext, mockReq, mockRes } from "../test-helpers"

const verify = jest.fn()

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: (...args: any[]) => verify(...args) },
}))

describe("authMiddleware (unit)", () => {
  beforeEach(() => jest.clearAllMocks())

  it("401 when no Authorization header", () => {
    const req = mockReq({ headers: {} })
    const res = mockRes()
    const next = mockNext()

    authMiddleware(req as any, res as any, next as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("401 when token missing after Bearer", () => {
    const req = mockReq({ headers: { authorization: "Bearer" } })
    const res = mockRes()
    const next = mockNext()

    authMiddleware(req as any, res as any, next as any)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("401 when jwt.verify throws", () => {
    verify.mockImplementation(() => { throw new Error("bad") })
    const req = mockReq({ headers: { authorization: "Bearer badtoken" } })
    const res = mockRes()
    const next = mockNext()

    authMiddleware(req as any, res as any, next as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("sets req.user and calls next when valid", () => {
    verify.mockReturnValue({ userId: "u1", email: "a@test.com", role: "admin" })
    const req: any = mockReq({ headers: { authorization: "Bearer goodtoken" } })
    const res = mockRes()
    const next = mockNext()

    authMiddleware(req, res as any, next as any)

    expect(req.user).toEqual({ userId: "u1", email: "a@test.com", role: "admin" })
    expect(next).toHaveBeenCalled()
  })
})