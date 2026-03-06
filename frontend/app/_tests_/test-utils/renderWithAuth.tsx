// app/_tests_/test-utils/renderWithAuth.tsx
import React from "react"
import { render } from "@testing-library/react"
import Cookies from "js-cookie"
import { AuthProvider } from "@/app/context/auth-contexts"

type RenderOpts = { token?: string | null; user?: any | null }

export function renderWithAuth(ui: React.ReactElement, opts?: RenderOpts) {
  const token = opts && "token" in opts ? opts.token : "token-123"
  const user =
    opts && "user" in opts
      ? opts.user
      : { name: "Admin", email: "admin@x.com", role: "admin" }

  if (token) Cookies.set("wheels_token", token)
  else Cookies.remove("wheels_token")

  if (user) Cookies.set("wheels_user", JSON.stringify(user))
  else Cookies.remove("wheels_user")

  return render(<AuthProvider>{ui}</AuthProvider>)
}