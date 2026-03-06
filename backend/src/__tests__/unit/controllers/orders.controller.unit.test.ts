jest.mock("../../../services/order.service", () => {
  const mocks = {
    createPaidOrder: jest.fn(),
    listMyOrders: jest.fn(),
    listAdminOrders: jest.fn(),
    updateStatus: jest.fn(),
  }
  return { __esModule: true, __mocks: mocks, OrderService: jest.fn().mockImplementation(() => mocks) }
})

import { OrdersController } from "../../../controllers/order.controller"
import { mockReq, mockRes } from "../test-helpers"

const orderMocks = require("../../../services/order.service").__mocks as {
  createPaidOrder: jest.Mock
  listMyOrders: jest.Mock
}

describe("OrdersController (unit)", () => {
  const controller = new OrdersController()
  beforeEach(() => jest.clearAllMocks())

  it("createPaid returns 401 when no user", async () => {
    const req = mockReq({ user: undefined })
    const res = mockRes()

    await controller.createPaid(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(orderMocks.createPaidOrder).not.toHaveBeenCalled()
  })

  it("createPaid returns 400 when DTO invalid", async () => {
    const req = mockReq({ user: { userId: "u1" }, body: {} })
    const res = mockRes()

    await controller.createPaid(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("createPaid returns 201 on success", async () => {
    orderMocks.createPaidOrder.mockResolvedValue({ _id: "o1" })

    const req = mockReq({
      user: { userId: "u1" },
      body: {
        carId: "c1",
        packageId: "p1",
        packageTitle: "Basic",
        category: "SUV",
        basePrice: 0,
        providerId: "pr1",
        providerName: "Garage",
        totalPrice: 0,
      },
    })
    const res = mockRes()

    await controller.createPaid(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it("myOrders returns 401 when no user", async () => {
    const req = mockReq({ user: undefined })
    const res = mockRes()

    await controller.myOrders(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it("myOrders returns 200 with list", async () => {
    orderMocks.listMyOrders.mockResolvedValue([{ _id: "o1" }])

    const req = mockReq({ user: { userId: "u1" } })
    const res = mockRes()

    await controller.myOrders(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})