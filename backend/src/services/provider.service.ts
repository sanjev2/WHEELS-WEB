import { ProviderModel } from "../models/provider.model"

export class ProviderService {
  create(payload: any) {
    return ProviderModel.create({
      name: payload.name,
      locationText: payload.locationText ?? null,
      openFrom: payload.openFrom,
      openTo: payload.openTo,
      lat: payload.lat,
      lng: payload.lng,
      placeId: payload.placeId ?? null,
      categories: payload.categories ?? [],
      isActive: payload.isActive ?? true,
    })
  }

  listAdmin() {
    return ProviderModel.find().sort({ createdAt: -1 })
  }

  listPublic(category?: string) {
    const filter: any = { isActive: true }
    if (category) filter.categories = category
    return ProviderModel.find(filter).sort({ createdAt: -1 })
  }

  async update(id: string, payload: any) {
    const updated = await ProviderModel.findByIdAndUpdate(
      id,
      {
        name: payload.name,
        locationText: payload.locationText ?? null,
        openFrom: payload.openFrom,
        openTo: payload.openTo,
        lat: payload.lat,
        lng: payload.lng,
        placeId: payload.placeId ?? null,
        categories: payload.categories ?? [],
        isActive: payload.isActive ?? true,
      },
      { new: true }
    )
    if (!updated) throw new Error("Provider not found")
    return updated
  }

  remove(id: string) {
    return ProviderModel.findByIdAndDelete(id)
  }
}