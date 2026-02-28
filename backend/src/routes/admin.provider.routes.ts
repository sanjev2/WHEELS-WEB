import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"
import { AdminProvidersController } from "../controllers/admin.provider.controller"

const router = Router()
const c = new AdminProvidersController()

router.use(authMiddleware, adminMiddleware)

router.get("/", (req, res) => c.list(req, res))
router.post("/", (req, res) => c.create(req, res))
router.put("/:id", (req, res) => c.update(req, res))
router.delete("/:id", (req, res) => c.remove(req, res))

export default router