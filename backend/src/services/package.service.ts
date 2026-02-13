import { HttpError } from "../errors/http-error"
import { PackageRepository } from "../repositories/package.repository"

const repo = new PackageRepository()

export class PackageService {
  createPackage(data: any) {
    return repo.create({
      ...data,
      isActive: data.isActive ?? true,
    })
  }

  getAdminPackages() {
    return repo.findAll({})
  }

  getPublicPackages(category?: string) {
    const filter: any = { isActive: true }
    if (category) filter.category = category
    return repo.findAll(filter)
  }

  async updatePackage(id: string, updates: any) {
    const updated = await repo.updateById(id, updates)
    if (!updated) throw new HttpError(404, "Package not found")
    return updated
  }

  async deletePackage(id: string) {
    const deleted = await repo.deleteById(id)
    if (!deleted) throw new HttpError(404, "Package not found")
    return true
  }
}
