import { fireEvent, screen, waitFor } from "@testing-library/react"
import SettingsPage from "@/app/admin/settings/page"
import { renderWithAuth } from "../test-utils/renderWithAuth"

jest.mock("@/app/lib/api/auth", () => ({
  authApi: {
    changePassword: jest.fn(),
  },
}))

import { authApi } from "@/app/lib/api/auth"

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders form fields", () => {
    renderWithAuth(<SettingsPage />)

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    renderWithAuth(<SettingsPage />)

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(
        screen.getByText(/current password is required/i)
      ).toBeInTheDocument()
    )
  })

  it("validates min length for new password", async () => {
    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "123" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "123" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(screen.getByText(/at least 6/i)).toBeInTheDocument()
    )
  })

  it("validates passwords match", async () => {
    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "123456" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "xxxxxx" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    )
  })

  it("validates new password differs from current", async () => {
    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "samepass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "samepass" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "samepass" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(screen.getByText(/must be different/i)).toBeInTheDocument()
    )
  })

  it("calls api and shows success", async () => {
    ;(authApi.changePassword as jest.Mock).mockResolvedValue({})

    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "newpass1" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "newpass1" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(authApi.changePassword).toHaveBeenCalledWith(
        "token-123",
        "oldpass",
        "newpass1"
      )
    )

    await waitFor(() =>
      expect(
        screen.getByText(/password updated successfully/i)
      ).toBeInTheDocument()
    )
  })

  it("shows api error", async () => {
    ;(authApi.changePassword as jest.Mock).mockRejectedValue(new Error("fail"))

    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "newpass1" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "newpass1" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(screen.getByText("fail")).toBeInTheDocument()
    )
  })

  it("clear button resets messages", async () => {
    ;(authApi.changePassword as jest.Mock).mockRejectedValue(new Error("fail"))

    renderWithAuth(<SettingsPage />)

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpass" },
    })

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: "newpass1" },
    })

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "newpass1" },
    })

    fireEvent.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(screen.getByText("fail")).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole("button", { name: /clear/i }))

    expect(screen.queryByText("fail")).not.toBeInTheDocument()
  })
})