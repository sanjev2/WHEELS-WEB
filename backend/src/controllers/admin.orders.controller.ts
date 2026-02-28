import type { Request, Response } from "express"
import { OrderService } from "../services/order.service"

const service = new OrderService()

export class AdminOrdersController {
  async list(_req: Request, res: Response) {
    const data = await service.listAdminOrders()
    return res.status(200).json({ success: true, data })
  }

  async updateStatus(req: Request, res: Response) {
    const { status } = req.body as { status?: string }
    if (!status) return res.status(400).json({ success: false, message: "status is required" })
    const updated = await service.updateStatus(req.params.id, status)
    return res.status(200).json({ success: true, message: "Status updated", data: updated })
  }
}