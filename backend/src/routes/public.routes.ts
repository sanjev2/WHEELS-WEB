import { Router } from "express"
import { PublicController } from "../controllers/public.controller"

const router = Router()
const controller = new PublicController()

router.get("/categories", (req, res) => controller.categories(req, res))
router.get("/vehicles", (req, res) => controller.listVehicles(req, res))
router.get("/packages", (req, res) => controller.listPackages(req, res))

export default router
