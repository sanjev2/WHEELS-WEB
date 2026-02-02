import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contact: z.string().min(7, "Contact number is required"),
  address: z.string().min(5, "Address is required"),
})

export type UpdateProfileData = z.infer<typeof updateProfileSchema>
