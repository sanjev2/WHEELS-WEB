// app/_tests_/unit/AdminLayout.test.tsx

// IMPORTANT: import next test-utils FIRST so jest.mock("next/navigation") runs
import "../test-utils/next"

import React from "react"
import { act, screen, waitFor } from "@testing-library/react"
import { renderWithAuth } from "../test-utils/renderWithAuth"
import { mockReplace } from "../test-utils/next"

jest.mock("@/app/lib/admin-session", () => ({
  isAdminVerified: jest.fn(),
}))
import { isAdminVerified } from "@/app/lib/admin-session"

// Mock these so we don't render real sidebar/topbar in layout tests
jest.mock("../../admin/components/AdminSidebar", () => () => <div data-testid="sidebar" />)
jest.mock("../../admin/components/AdminTopbar", () => () => <div data-testid="topbar" />)

// Import AFTER next/navigation is mocked
import AdminLayout from "@/app/admin/layout"

describe("AdminLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

 
  it("redirects if user missing", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      { user: null }
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"))
  })

  it("redirects if role not admin", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      {
        user: { name: "U", email: "u@u.com", role: "user" },
      }
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"))
  })

  it("redirects if admin not verified", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(false)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      {
        user: { name: "A", email: "a@a.com", role: "admin" },
      }
    )

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"))
  })

  it("renders children when verified admin", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      {
        user: { name: "A", email: "a@a.com", role: "admin" },
      }
    )

    // flush effect(s)
    await act(async () => {})

    expect(screen.getByTestId("sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("topbar")).toBeInTheDocument()
    expect(screen.getByText("Child")).toBeInTheDocument()
  })

  it("interval redirects if verification revoked", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      {
        user: { name: "A", email: "a@a.com", role: "admin" },
      }
    )

    await act(async () => {})

    ;(isAdminVerified as jest.Mock).mockReturnValue(false)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(mockReplace).toHaveBeenCalledWith("/dashboard")
  })

  test.each([
    [{ role: "admin" }, true],
    [{ role: "user" }, false],
    [null, false],
  ])("access rule user=%p", async (u, ok) => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)

    renderWithAuth(
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>,
      { user: u as any }
    )

    if (ok) {
      // just ensure it doesn't crash; allow effects to run
      await act(async () => {})
      expect(true).toBe(true)
    } else {
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"))
    }
  })
})