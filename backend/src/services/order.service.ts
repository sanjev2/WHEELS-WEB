import { OrderModel, ORDER_STATUSES } from "../models/order.model"

export class OrderService {
  createPaidOrder(userId: string, payload: any) {
    // In real payment: create pending order first, then mark paid via webhook/callback
    return OrderModel.create({
      user: userId,
      car: payload.carId,

      packageId: payload.packageId,
      packageTitle: payload.packageTitle,
      category: payload.category,
      basePrice: payload.basePrice,
      durationMins: payload.durationMins ?? null,

      selectedOilType: payload.selectedOilType ?? null,
      selectedAddons: payload.selectedAddons ?? [],

      providerId: payload.providerId,
      providerName: payload.providerName,

      totalPrice: payload.totalPrice,

      status: "PAID",
      paidAt: new Date(),
    })
  }

  listMyOrders(userId: string) {
    return OrderModel.find({ user: userId }).sort({ createdAt: -1 })
  }

  listAdminOrders() {
    return OrderModel.find().sort({ createdAt: -1 })
  }

  async updateStatus(id: string, status: string) {
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
      throw new Error("Invalid status")
    }
    const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated) throw new Error("Order not found")
    return updated
  }
}