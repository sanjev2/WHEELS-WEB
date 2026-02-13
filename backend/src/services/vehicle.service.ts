import { HttpError } from "../errors/http-error"
import { VehicleRepository } from "../repositories/vehicle.repository"

const repo = new VehicleRepository()

export class VehicleService {
  createVehicle(data: any) {
    return repo.create({
      ...data,
      isActive: data.isActive ?? true,
    })
  }

  getAdminVehicles() {
    return repo.findAll({})
  }

  getPublicVehicles(category?: string) {
    const filter: any = { isActive: true }
    if (category) filter.category = category
    return repo.findAll(filter)
  }

  async updateVehicle(id: string, updates: any) {
    const updated = await repo.updateById(id, updates)
    if (!updated) throw new HttpError(404, "Vehicle not found")
    return updated
  }

  async deleteVehicle(id: string) {
    const deleted = await repo.deleteById(id)
    if (!deleted) throw new HttpError(404, "Vehicle not found")
    return true
  }
}
