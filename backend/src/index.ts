import app from "./app"
import { connectDatabase } from "./database/mongodb"
import { PORT } from "./config"

async function startServer() {
  await connectDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
    console.log(`Static files served on: http://localhost:${PORT}/public`)
  })
}

startServer()
