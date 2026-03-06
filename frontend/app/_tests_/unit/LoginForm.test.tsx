import { LoginForm } from "@/app/auth/components/Loginform"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const loginMock = jest.fn()

jest.mock("@/app/context/auth-contexts", () => ({
  useAuth: () => ({
    login: loginMock,
    isLoading: false,
  }),
}))

describe("LoginForm (unit)", () => {
  it("submits email + password", async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email address/i), "test@test.com")
    await user.type(screen.getByLabelText(/password/i), "Password@123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(loginMock).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "Password@123",
    })
  })
})