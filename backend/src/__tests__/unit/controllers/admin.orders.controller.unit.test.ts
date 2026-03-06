jest.mock("../../../services/order.service", () => {
  const mocks = {
    createPaidOrder: jest.fn(),
    listMyOrders: jest.fn(),
    listAdminOrders: jest.fn(),
    updateStatus: jest.fn(),
  }
  return { __esModule: true, __mocks: mocks, OrderService: jest.fn().mockImplementation(() => mocks) }
})

import { AdminOrdersController } from "../../../controllers/admin.orders.controller"
import { mockReq, mockRes } from "../test-helpers"

const orderMocks = require("../../../services/order.service").__mocks as {
  listAdminOrders: jest.Mock
  updateStatus: jest.Mock
}

describe("AdminOrdersController (unit)", () => {
  const controller = new AdminOrdersController()

  beforeEach(() => jest.clearAllMocks())

  it("list returns 200 with data", async () => {
    orderMocks.listAdminOrders.mockResolvedValue([{ _id: "1" }])
    const req = mockReq()
    const res = mockRes()

    await controller.list(req as any, res as any)

    expect(orderMocks.listAdminOrders).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("updateStatus returns 400 when status missing", async () => {
    const req = mockReq({ params: { id: "1" }, body: {} })
    const res = mockRes()

    await controller.updateStatus(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(orderMocks.updateStatus).not.toHaveBeenCalled()
  })

  it("updateStatus returns 200 on success", async () => {
    orderMocks.updateStatus.mockResolvedValue({ _id: "1", status: "done" })
    const req = mockReq({ params: { id: "1" }, body: { status: "done" } })
    const res = mockRes()

    await controller.updateStatus(req as any, res as any)

    expect(orderMocks.updateStatus).toHaveBeenCalledWith("1", "done")
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("updateStatus accepts many statuses", async () => {
    const statuses = ["pending", "paid", "confirmed", "completed", "cancelled"]
    orderMocks.updateStatus.mockResolvedValue({})

    for (const s of statuses) {
      const req = mockReq({ params: { id: "1" }, body: { status: s } })
      const res = mockRes()
      await controller.updateStatus(req as any, res as any)
      expect(orderMocks.updateStatus).toHaveBeenCalledWith("1", s)
    }
  })
})