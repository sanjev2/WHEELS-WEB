// IMPORTANT: load next/navigation mock FIRST
import "../test-utils/next"

import { fireEvent, screen, waitFor } from "@testing-library/react"
import { renderWithAuth } from "../test-utils/renderWithAuth"
import { mockReplace } from "../test-utils/next"

jest.mock("@/app/lib/admin-session", () => ({
  isAdminVerified: jest.fn(),
}))
import { isAdminVerified } from "@/app/lib/admin-session"

jest.mock("@/app/lib/actions/admin/order.action", () => ({
  adminOrdersActions: {
    list: jest.fn(),
    updateStatus: jest.fn(),
  },
}))
import { adminOrdersActions } from "@/app/lib/actions/admin/order.action"

// IMPORT PAGE AFTER MOCKS
import AdminOrdersPage from "@/app/admin/dashboard/orders/page"

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(isAdminVerified as jest.Mock).mockReturnValue(true)
  })

  it("redirects if not verified", async () => {
    ;(isAdminVerified as jest.Mock).mockReturnValue(false)

    renderWithAuth(<AdminOrdersPage />)

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/dashboard")
    )
  })

  it("shows loading then empty", async () => {
    ;(adminOrdersActions.list as jest.Mock).mockResolvedValue({ data: [] })

    renderWithAuth(<AdminOrdersPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
    )
  })

  it("renders orders list", async () => {
    ;(adminOrdersActions.list as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: "o1",
          packageTitle: "Pkg 1",
          providerName: "P",
          totalPrice: 100,
          status: "PAID",
        },
      ],
    })

    renderWithAuth(<AdminOrdersPage />)

    await waitFor(() =>
      expect(screen.getByText("Pkg 1")).toBeInTheDocument()
    )

    expect(screen.getByDisplayValue("PAID")).toBeInTheDocument()
  })

  it("change status calls update then reload", async () => {
    ;(adminOrdersActions.list as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            _id: "o1",
            packageTitle: "Pkg 1",
            providerName: "P",
            totalPrice: 100,
            status: "PAID",
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            _id: "o1",
            packageTitle: "Pkg 1",
            providerName: "P",
            totalPrice: 100,
            status: "COMPLETED",
          },
        ],
      })

    ;(adminOrdersActions.updateStatus as jest.Mock).mockResolvedValue({})

    renderWithAuth(<AdminOrdersPage />)

    await waitFor(() => screen.getByText("Pkg 1"))

    fireEvent.change(screen.getByDisplayValue("PAID"), {
      target: { value: "COMPLETED" },
    })

    await waitFor(() =>
      expect(adminOrdersActions.updateStatus).toHaveBeenCalledWith(
        "token-123",
        "o1",
        "COMPLETED"
      )
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue("COMPLETED")).toBeInTheDocument()
    )
  })

  it("shows error when list fails", async () => {
    ;(adminOrdersActions.list as jest.Mock).mockRejectedValue(new Error("boom"))

    renderWithAuth(<AdminOrdersPage />)

    await waitFor(() =>
      expect(screen.getByText("boom")).toBeInTheDocument()
    )
  })

  it("shows error when update fails", async () => {
    ;(adminOrdersActions.list as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: "o1",
          packageTitle: "Pkg 1",
          providerName: "P",
          totalPrice: 100,
          status: "PAID",
        },
      ],
    })

    ;(adminOrdersActions.updateStatus as jest.Mock).mockRejectedValue(
      new Error("update-fail")
    )

    renderWithAuth(<AdminOrdersPage />)

    await waitFor(() => screen.getByText("Pkg 1"))

    fireEvent.change(screen.getByDisplayValue("PAID"), {
      target: { value: "COMPLETED" },
    })

    await waitFor(() =>
      expect(screen.getByText("update-fail")).toBeInTheDocument()
    )
  })
})