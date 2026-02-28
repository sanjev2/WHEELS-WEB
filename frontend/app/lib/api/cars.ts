import { endpoints } from "./endpoints"
import { httpAuthJson } from "./http"

export type CarCategory = "SUV" | "SEDAN" | "HATCHBACK"
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG"

export type Car = {
  _id: string
  make: string
  model: string
  year: number
  licensePlate: string
  fuelType: FuelType
  boughtDate: string
  category: CarCategory
}

export const carsApi = {
  listMine: (token: string) =>
    httpAuthJson<{ success: boolean; count: number; data: Car[] }>(endpoints.cars, token, {
      method: "GET",
    }),

  create: (
    token: string,
    payload: {
      make: string
      model: string
      year: number
      licensePlate: string
      fuelType?: FuelType
      boughtDate?: string
      category: CarCategory
    }
  ) =>
    httpAuthJson<{ success: boolean; message: string; data: Car }>(endpoints.cars, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  remove: (token: string, id: string) =>
    httpAuthJson<{ success: boolean; message: string }>(endpoints.carById(id), token, {
      method: "DELETE",
    }),
}