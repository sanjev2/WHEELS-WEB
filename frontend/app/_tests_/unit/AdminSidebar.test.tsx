// app/_tests_/unit/AdminSidebar.test.tsx

import "../test-utils/next" // ✅ MUST be first (before importing the component)

import { fireEvent, screen } from "@testing-library/react"
import AdminSidebar from "@/app/admin/components/AdminSidebar"
import { renderWithAuth } from "../test-utils/renderWithAuth"
import { mockReplace, setPathname } from "../test-utils/next"

jest.mock("@/app/lib/admin-session", () => ({
  clearAdminVerified: jest.fn(),
}))
import { clearAdminVerified } from "@/app/lib/admin-session"

describe("AdminSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders sections", () => {
    setPathname("/admin/dashboard")
    renderWithAuth(<AdminSidebar />)
    expect(screen.getByText("Navigation")).toBeInTheDocument()
    expect(screen.getByText("Management")).toBeInTheDocument()
  })

  test.each([
    ["/admin/dashboard", "Dashboard", "/admin/dashboard"],
    ["/admin/user", "Users", "/admin/user"],
    ["/admin/dashboard/providers", "Providers", "/admin/dashboard/providers"],
    ["/admin/dashboard/orders", "Orders", "/admin/dashboard/orders"],
  ])("renders link %s", (path, name, href) => {
    setPathname(path)
    renderWithAuth(<AdminSidebar />)
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href)
  })

  it("marks active exact match", () => {
    setPathname("/admin/user")
    renderWithAuth(<AdminSidebar />)
    const link = screen.getByRole("link", { name: "Users" })
    expect(link.className).toMatch(/bg-emerald-600/)
  })

  it("marks active startsWith for nested routes", () => {
    setPathname("/admin/dashboard/providers/123")
    renderWithAuth(<AdminSidebar />)
    const link = screen.getByRole("link", { name: "Providers" })
    expect(link.className).toMatch(/bg-emerald-600/)
  })

  it("exit button clears admin verified and routes to /dashboard", () => {
    setPathname("/admin/dashboard")
    renderWithAuth(<AdminSidebar />)
    fireEvent.click(screen.getByRole("button", { name: /exit admin/i }))
    expect(clearAdminVerified).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith("/dashboard")
  })

  test.each([
    "/admin/dashboard",
    "/admin/user",
    "/admin/dashboard/orders",
    "/admin/dashboard/providers",
  ])("does not crash on path %s", (p) => {
    setPathname(p)
    renderWithAuth(<AdminSidebar />)
    expect(screen.getByText("Admin Portal")).toBeInTheDocument()
  })
})