import Cookies from "js-cookie"

export const cookies = {
  getToken: () => Cookies.get("wheels_token") || null,
  getUser: () => {
    const raw = Cookies.get("wheels_user")
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
}
