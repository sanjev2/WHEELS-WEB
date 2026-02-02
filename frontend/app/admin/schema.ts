import { z } from "zod"

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contact: z.string().min(7, "Contact is required"),
  address: z.string().min(2, "Address is required"),
  role: z.enum(["user", "admin"]).default("user"),
})

// ✅ IMPORTANT: confirmPassword is NOT included here.
export type AdminCreateUserData = z.infer<typeof adminCreateUserSchema>
