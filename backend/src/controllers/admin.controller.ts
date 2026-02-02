import type { Request, Response } from "express"
import z from "zod"
import { UserService } from "../services/user.service"
import { AdminCreateUserDTO } from "../dtos/user.dto"

const userService = new UserService()

function safeUser(user: any) {
  const obj = typeof user?.toObject === "function" ? user.toObject() : user
  if (!obj) return obj
  const { password, ...rest } = obj
  return rest
}

export class AdminUsersController {
  // ✅ POST /api/admin/users (supports Multer image)
  async createUser(req: Request, res: Response) {
    try {
      const parsed = AdminCreateUserDTO.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        })
      }

      const file = (req as any).file as Express.Multer.File | undefined

      // pass optional profile_picture to service
      const created = await userService.createUserAsAdmin({
        ...parsed.data,
        profile_picture: file ? file.filename : null,
      } as any)

      return res.status(201).json({
        success: true,
        message: "User created (admin)",
        data: safeUser(created),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // ✅ GET /api/admin/users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers()
      return res.status(200).json({
        success: true,
        data: users.map((u: any) => safeUser(u)),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // ✅ GET /api/admin/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id)
      return res.status(200).json({ success: true, data: safeUser(user) })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // ✅ PUT /api/admin/users/:id (supports Multer image)
  async updateUser(req: Request, res: Response) {
    try {
      const updates: any = { ...req.body }

      const file = (req as any).file as Express.Multer.File | undefined
      if (file) updates.profile_picture = file.filename

      Object.keys(updates).forEach((k) => {
        if (updates[k] === "") delete updates[k]
      })

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "No valid fields to update" })
      }

      const updated = await userService.updateUserById(req.params.id, updates)

      return res.status(200).json({
        success: true,
        message: "User updated (admin)",
        data: safeUser(updated),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // ✅ DELETE /api/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUserById(req.params.id)
      return res.status(200).json({ success: true, message: "User deleted" })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }
}
