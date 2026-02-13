import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    contact: z.string().min(10),
    address: z.string().min(5),
    password: z.string().min(6),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin"]).optional().default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>

export const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  contact: z.string().min(10),
  address: z.string().min(5),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional().default("user"),
  profile_picture: z.string().nullable().optional(),

  // ✅ RESET PASSWORD FIELDS (must exist here)
  reset_code_hash: z.string().nullable().optional(),
  reset_code_expires_at: z.date().nullable().optional(),
  reset_code_attempts: z.number().optional(),
  reset_token_hash: z.string().nullable().optional(),
  reset_token_expires_at: z.date().nullable().optional(),
  reset_last_sent_at: z.date().nullable().optional(),
})

export type UserType = z.infer<typeof UserSchema>
