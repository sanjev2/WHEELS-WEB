import type { Request, Response } from "express"
import z from "zod"
import { PackageService } from "../services/package.service"
import { AdminCreatePackageDTO, AdminUpdatePackageDTO } from "../dtos/package.dto"

const service = new PackageService()

export class AdminPackagesController {
  async create(req: Request, res: Response) {
    const parsed = AdminCreatePackageDTO.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    }

    const created = await service.createPackage(parsed.data)
    return res.status(201).json({ success: true, message: "Package created", data: created })
  }

  async list(req: Request, res: Response) {
    const data = await service.getAdminPackages()
    return res.status(200).json({ success: true, data })
  }

  async update(req: Request, res: Response) {
    const parsed = AdminUpdatePackageDTO.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) })
    }

    const updated = await service.updatePackage(req.params.id, parsed.data)
    return res.status(200).json({ success: true, message: "Package updated", data: updated })
  }

  async remove(req: Request, res: Response) {
    await service.deletePackage(req.params.id)
    return res.status(200).json({ success: true, message: "Package deleted" })
  }
}