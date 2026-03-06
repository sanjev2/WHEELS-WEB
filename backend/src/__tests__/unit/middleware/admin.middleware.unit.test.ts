import { adminMiddleware } from "../../../middleware/admin.middleware"
import { mockNext, mockReq, mockRes } from "../test-helpers"

describe("adminMiddleware (unit)", () => {
  it("401 when req.user missing", () => {
    const req = mockReq({ user: undefined })
    const res = mockRes()
    const next = mockNext()

    adminMiddleware(req as any, res as any, next as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("403 when role is not admin", () => {
    const req = mockReq({ user: { role: "user" } })
    const res = mockRes()
    const next = mockNext()

    adminMiddleware(req as any, res as any, next as any)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("calls next when admin", () => {
    const req = mockReq({ user: { role: "admin" } })
    const res = mockRes()
    const next = mockNext()

    adminMiddleware(req as any, res as any, next as any)

    expect(next).toHaveBeenCalled()
  })
})