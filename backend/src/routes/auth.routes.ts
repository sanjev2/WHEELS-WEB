import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { uploadProfilePicture } from "../middleware/upload.middleware"

const router = Router()
const controller = new AuthController()

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

router.post("/signup", (req, res) => controller.register(req, res))
router.post("/login", (req, res) => controller.login(req, res))

router.get("/me", authMiddleware, (req, res) => controller.me(req as any, res))

router.post(
  "/upload-profile-picture",
  authMiddleware,
  uploadProfilePicture.single("profilePicture"),
  (req, res) => controller.uploadProfilePicture(req as any, res)
)

router.post("/admin/verify", authMiddleware, (req, res) => controller.verifyAdmin(req as any, res))

// ✅ FIXED: PUT supports JSON updates AND multipart updates (with image)
router.put(
  "/:id",
  authMiddleware,
  maybeUploadProfilePicture, // ✅ important change
  (req, res) => controller.updateUser(req as any, res)
)

export default router
