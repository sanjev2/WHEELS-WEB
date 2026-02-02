import type { Request, Response } from "express"
import z from "zod"
import { UserService } from "../services/user.service"
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto"
import type { AuthRequest } from "../middleware/auth.middleware"

const userService = new UserService()

function safeUser(user: any) {
  const obj = typeof user?.toObject === "function" ? user.toObject() : user
  if (!obj) return obj
  const { password, ...rest } = obj
  return rest
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body)
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        })
      }

      const created = await userService.createUser(parsedData.data)
      return res.status(201).json({
        success: true,
        message: "User Created",
        data: safeUser(created),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body)
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        })
      }

      const { token, user } = await userService.loginUser(parsedData.data)
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: safeUser(user),
        token,
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" })

      const user = await userService.getMe(userId)
      return res.status(200).json({
        success: true,
        message: "Profile fetched",
        data: safeUser(user),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  async uploadProfilePicture(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" })

      const file = (req as any).file as Express.Multer.File | undefined
      if (!file) {
        return res.status(400).json({ success: false, message: "Please upload a valid image file" })
      }

      const updatedUser = await userService.setProfilePicture(userId, file.filename)

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          filename: file.filename,
          // ✅ FIXED: your upload middleware uses /public/profile_photo
          url: `/public/profile_photo/${file.filename}`,
          user: safeUser(updatedUser),
        },
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // ✅ verify admin code before opening admin dashboard
  async verifyAdmin(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" })
      if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access only" })

      const serverCode = process.env.ADMIN_PANEL_CODE
      if (!serverCode) return res.status(500).json({ success: false, message: "Admin code not configured" })

      const { code } = req.body as { code?: string }
      if (!code) return res.status(400).json({ success: false, message: "Code is required" })
      if (code !== serverCode) return res.status(401).json({ success: false, message: "Invalid admin code" })

      return res.status(200).json({ success: true, message: "Admin verified" })
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" })
    }
  }

  // ✅ PUT /api/auth/:id (self OR admin) + supports Multer
  async updateUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" })

      const targetId = req.params.id
      const requesterId = req.user.userId
      const requesterRole = req.user.role

      const isSelf = String(targetId) === String(requesterId)
      const isAdmin = requesterRole === "admin"

      if (!isSelf && !isAdmin) {
        return res.status(403).json({ success: false, message: "Forbidden" })
      }

      // ✅ Merge body + optional file
      const updates: any = { ...req.body }

      const file = (req as any).file as Express.Multer.File | undefined
      if (file) updates.profile_picture = file.filename

      // ✅ FormData often sends empty strings; remove them so you don't overwrite with ""
      Object.keys(updates).forEach((k) => {
        if (updates[k] === "") delete updates[k]
      })

      // ✅ If nothing to update
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: "No valid fields to update" })
      }

      const updated = await userService.updateUserById(targetId, updates)

      return res.status(200).json({
        success: true,
        message: "User updated",
        data: safeUser(updated),
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }
}
