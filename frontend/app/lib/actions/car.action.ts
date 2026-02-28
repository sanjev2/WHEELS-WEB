import { carsApi } from "@/app/lib/api/cars";

export const carsActions = {
  listMine: (token: string) => carsApi.listMine(token),
  create: (token: string, payload: Parameters<typeof carsApi.create>[1]) => carsApi.create(token, payload),
  remove: (token: string, id: string) => carsApi.remove(token, id),
};