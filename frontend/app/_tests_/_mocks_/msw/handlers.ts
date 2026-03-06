import { http, HttpResponse } from "msw"

export const handlers = [
  http.post("/api/auth/login", async () => {
    return HttpResponse.json({
      success: true,
      token: "fake_token_123",
      data: {
        token: "fake_token_123",
        user: { email: "test@test.com" },
      },
    })
  }),
]