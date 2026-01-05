    import { z } from "zod"

    export const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        contact: z.string().min(10, "Contact number must be at least 10 digits"),
        address: z.string().min(5, "Address must be at least 5 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        role: z.enum(['user', 'admin']).optional().default('user'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

    export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    })

    export type RegisterData = z.infer<typeof registerSchema>
    export type LoginData = z.infer<typeof loginSchema>

    export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(10, "Contact number must be at least 10 digits"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['user', 'admin']).optional().default('user'),
    })

    export type UserType = z.infer<typeof UserSchema>

    export interface User {
    _id: string
    name: string
    email: string
    contact: string
    address: string
    password: string
    role: 'user' | 'admin'
    createdAt: Date
    updatedAt: Date
    }
