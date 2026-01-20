import express, { Application, Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { connectDatabase } from "./database/mongodb"
import { PORT } from "./config"
import authRoutes from "./routes/auth.routes"

const app: Application = express()

// Body parsers
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// ✅ SIMPLE & SAFE CORS (Frontend only)
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// ✅ Handle preflight requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }
  next()
})

// Routes
app.use("/api/auth", authRoutes)

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  })
})

async function startServer() {
  await connectDatabase()

  app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
    console.log("CORS enabled for: http://localhost:3000")
  })
}

startServer()
