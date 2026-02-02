import type { Response, NextFunction } from "express"
import type { AuthRequest } from "./auth.middleware"

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only" })
  }

  next()
}
