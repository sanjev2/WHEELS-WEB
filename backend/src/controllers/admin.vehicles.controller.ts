import type { Request, Response } from "express"
import z from "zod"
import { VehicleService } from "../services/vehicle.service"
import { AdminCreateVehicleDTO, AdminUpdateVehicleDTO } from "../dtos/vehicle.dto"

const service = new VehicleService()

export class AdminVehiclesController {
  async create(req: Request, res: Response) {
    const parsed = AdminCreateVehicleDTO.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    }

    const created = await service.createVehicle(parsed.data)
    return res.status(201).json({ success: true, message: "Vehicle created", data: created })
  }

  async list(req: Request, res: Response) {
    const data = await service.getAdminVehicles()
    return res.status(200).json({ success: true, data })
  }

  async update(req: Request, res: Response) {
    const parsed = AdminUpdateVehicleDTO.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    }

    const updated = await service.updateVehicle(req.params.id, parsed.data)
    return res.status(200).json({ success: true, message: "Vehicle updated", data: updated })
  }

  async remove(req: Request, res: Response) {
    await service.deleteVehicle(req.params.id)
    return res.status(200).json({ success: true, message: "Vehicle deleted" })
  }
}
