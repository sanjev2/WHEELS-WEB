import type { LoginData, RegisterData } from "@/app/auth/schema"
import { authActions } from "@/app/lib/actions/auth-action"
import { authApi } from "@/app/lib/api/auth"

jest.mock("@/app/lib/api/auth", () => ({
  authApi: {
    signup: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
  },
}))

describe("authActions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("signup delegates to authApi.signup", async () => {
    const payload = { name: "A", email: "a@a.com", password: "123456" } as RegisterData
    ;(authApi.signup as jest.Mock).mockResolvedValue({ ok: true })

    await expect(authActions.signup(payload)).resolves.toEqual({ ok: true })
    expect(authApi.signup).toHaveBeenCalledWith(payload)
  })

  it("login delegates to authApi.login", async () => {
    const payload = { email: "a@a.com", password: "123456" } as LoginData
    ;(authApi.login as jest.Mock).mockResolvedValue({ user: { role: "user" }, token: "t" })

    await expect(authActions.login(payload)).resolves.toEqual({ user: { role: "user" }, token: "t" })
    expect(authApi.login).toHaveBeenCalledWith(payload)
  })

  it("me delegates to authApi.me", async () => {
    ;(authApi.me as jest.Mock).mockResolvedValue({ _id: "u1", role: "user" })

    await expect(authActions.me("token-123")).resolves.toEqual({ _id: "u1", role: "user" })
    expect(authApi.me).toHaveBeenCalledWith("token-123")
  })
})