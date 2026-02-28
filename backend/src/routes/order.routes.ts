import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { OrdersController } from "../controllers/order.controller"

const router = Router()
const c = new OrdersController()

router.use(authMiddleware)

router.get("/my", (req, res) => c.myOrders(req as any, res))
router.post("/paid", (req, res) => c.createPaid(req as any, res))

export default router