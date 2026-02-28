const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const endpoints = {
  // auth
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  me: `${API_BASE}/auth/me`,
  updateUser: (id: string) => `${API_BASE}/auth/${id}`,
  uploadProfile: `${API_BASE}/auth/upload-profile-picture`,
  adminVerify: `${API_BASE}/auth/admin/verify`,
  changePassword: `${API_BASE}/auth/change-password`,

  // forgot password
  forgotPassword: `${API_BASE}/auth/forgot-password`,
  verifyResetCode: `${API_BASE}/auth/verify-reset-code`,
  resetPassword: `${API_BASE}/auth/reset-password`,

  // admin users
  adminUsers: `${API_BASE}/admin/users`,
  adminUserById: (id: string) => `${API_BASE}/admin/users/${id}`,

  // ✅ PUBLIC
  categories: `${API_BASE}/categories`,
  publicPackages: `${API_BASE}/packages`,

  // ✅ CARS (AUTH)
  cars: `${API_BASE}/cars`,
  carById: (id: string) => `${API_BASE}/cars/${id}`,

  // ✅ ADMIN PACKAGES
  adminPackages: `${API_BASE}/admin/packages`,
  adminPackageById: (id: string) => `${API_BASE}/admin/packages/${id}`,

  // public
providers: `${API_BASE}/providers`,

// user orders
myOrders: `${API_BASE}/orders/my`,
createPaidOrder: `${API_BASE}/orders/paid`,

// admin providers
adminProviders: `${API_BASE}/admin/providers`,
adminProviderById: (id: string) => `${API_BASE}/admin/providers/${id}`,

// admin orders
adminOrders: `${API_BASE}/admin/orders`,
adminOrderStatus: (id: string) => `${API_BASE}/admin/orders/${id}/status`,


}