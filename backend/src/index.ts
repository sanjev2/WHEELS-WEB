import "./config/index"
import app from "./app"
import { connectDatabase } from "./database/mongodb"
import { PORT } from "./config/index"

const HOST = "0.0.0.0" // ✅ important for emulator/device access

async function startServer() {
  await connectDatabase()

  app.listen(Number(PORT), HOST, () => {
    console.log(`Server running on: http://${HOST}:${PORT}`)
    console.log(`Local PC: http://localhost:${PORT}`)
  })
}

startServer()