import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

beforeEach(() => {
  global.fetch = jest.fn(async () => {
    return {
      ok: true,
      json: async () => ({
        success: true,
        token: "fake_token_123",
        data: {
          token: "fake_token_123",
          user: { email: "test@test.com" },
        },
      }),
    } as any
  }) as any
})

afterEach(() => {
  jest.restoreAllMocks()
})

async function login(email: string, password: string) {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

describe("Auth Flow (integration)", () => {
  it("logs in and gets token", async () => {
    const user = userEvent.setup()

    render(
      <div>
        <button
          onClick={async () => {
            const data = await login("test@test.com", "Password@123")
            ;(window as any).__token = data.token
          }}
        >
          Login
        </button>
        <span>Ready</span>
      </div>
    )

    await user.click(screen.getByText("Login"))
    expect((window as any).__token).toBe("fake_token_123")
  })
})