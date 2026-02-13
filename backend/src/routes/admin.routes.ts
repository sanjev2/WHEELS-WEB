import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"
import { AdminUsersController } from "../controllers/admin.controller"
import { uploadProfilePicture } from "../middleware/upload.middleware"

const router = Router()
const controller = new AdminUsersController()

// ✅ only run multer when content-type is multipart/form-data
const maybeUploadProfilePicture = (req: any, res: any, next: any) => {
  const ct = req.headers["content-type"] || ""
  if (ct.includes("multipart/form-data")) {
    return uploadProfilePicture.single("profilePicture")(req, res, (err: any) => {
      if (err) return res.status(400).json({ success: false, message: err.message || "Upload error" })
      next()
    })
  }
  return next()
}

router.use(authMiddleware, adminMiddleware)

// ✅ PAGINATED GET ALL USERS
// GET /api/admin/users?page=1&limit=10&search=abc
router.get("/", (req, res) => controller.getAllUsers(req, res))

// ✅ Admin create user: allow JSON OR multipart (if you attach image)
router.post("/", maybeUploadProfilePicture, (req, res) => controller.createUser(req, res))

router.get("/:id", (req, res) => controller.getUserById(req, res))

// ✅ Admin update user: allow JSON OR multipart (if you attach image)
router.put("/:id", maybeUploadProfilePicture, (req, res) => controller.updateUser(req, res))

router.delete("/:id", (req, res) => controller.deleteUser(req, res))

export default router
