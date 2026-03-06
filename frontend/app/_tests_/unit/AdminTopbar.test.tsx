// app/_tests_/unit/AdminTopbar.test.tsx

import React from "react"
import { screen } from "@testing-library/react"
import { renderWithAuth } from "../test-utils/renderWithAuth"

// ✅ Hard-mock next/navigation here so pathname is 100% controlled in this test file
const mockUsePathname = jest.fn()

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}))

// ✅ Mock next/link so <Link> renders as <a>
jest.mock("next/link", () => {
  return function Link(props: any) {
    const { href, children, ...rest } = props
    const resolvedHref = typeof href === "string" ? href : href?.pathname ?? ""
    return React.createElement("a", { href: resolvedHref, ...rest }, children)
  }
})

import AdminTopbar from "@/app/admin/components/AdminTopbar"

describe("AdminTopbar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })


  it("edit user route shows Edit User title", () => {
    mockUsePathname.mockReturnValue("/admin/user/abc")
    renderWithAuth(<AdminTopbar />)
    expect(screen.getByText("Edit User")).toBeInTheDocument()
  })

  it("default meta renders for unknown route", () => {
    mockUsePathname.mockReturnValue("/admin/anything")
    renderWithAuth(<AdminTopbar />)
    expect(screen.getByText("Admin Portal")).toBeInTheDocument()
  })

  it("has Settings link", () => {
    mockUsePathname.mockReturnValue("/admin/dashboard")
    renderWithAuth(<AdminTopbar />)
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/admin/settings")
  })

  it("shows status pills", () => {
    mockUsePathname.mockReturnValue("/admin/dashboard")
    renderWithAuth(<AdminTopbar />)
    expect(screen.getByText("Healthy")).toBeInTheDocument()
    expect(screen.getByText("Verified")).toBeInTheDocument()
  })
})