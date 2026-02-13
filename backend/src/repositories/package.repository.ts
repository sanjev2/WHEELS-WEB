import { PackageModel } from "../models/package.model"

export class PackageRepository {
  create(data: any) {
    return PackageModel.create(data)
  }

  findAll(filter: any = {}) {
    return PackageModel.find(filter).sort({ createdAt: -1 })
  }

  findById(id: string) {
    return PackageModel.findById(id)
  }

  updateById(id: string, updates: any) {
    return PackageModel.findByIdAndUpdate(id, updates, { new: true })
  }

  deleteById(id: string) {
    return PackageModel.findByIdAndDelete(id)
  }
}
