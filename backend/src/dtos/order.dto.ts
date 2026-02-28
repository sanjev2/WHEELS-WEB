import z from "zod"

export const CreateOrderDTO = z.object({
  carId: z.string().min(1),
  packageId: z.string().min(1),
  packageTitle: z.string().min(1),
  category: z.string().min(1),
  basePrice: z.number().min(0),
  durationMins: z.number().min(0).nullable().optional(),

  selectedOilType: z.string().trim().nullable().optional(),
  selectedAddons: z.array(z.string().trim()).optional(),

  providerId: z.string().min(1),
  providerName: z.string().min(1),

  totalPrice: z.number().min(0),
})