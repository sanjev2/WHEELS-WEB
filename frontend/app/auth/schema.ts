// schema.ts
import { z } from "zod"

// Login form schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Type for login form data
export type LoginData = z.infer<typeof loginSchema>

// Register / Signup form schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    address: z.string().min(5, "Address is required"),
    contact: z.string().min(7, "Contact number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
// Type for register form data
export type RegisterData = z.infer<typeof registerSchema>

  export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
})
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export const verifyResetCodeSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits"),
})
export type VerifyResetCodeData = z.infer<typeof verifyResetCodeSchema>

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(10, "Invalid reset token"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
