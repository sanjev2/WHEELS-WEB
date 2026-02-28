import type { Response } from "express"
import z from "zod"
import { OrderService } from "../services/order.service"
import { CreateOrderDTO } from "../dtos/order.dto"
import type { AuthRequest } from "../middleware/auth.middleware"

const service = new OrderService()

export class OrdersController {
  async createPaid(req: AuthRequest, res: Response) {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" })

    const parsed = CreateOrderDTO.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    }

    const created = await service.createPaidOrder(userId, parsed.data)
    return res.status(201).json({ success: true, message: "Order created", data: created })
  }

  async myOrders(req: AuthRequest, res: Response) {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" })

    const data = await service.listMyOrders(userId)
    return res.status(200).json({ success: true, data })
  }
}