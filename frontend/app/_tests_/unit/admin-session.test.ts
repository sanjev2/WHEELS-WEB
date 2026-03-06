import Cookies from "js-cookie"
import { clearAdminVerified, isAdminVerified, setAdminVerified } from "@/app/lib/admin-session"

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}))

describe("admin-session", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it("setAdminVerified stores until timestamp and returns it", () => {
    const until = setAdminVerified(15)
    expect(typeof until).toBe("number")
    expect(Cookies.set).toHaveBeenCalledTimes(1)
  })

  it("setAdminVerified uses expires based on minutes", () => {
    setAdminVerified(60)
    const call = (Cookies.set as jest.Mock).mock.calls[0]
    expect(call[0]).toBe("wheels_admin_verified_until")
    expect(call[2]).toHaveProperty("expires")
  })

  it("isAdminVerified returns false when cookie missing", () => {
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
    expect(isAdminVerified()).toBe(false)
  })

  it("isAdminVerified returns false when cookie is not finite", () => {
    ;(Cookies.get as jest.Mock).mockReturnValue("abc")
    expect(isAdminVerified()).toBe(false)
  })

  it("isAdminVerified returns true when now < until", () => {
    const now = Date.now()
    ;(Cookies.get as jest.Mock).mockReturnValue(String(now + 1000))
    expect(isAdminVerified()).toBe(true)
  })

  it("isAdminVerified returns false when expired", () => {
    const now = Date.now()
    ;(Cookies.get as jest.Mock).mockReturnValue(String(now - 1))
    expect(isAdminVerified()).toBe(false)
  })

  it("clearAdminVerified removes cookie default", () => {
    clearAdminVerified()
    expect(Cookies.remove).toHaveBeenCalled()
  })

  it("clearAdminVerified removes cookie with '/' path", () => {
    clearAdminVerified()
    expect(Cookies.remove).toHaveBeenCalledWith("wheels_admin_verified_until", { path: "/" })
  })

  it("clearAdminVerified removes cookie with '/admin' path", () => {
    clearAdminVerified()
    expect(Cookies.remove).toHaveBeenCalledWith("wheels_admin_verified_until", { path: "/admin" })
  })

  test.each([1, 5, 15, 1440])("setAdminVerified handles minutes=%s", (mins) => {
    setAdminVerified(mins)
    expect(Cookies.set).toHaveBeenCalledTimes(1)
  })

  test.each(["", "0", "-1"])("isAdminVerified false for bad numeric cookie '%s'", (v) => {
    ;(Cookies.get as jest.Mock).mockReturnValue(v)
    expect(isAdminVerified()).toBe(false)
  })

  it("isAdminVerified uses Date.now (time travel)", () => {
    const base = Date.now()
    ;(Cookies.get as jest.Mock).mockReturnValue(String(base + 10_000))
    expect(isAdminVerified()).toBe(true)

    jest.setSystemTime(new Date(base + 11_000))
    expect(isAdminVerified()).toBe(false)
  })
})