import { UserService } from "../services/user.service"
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto"
import type { Request, Response } from "express"
import z from "zo"

const userService = new UserService()

export class AuthController {
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const parsedData = CreateUserDTO.safeParse(req.body)
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        })
      }

      const userData: CreateUserDTO = parsedData.data

      // Create user
      const newUser = await userService.createUser(userData)

      // Exclude password, keep role
      const { password, ...userWithoutPassword } = newUser.toObject()

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: userWithoutPassword, 
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      // Validate request body
      const parsedData = LoginUserDTO.safeParse(req.body)
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        })
      }

      const loginData: LoginUserDTO = parsedData.data

      // Authenticate user
      const { token, user } = await userService.loginUser(loginData)

      // Exclude password, keep role
      const { password, ...userWithoutPassword } = user.toObject()

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: userWithoutPassword, 
        token, // JWT token
      })
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      })
    }
  }
}
