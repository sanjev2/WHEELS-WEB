import { endpoints } from "./endpoints"
import { httpAuthJson, httpJson, httpAuthForm } from "./http"
import type { LoginData, RegisterData } from "@/app/auth/schema"
import type { User } from "@/app/context/auth-contexts"

type LoginResponse = {
  success: boolean
  message: string
  data: User
  token: string
}

type MeResponse = {
  success: boolean
  message: string
  data: User
}

export const authApi = {
  signup: async (payload: RegisterData) => {
    return httpJson<any>(endpoints.signup, {
      method: "POST",
      body: JSON.stringify({ ...payload, role: "user" }),
    })
  },

  login: async (payload: LoginData) => {
    const r = await httpJson<LoginResponse>(endpoints.login, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return { user: r.data, token: r.token }
  },

  me: async (token: string) => {
    const r = await httpAuthJson<MeResponse>(endpoints.me, token, { method: "GET" })
    return r.data
  },

  updateUserForm: async (token: string, id: string, fd: FormData) => {
    return httpAuthForm<any>(endpoints.updateUser(id), token, fd, { method: "PUT" })
  },

  uploadProfilePicture: async (token: string, fd: FormData) => {
    return httpAuthForm<any>(endpoints.uploadProfile, token, fd, { method: "POST" })
  },

  // ✅ forgot password
  forgotPassword: async (email: string) => {
    return httpJson<any>(endpoints.forgotPassword, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  verifyResetCode: async (email: string, code: string) => {
    return httpJson<any>(endpoints.verifyResetCode, {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    return httpJson<any>(endpoints.resetPassword, {
      method: "POST",
      body: JSON.stringify({ resetToken, newPassword }),
    })
  },
}
