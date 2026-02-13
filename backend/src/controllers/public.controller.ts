import type { Request, Response } from "express"
import { VEHICLE_CATEGORIES } from "../types/vehicle-category.type"
import { VehicleService } from "../services/vehicle.service"
import { PackageService } from "../services/package.service"

const vehicleService = new VehicleService()
const packageService = new PackageService()

export class PublicController {
  categories(_req: Request, res: Response) {
    return res.status(200).json({ success: true, data: VEHICLE_CATEGORIES })
  }

  async listVehicles(req: Request, res: Response) {
    const category = req.query.category as string | undefined
    const data = await vehicleService.getPublicVehicles(category)
    return res.status(200).json({ success: true, data })
  }

  async listPackages(req: Request, res: Response) {
    const category = req.query.category as string | undefined
    const data = await packageService.getPublicPackages(category)
    return res.status(200).json({ success: true, data })
  }
}
