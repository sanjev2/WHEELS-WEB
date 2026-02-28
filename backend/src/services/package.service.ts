import { PackageModel } from "../models/package.model"
import type { AdminCreatePackageInput, AdminUpdatePackageInput } from "../dtos/package.dto"

export class PackageService {
  async createPackage(payload: AdminCreatePackageInput) {
    const created = await PackageModel.create({
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category,
      price: payload.price,

      durationMins: payload.durationMins ?? null,

      // ✅ array
      engineOilTypes: payload.engineOilTypes ?? [],

      services: payload.services ?? [],
      addons: payload.addons ?? [],

      isActive: payload.isActive ?? true,
    })

    return created
  }

  async getAdminPackages() {
    return PackageModel.find().sort({ createdAt: -1 })
  }

  async getPublicPackages(category?: string) {
    const filter: any = { isActive: true }
    if (category) filter.category = category
    return PackageModel.find(filter).sort({ createdAt: -1 })
  }

  async updatePackage(id: string, payload: AdminUpdatePackageInput) {
    const updated = await PackageModel.findByIdAndUpdate(
      id,
      {
        title: payload.title,
        description: payload.description ?? null,
        category: payload.category,
        price: payload.price,

        durationMins: payload.durationMins ?? null,

        // ✅ array
        engineOilTypes: payload.engineOilTypes ?? [],

        services: payload.services ?? [],
        addons: payload.addons ?? [],

        isActive: payload.isActive ?? true,
      },
      { new: true }
    )

    if (!updated) throw new Error("Package not found")
    return updated
  }

  async deletePackage(id: string) {
    await PackageModel.findByIdAndDelete(id)
  }
}