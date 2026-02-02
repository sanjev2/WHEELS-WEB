import Cookies from "js-cookie"

const ADMIN_UNTIL_COOKIE = "wheels_admin_verified_until"

export function setAdminVerified(minutes: number = 15) {
  const until = Date.now() + minutes * 60 * 1000
  const days = minutes / (60 * 24)
  Cookies.set(ADMIN_UNTIL_COOKIE, String(until), { expires: days })
  return until
}

export function isAdminVerified(): boolean {
  const v = Cookies.get(ADMIN_UNTIL_COOKIE)
  if (!v) return false
  const until = Number(v)
  if (!Number.isFinite(until)) return false
  return Date.now() < until
}

export function clearAdminVerified() {
  Cookies.remove(ADMIN_UNTIL_COOKIE)
  Cookies.remove(ADMIN_UNTIL_COOKIE, { path: "/" })
  Cookies.remove(ADMIN_UNTIL_COOKIE, { path: "/admin" })
}
