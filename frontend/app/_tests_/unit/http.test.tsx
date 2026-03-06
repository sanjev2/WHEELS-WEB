import { httpJson, httpAuthJson, httpAuthForm } from "@/app/lib/api/http"

describe("http helpers", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
  })

  function mockFetch(
    ok: boolean,
    status = 200,
    statusText = "OK",
    body = JSON.stringify({ success: true }),
  ) {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok,
      status,
      statusText,
      text: async () => body,
    })
  }

  it("httpJson sends JSON request", async () => {
    mockFetch(true, 200, "OK", JSON.stringify({ data: 123 }))

    const res = await httpJson<any>("http://x/api", {
      method: "POST",
      body: JSON.stringify({ a: 1 }),
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://x/api",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      })
    )

    expect(res).toEqual({ data: 123 })
  })

  it("httpAuthJson sends Authorization header", async () => {
    mockFetch(true, 200, "OK", JSON.stringify({ ok: true }))

    await httpAuthJson("http://x/api", "token-123")

    const options = (global.fetch as jest.Mock).mock.calls[0][1]

    expect(options.headers.Authorization).toBe("Bearer token-123")
  })

  it("httpAuthForm sends FormData without Content-Type", async () => {
    mockFetch(true)

    const fd = new FormData()

    await httpAuthForm("http://x/api", "token-123", fd)

    const options = (global.fetch as jest.Mock).mock.calls[0][1]

    expect(options.body).toBe(fd)
    expect(options.headers["Content-Type"]).toBeUndefined()
    expect(options.headers.Authorization).toBe("Bearer token-123")
  })

  it("parses JSON body correctly", async () => {
    mockFetch(true, 200, "OK", JSON.stringify({ a: 1 }))

    const res = await httpJson<any>("http://x/api")

    expect(res).toEqual({ a: 1 })
  })

  it("returns null when body empty", async () => {
    mockFetch(true, 200, "OK", "")

    const res = await httpJson<any>("http://x/api")

    expect(res).toBeNull()
  })

  it("throws error with server message", async () => {
    mockFetch(false, 400, "Bad Request", JSON.stringify({ message: "Bad input" }))

    await expect(httpJson("http://x/api")).rejects.toThrow("Bad input")
  })

  it("throws error using raw body if JSON invalid", async () => {
    mockFetch(false, 500, "Server Error", "plain error")

    await expect(httpJson("http://x/api")).rejects.toThrow("plain error")
  })

  it("error includes status and url", async () => {
    mockFetch(false, 404, "Not Found", "")

    await expect(httpJson("http://x/test")).rejects.toThrow(
      "Request failed (404 Not Found)"
    )
  })
})