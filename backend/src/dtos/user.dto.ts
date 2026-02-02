import z from "zod"
import { UserSchema } from "../types/user.type"

// ✅ Public Signup DTO (role NOT allowed)
export const CreateUserDTO = UserSchema.pick({
  name: true,
  email: true,
  contact: true,
  address: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type CreateUserDTO = z.infer<typeof CreateUserDTO>

// ✅ Admin Create DTO (role allowed)
export const AdminCreateUserDTO = UserSchema.pick({
  name: true,
  email: true,
  contact: true,
  address: true,
  password: true,
})
  .extend({
    role: z.enum(["user", "admin"]).default("user"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>

export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export type LoginUserDTO = z.infer<typeof LoginUserDTO>
