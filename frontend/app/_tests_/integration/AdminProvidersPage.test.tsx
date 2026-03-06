// IMPORTANT: load next router mock FIRST
import "../test-utils/next"

import { fireEvent, screen, waitFor } from "@testing-library/react"
import { renderWithAuth } from "../test-utils/renderWithAuth"
import { mockReplace } from "../test-utils/next"

jest.mock("@/app/lib/admin-session", () => ({
  isAdminVerified: jest.fn(),
}))
import { isAdminVerified } from "@/app/lib/admin-session"

jest.mock("@/app/lib/actions/admin/provider.action", () => ({
  adminProvidersActions: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}))
import { adminProvidersActions } from "@/app/lib/actions/admin/provider.action"

// mock MapPicker dynamic import
jest.mock("next/dynamic", () => () => (props: any) => (
  <div data-testid="map-picker" onClick={() => props.onChange(1, 2)} />
))

// import page AFTER mocks
import AdminProvidersPage from "@/app/admin/dashboard/providers/page"

describe("AdminProvidersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)
  })

  it("redirects if not verified", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(false)

    renderWithAuth(<AdminProvidersPage />)

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/dashboard")
    )
  })

  it("loads list and shows empty", async () => {
    ;(adminProvidersActions.list as jest.Mock).mockResolvedValue({ data: [] })

    renderWithAuth(<AdminProvidersPage />)

    await waitFor(() =>
      expect(screen.getByText(/no providers yet/i)).toBeInTheDocument()
    )
  })

  it("renders provider rows", async () => {
    ;(adminProvidersActions.list as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: "p1",
          name: "Prov",
          openFrom: "09:00",
          openTo: "18:00",
          lat: 1,
          lng: 2,
          categories: [],
          isActive: true,
        },
      ],
    })

    renderWithAuth(<AdminProvidersPage />)

    await waitFor(() =>
      expect(screen.getByText("Prov")).toBeInTheDocument()
    )
  })

  it("create disabled when name missing", async () => {
    ;(adminProvidersActions.list as jest.Mock).mockResolvedValue({ data: [] })

    renderWithAuth(<AdminProvidersPage />)

    const btn = await screen.findByRole("button", { name: /create/i })

    expect(btn).toBeDisabled()
  })

 

  it("creates provider and reloads", async () => {
    ;(adminProvidersActions.list as jest.Mock)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            _id: "p1",
            name: "X",
            openFrom: "09:00",
            openTo: "18:00",
            lat: 1,
            lng: 2,
            categories: [],
            isActive: true,
          },
        ],
      })

    ;(adminProvidersActions.create as jest.Mock).mockResolvedValue({})

    renderWithAuth(<AdminProvidersPage />)

    fireEvent.change(
      await screen.findByPlaceholderText(/provider name/i),
      { target: { value: "X" } }
    )

    fireEvent.click(screen.getByRole("button", { name: /create/i }))

    await waitFor(() =>
      expect(adminProvidersActions.create).toHaveBeenCalled()
    )

    await waitFor(() =>
      expect(screen.getByText("X")).toBeInTheDocument()
    )
  })

  it("delete calls remove and reloads", async () => {
    ;(adminProvidersActions.list as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            _id: "p1",
            name: "Prov",
            openFrom: "09:00",
            openTo: "18:00",
            lat: 1,
            lng: 2,
            categories: [],
            isActive: true,
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] })

    ;(adminProvidersActions.remove as jest.Mock).mockResolvedValue({})

    renderWithAuth(<AdminProvidersPage />)

    await waitFor(() => screen.getByText("Prov"))

    fireEvent.click(screen.getByRole("button", { name: /delete/i }))

    await waitFor(() =>
      expect(adminProvidersActions.remove).toHaveBeenCalledWith(
        "token-123",
        "p1"
      )
    )
  })
})