import type { LoginData, RegisterData } from "@/app/auth/schema"
import { authApi } from "@/app/lib/api/auth"

export const authActions = {
  signup: (payload: RegisterData) => authApi.signup(payload),
  login: (payload: LoginData) => authApi.login(payload),
  me: (token: string) => authApi.me(token),
}
