import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"
import { AdminOrdersController } from "../controllers/admin.orders.controller"

const router = Router()
const c = new AdminOrdersController()

router.use(authMiddleware, adminMiddleware)

router.get("/", (req, res) => c.list(req, res))
router.put("/:id/status", (req, res) => c.updateStatus(req, res))

export default router