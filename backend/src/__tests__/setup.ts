import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({ path: ".env.test" })

const isIntegration = () => {
  // Jest provides the test file path in expect.getState().testPath
  const testPath = (global as any).expect?.getState?.().testPath || ""
  return testPath.includes("\\__tests__\\integration\\") || testPath.includes("/__tests__/integration/")
}

beforeAll(async () => {
  if (!isIntegration()) return

  const url = process.env.MONGO_TEST_URL
  if (!url) throw new Error("MONGO_TEST_URL missing in .env.test")
  await mongoose.connect(url)
})

afterEach(async () => {
  if (!isIntegration()) return
  if (!mongoose.connection.db) return

  const collections = await mongoose.connection.db.collections()
  for (const c of collections) {
    await c.deleteMany({})
  }
})

afterAll(async () => {
  if (!isIntegration()) return
  await mongoose.disconnect()
})
