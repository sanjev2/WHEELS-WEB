import { fireEvent, screen, waitFor } from "@testing-library/react"
import { renderWithAuth } from "../test-utils/renderWithAuth"

jest.mock("@/app/lib/api/admin/user", () => ({
  adminUsersApi: {
    getAll: jest.fn(),
    remove: jest.fn(),
  },
}))
import { adminUsersApi } from "@/app/lib/api/admin/user"
import AdminUsersPage from "@/app/admin/user/page"

function makeUsers(n: number) {
  return Array.from({ length: n }).map((_, i) => ({
    _id: `u${i + 1}`,
    name: `User ${i + 1}`,
    email: `u${i + 1}@x.com`,
    role: i % 2 === 0 ? "admin" : "user",
  }))
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminUsersApi.getAll as jest.Mock).mockResolvedValue({
      data: makeUsers(3),
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
    })
    ;(adminUsersApi.remove as jest.Mock).mockResolvedValue({})
    // confirm defaults to true in tests where needed
    ;(global as any).confirm = jest.fn(() => true)
  })

  it("renders page header", async () => {
    renderWithAuth(<AdminUsersPage />)
    expect(await screen.findByText("Users")).toBeInTheDocument()
  })

  it("loads users on mount", async () => {
    renderWithAuth(<AdminUsersPage />)
    await waitFor(() => expect(adminUsersApi.getAll).toHaveBeenCalled())
    expect(screen.getByText("User 1")).toBeInTheDocument()
  })

 

  it("shows empty state", async () => {
    ;(adminUsersApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    })
    renderWithAuth(<AdminUsersPage />)
    await waitFor(() => expect(screen.getByText(/no users found/i)).toBeInTheDocument())
  })

  it("search button triggers reload with search term", async () => {
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: "abc" } })
    fireEvent.click(screen.getByRole("button", { name: /search/i }))
    await waitFor(() => {
      expect(adminUsersApi.getAll).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ search: "abc", page: 1 }))
    })
  })

  it("enter key triggers search", async () => {
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    const input = screen.getByPlaceholderText(/search by name/i)
    fireEvent.change(input, { target: { value: "x" } })
    fireEvent.keyDown(input, { key: "Enter" })
    await waitFor(() => expect(adminUsersApi.getAll).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ search: "x", page: 1 })))
  })

  it("refresh button reloads", async () => {
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.click(screen.getByRole("button", { name: /refresh/i }))
    await waitFor(() => expect(adminUsersApi.getAll).toHaveBeenCalledTimes(2))
  })

  it("limit change reloads with page=1", async () => {
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "20" } })
    await waitFor(() => expect(adminUsersApi.getAll).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ limit: 20, page: 1 })))
  })

  it("delete cancel does not call remove", async () => {
    ;(global as any).confirm = jest.fn(() => false)
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0])
    expect(adminUsersApi.remove).not.toHaveBeenCalled()
  })

  it("delete confirm calls remove and reloads", async () => {
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0])
    await waitFor(() => expect(adminUsersApi.remove).toHaveBeenCalled())
    await waitFor(() => expect(adminUsersApi.getAll).toHaveBeenCalledTimes(2))
  })

  it("shows error when delete fails", async () => {
    ;(adminUsersApi.remove as jest.Mock).mockRejectedValueOnce(new Error("delete-fail"))
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0])
    await waitFor(() => expect(screen.getByText("delete-fail")).toBeInTheDocument())
  })

  it("shows error when load fails", async () => {
    ;(adminUsersApi.getAll as jest.Mock).mockRejectedValueOnce(new Error("load-fail"))
    renderWithAuth(<AdminUsersPage />)
    await waitFor(() => expect(screen.getByText("load-fail")).toBeInTheDocument())
  })

  // ---- pagination behavior (table-driven) ----
  test.each([
    { page: 1, totalPages: 3, canPrev: false, canNext: true },
    { page: 2, totalPages: 3, canPrev: true, canNext: true },
    { page: 3, totalPages: 3, canPrev: true, canNext: false },
  ])("pagination UI state %#", async ({ page, totalPages, canPrev, canNext }) => {
    ;(adminUsersApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: makeUsers(2),
      pagination: { page, limit: 10, total: 20, totalPages },
    })
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")

    const prev = screen.getByRole("button", { name: /prev/i })
    const next = screen.getByRole("button", { name: /next/i })

    expect(prev).toHaveProperty("disabled", !canPrev)
    expect(next).toHaveProperty("disabled", !canNext)
  })

  it("next page button triggers load(page+1)", async () => {
    ;(adminUsersApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: makeUsers(2),
      pagination: { page: 1, limit: 10, total: 20, totalPages: 2 },
    })
    renderWithAuth(<AdminUsersPage />)
    await screen.findByText("User 1")
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }))
    await waitFor(() => {
      expect(adminUsersApi.getAll).toHaveBeenLastCalledWith("token-123", expect.objectContaining({ page: 2 }))
    })
  })



  // ---- mass render sanity tests (adds lots of cases quickly) ----
  test.each([0, 1, 2, 10, 50])("renders %s users without crashing", async (n) => {
    ;(adminUsersApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: makeUsers(n),
      pagination: { page: 1, limit: 10, total: n, totalPages: 1 },
    })
    renderWithAuth(<AdminUsersPage />)
    if (n === 0) {
      await waitFor(() => expect(screen.getByText(/no users found/i)).toBeInTheDocument())
    } else {
      await waitFor(() => expect(screen.getByText("User 1")).toBeInTheDocument())
    }
  })
})