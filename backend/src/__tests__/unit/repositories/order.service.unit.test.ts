import { OrderService } from "../../../services/order.service"
import { OrderModel } from "../../../models/order.model"

jest.mock("../../../models/order.model", () => ({
  ORDER_STATUSES: ["PAID", "CANCELLED", "PENDING_PAYMENT"],
  OrderModel: {
    create: jest.fn(),
    find: jest.fn(() => ({ sort: jest.fn() })),
    findByIdAndUpdate: jest.fn(),
  },
}))

describe("OrderService (unit)", () => {
  const service = new OrderService()

  it("createPaidOrder creates PAID order with paidAt", async () => {
    ;(OrderModel.create as any).mockResolvedValue({ _id: "1" })
    const r = await service.createPaidOrder("u1", {
      carId: "c1",
      packageId: "p1",
      packageTitle: "Basic",
      category: "SUV",
      basePrice: 10,
      providerId: "prov1",
      providerName: "Prov",
      totalPrice: 10,
    })

    expect(OrderModel.create).toHaveBeenCalled()
    expect(r._id).toBe("1")
    const args = (OrderModel.create as any).mock.calls[0][0]
    expect(args.status).toBe("PAID")
    expect(args.paidAt).toBeInstanceOf(Date)
  })

  it("listMyOrders sorts by createdAt desc", async () => {
    const sortMock = jest.fn().mockResolvedValue([])
    ;(OrderModel.find as any).mockReturnValue({ sort: sortMock })
    await service.listMyOrders("u1")
    expect(OrderModel.find).toHaveBeenCalledWith({ user: "u1" })
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
  })

  it("updateStatus throws on invalid status", async () => {
    await expect(service.updateStatus("1", "NOPE")).rejects.toThrow("Invalid status")
  })

  it("updateStatus throws when not found", async () => {
    ;(OrderModel.findByIdAndUpdate as any).mockResolvedValue(null)
    await expect(service.updateStatus("1", "PAID")).rejects.toThrow("Order not found")
  })

  it("updateStatus returns updated", async () => {
    ;(OrderModel.findByIdAndUpdate as any).mockResolvedValue({ _id: "1", status: "PAID" })
    const r = await service.updateStatus("1", "PAID")
    expect(r.status).toBe("PAID")
  })
})