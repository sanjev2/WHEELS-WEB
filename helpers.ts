export const ROUTES = {
  login: "/api/auth/login",
  cars: "/api/cars",
}

export const RUN_ID = `${Date.now()}_${Math.floor(Math.random() * 100000)}`
export const uniqEmail = (p: string) => `${p}_${RUN_ID}@test.com`