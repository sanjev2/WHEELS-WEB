import type { Request, Response } from "express"
import z from "zod"
import { ProviderService } from "../services/provider.service"
import { AdminCreateProviderDTO, AdminUpdateProviderDTO } from "../dtos/provider.dto"

const service = new ProviderService()

export class AdminProvidersController {
  async list(_req: Request, res: Response) {
    const data = await service.listAdmin()
    return res.status(200).json({ success: true, data })
  }

  async create(req: Request, res: Response) {
    const parsed = AdminCreateProviderDTO.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    const created = await service.create(parsed.data)
    return res.status(201).json({ success: true, message: "Provider created", data: created })
  }

  async update(req: Request, res: Response) {
    const parsed = AdminUpdateProviderDTO.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    const updated = await service.update(req.params.id, parsed.data)
    return res.status(200).json({ success: true, message: "Provider updated", data: updated })
  }

  async remove(req: Request, res: Response) {
    await service.remove(req.params.id)
    return res.status(200).json({ success: true, message: "Provider deleted" })
  }
}