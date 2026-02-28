import express, { Application, Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import path from "path"

import authRoutes from "./routes/auth.routes"
import adminUsersRoutes from "./routes/admin.routes"

// ✅ NEW ROUTES
import publicRoutes from "./routes/public.routes"
import adminVehiclesRoutes from "./routes/admin.vehicles.routes"
import adminPackagesRoutes from "./routes/admin.packages.routes"
import carRoutes from "./routes/car.routes"
import adminProvidersRoutes from "./routes/admin.provider.routes"
import adminOrdersRoutes from "./routes/admin.order.routes"
import ordersRoutes from "./routes/order.routes"
import esewaRoutes from "./routes/esewa.routes"

// ...

const app: Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use("/public", express.static(path.join(process.cwd(), "public")))

// ✅ EXISTING
app.use("/api/auth", authRoutes)
app.use("/api/admin/users", adminUsersRoutes)

// ✅ PUBLIC
app.use("/api", publicRoutes)

// ✅ ADMIN
app.use("/api/admin/vehicles", adminVehiclesRoutes)
app.use("/api/admin/packages", adminPackagesRoutes)

// ✅ CARS (AUTH)
app.use("/api/cars", carRoutes)

app.use("/api/admin/providers", adminProvidersRoutes)
app.use("/api/admin/orders", adminOrdersRoutes)

app.use("/api/orders", ordersRoutes)

app.use("/api/esewa", esewaRoutes)

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" })
})

export default app
