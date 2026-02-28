import { Router } from "express"
import { PublicController } from "../controllers/public.controller"
import { ProviderService } from "../services/provider.service"

const router = Router()
const controller = new PublicController()

router.get("/categories", (req, res) => controller.categories(req, res))
router.get("/vehicles", (req, res) => controller.listVehicles(req, res))
router.get("/packages", (req, res) => controller.listPackages(req, res))

router.get("/providers", (req, res) => controller.listProviders(req, res))


export default router


