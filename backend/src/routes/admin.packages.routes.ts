import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"
import { AdminPackagesController } from "../controllers/admin.packages.controller"

const router = Router()
const controller = new AdminPackagesController()

router.use(authMiddleware, adminMiddleware)

router.get("/", (req, res) => controller.list(req, res))
router.post("/", (req, res) => controller.create(req, res))
router.put("/:id", (req, res) => controller.update(req, res))
router.delete("/:id", (req, res) => controller.remove(req, res))

export default router
