import type { Request, Response } from "express"
import z from "zod"
import { VehicleService } from "../services/vehicle.service"
import { AdminCreateVehicleDTO, AdminUpdateVehicleDTO } from "../dtos/vehicle.dto"

const service = new VehicleService()

export class AdminVehiclesController {
  async create(req: Request, res: Response) {
    try {
      const parsed = AdminCreateVehicleDTO.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
      }

      const created = await service.createVehicle(parsed.data)
      return res.status(201).json({ success: true, message: "Vehicle created", data: created })
    } catch (error: any) {
      const status = error?.statusCode || 500
      return res.status(status).json({ success: false, message: error?.message || "Server error" })
    }
  }

  async list(_req: Request, res: Response) {
    try {
      const data = await service.getAdminVehicles()
      return res.status(200).json({ success: true, data })
    } catch (error: any) {
      const status = error?.statusCode || 500
      return res.status(status).json({ success: false, message: error?.message || "Server error" })
    }
  }

  async update(req: Request, res: Response) {
    try {
      // ✅ 1) validate DTO format first
      const parsed = AdminUpdateVehicleDTO.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
      }

      // ✅ 2) IMPORTANT: if DTO allows optional fields, {} becomes valid.
      // So enforce "at least one field must be provided".
      const updates = parsed.data as Record<string, unknown>
      const hasAnyField = Object.keys(updates).some((k) => updates[k] !== undefined)

      if (!hasAnyField) {
        return res.status(400).json({ success: false, message: "No fields to update" })
      }

      const updated = await service.updateVehicle(req.params.id, updates)
      return res.status(200).json({ success: true, message: "Vehicle updated", data: updated })
    } catch (error: any) {
      // ✅ allow tests expecting error.statusCode (HttpError-like)
      const status = error?.statusCode || 500
      return res.status(status).json({ success: false, message: error?.message || "Server error" })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      await service.deleteVehicle(req.params.id)
      return res.status(200).json({ success: true, message: "Vehicle deleted" })
    } catch (error: any) {
      const status = error?.statusCode || 500
      return res.status(status).json({ success: false, message: error?.message || "Server error" })
    }
  }
}