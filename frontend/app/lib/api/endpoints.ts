const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const endpoints = {
  // auth
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  me: `${API_BASE}/auth/me`,
  updateUser: (id: string) => `${API_BASE}/auth/${id}`,
  uploadProfile: `${API_BASE}/auth/upload-profile-picture`,
  adminVerify: `${API_BASE}/auth/admin/verify`,

  // ✅ forgot password
  forgotPassword: `${API_BASE}/auth/forgot-password`,
  verifyResetCode: `${API_BASE}/auth/verify-reset-code`,
  resetPassword: `${API_BASE}/auth/reset-password`,

  // admin users
  adminUsers: `${API_BASE}/admin/users`,
  adminUserById: (id: string) => `${API_BASE}/admin/users/${id}`,
}
