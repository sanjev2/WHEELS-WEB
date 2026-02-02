import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token." })
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId: string
      email: string
      role: string
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." })
  }
}
