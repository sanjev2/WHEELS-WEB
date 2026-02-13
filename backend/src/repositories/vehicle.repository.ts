import { VehicleModel } from "../models/vehicle.model"

export class VehicleRepository {
  create(data: any) {
    return VehicleModel.create(data)
  }

  findAll(filter: any = {}) {
    return VehicleModel.find(filter).sort({ createdAt: -1 })
  }

  findById(id: string) {
    return VehicleModel.findById(id)
  }

  updateById(id: string, updates: any) {
    return VehicleModel.findByIdAndUpdate(id, updates, { new: true })
  }

  deleteById(id: string) {
    return VehicleModel.findByIdAndDelete(id)
  }
}
