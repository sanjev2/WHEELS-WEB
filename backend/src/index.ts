import express, { Application, Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import path from "path"
import { connectDatabase } from "./database/mongodb"
import { PORT } from "./config"
import authRoutes from "./routes/auth.routes"
import adminUsersRoutes from "./routes/admin.routes"

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

app.use("/api/auth", authRoutes)
app.use("/api/admin/users", adminUsersRoutes)

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" })
})

async function startServer() {
  await connectDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
    console.log(`Static files served on: http://localhost:${PORT}/public`)
  })
}

startServer()
