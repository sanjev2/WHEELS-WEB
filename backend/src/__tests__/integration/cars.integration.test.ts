import request from "supertest"
import app from "../../app"
import { signupUser, loginUser, uniqEmail, authHeader, ROUTES } from "./integration.helpers"

describe("Cars (real integration)", () => {
  async function userToken() {
    const email = uniqEmail("caruser")
    await signupUser({ email })
    const login = await loginUser(email)
    return login.body.token as string
  }

  it("POST /api/cars requires auth", async () => {
    const res = await request(app).post(ROUTES.cars).send({})
    expect(res.status).toBe(401)
  })

 


})