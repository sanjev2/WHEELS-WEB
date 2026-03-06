
jest.mock("../../../services/user.service", () => {
const mocks = {
 createUserAsAdmin: jest.fn(),
 getAllUsersPaginated: jest.fn(),
 getUserById: jest.fn(),
 updateUserById: jest.fn(),
 deleteUserById: jest.fn(),
}

return {
 __esModule: true,
 __mocks: mocks,
 UserService: jest.fn().mockImplementation(() => mocks),
}
})

import { AdminUsersController } from "../../../controllers/admin.controller"
import { mockReq, mockRes } from "../test-helpers"

const userServiceMocks = require("../../../services/user.service").__mocks as {
createUserAsAdmin: jest.Mock
getAllUsersPaginated: jest.Mock
getUserById: jest.Mock
updateUserById: jest.Mock
deleteUserById: jest.Mock
}

describe("AdminUsersController (unit)", () => {
const controller = new AdminUsersController()

const validAdminBody = {
 name: "Admin User",
 email: "a@test.com",
 contact: "9812345678",
 address: "Kathmandu",
 password: "Password@123",
 confirmPassword: "Password@123",
 role: "admin",
}

beforeEach(() => {
 jest.clearAllMocks()
})

describe("createUser", () => {
 it("returns 400 when DTO invalid", async () => {
   const req = mockReq({ body: {} })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(400)
   expect(userServiceMocks.createUserAsAdmin).not.toHaveBeenCalled()
 })

 it("creates user and strips password (plain object)", async () => {
   userServiceMocks.createUserAsAdmin.mockResolvedValue({
     _id: "1",
     email: "a@test.com",
     password: "secret",
   })

   const req = mockReq({ body: validAdminBody })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(userServiceMocks.createUserAsAdmin).toHaveBeenCalled()
   expect(res.status).toHaveBeenCalledWith(201)

   const payload = (res.json as any).mock.calls[0][0]
   expect(payload.data.password).toBeUndefined()
   expect(payload.data.email).toBe("a@test.com")
 })

 it("creates user and strips password (mongoose-like toObject)", async () => {
   userServiceMocks.createUserAsAdmin.mockResolvedValue({
     toObject: () => ({
       _id: "2",
       email: "b@test.com",
       password: "secret",
     }),
   })

   const req = mockReq({
     body: { ...validAdminBody, email: "b@test.com", role: "user" },
   })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(userServiceMocks.createUserAsAdmin).toHaveBeenCalled()
   expect(res.status).toHaveBeenCalledWith(201)

   const payload = (res.json as any).mock.calls[0][0]
   expect(payload.data.password).toBeUndefined()
   expect(payload.data.email).toBe("b@test.com")
 })

 it("passes multer filename as profile_picture when file exists", async () => {
   userServiceMocks.createUserAsAdmin.mockResolvedValue({
     _id: "3",
     email: "c@test.com",
     password: "x",
   })

   const req = mockReq({
     body: { ...validAdminBody, email: "c@test.com", role: "user" },
     file: { filename: "pic.png" },
   })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(userServiceMocks.createUserAsAdmin).toHaveBeenCalledWith(
     expect.objectContaining({ profile_picture: "pic.png" })
   )
   expect(res.status).toHaveBeenCalledWith(201)
 })

 it("returns error.statusCode when service throws", async () => {
   userServiceMocks.createUserAsAdmin.mockRejectedValue({
     statusCode: 409,
     message: "Duplicate",
   })

   const req = mockReq({
     body: { ...validAdminBody, email: "dup@test.com", role: "user" },
   })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(userServiceMocks.createUserAsAdmin).toHaveBeenCalled()
   expect(res.status).toHaveBeenCalledWith(409)
 })

 it("returns 500 default when service throws unknown", async () => {
   userServiceMocks.createUserAsAdmin.mockRejectedValue(new Error("Boom"))

   const req = mockReq({
     body: { ...validAdminBody, email: "boom@test.com", role: "user" },
   })
   const res = mockRes()

   await controller.createUser(req as any, res as any)

   expect(userServiceMocks.createUserAsAdmin).toHaveBeenCalled()
   expect(res.status).toHaveBeenCalledWith(500)
 })
})

describe("getAllUsers", () => {
 it("uses default page=1, limit=10, empty search", async () => {
   userServiceMocks.getAllUsersPaginated.mockResolvedValue({
     users: [{ email: "a@test.com", password: "x" }],
     pagination: { total: 1, totalPages: 1, page: 1, limit: 10 },
   })

   const req = mockReq({ query: {} })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(userServiceMocks.getAllUsersPaginated).toHaveBeenCalledWith({
     page: 1,
     limit: 10,
     search: "",
   })

   const payload = (res.json as any).mock.calls[0][0]
   expect(payload.data[0].password).toBeUndefined()
   expect(res.status).toHaveBeenCalledWith(200)
 })

 it("coerces page min 1", async () => {
   userServiceMocks.getAllUsersPaginated.mockResolvedValue({
     users: [],
     pagination: {},
   })

   const req = mockReq({ query: { page: "0", limit: "10" } })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(userServiceMocks.getAllUsersPaginated).toHaveBeenCalledWith(
     expect.objectContaining({ page: 1 })
   )
 })

 it("caps limit max 50", async () => {
   userServiceMocks.getAllUsersPaginated.mockResolvedValue({
     users: [],
     pagination: {},
   })

   const req = mockReq({ query: { page: "1", limit: "500" } })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(userServiceMocks.getAllUsersPaginated).toHaveBeenCalledWith(
     expect.objectContaining({ limit: 50 })
   )
 })

 it("forces limit min 1", async () => {
   userServiceMocks.getAllUsersPaginated.mockResolvedValue({
     users: [],
     pagination: {},
   })

   const req = mockReq({ query: { page: "1", limit: "0" } })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(userServiceMocks.getAllUsersPaginated).toHaveBeenCalledWith(
     expect.objectContaining({ limit: 1 })
   )
 })

 it("trims search string", async () => {
   userServiceMocks.getAllUsersPaginated.mockResolvedValue({
     users: [],
     pagination: {},
   })

   const req = mockReq({ query: { search: "  abc  " } })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(userServiceMocks.getAllUsersPaginated).toHaveBeenCalledWith(
     expect.objectContaining({ search: "abc" })
   )
 })

 it("returns error.statusCode when service throws", async () => {
   userServiceMocks.getAllUsersPaginated.mockRejectedValue({
     statusCode: 500,
     message: "Fail",
   })

   const req = mockReq({ query: {} })
   const res = mockRes()

   await controller.getAllUsers(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(500)
 })
})

describe("getUserById", () => {
 it("returns 200 and strips password", async () => {
   userServiceMocks.getUserById.mockResolvedValue({
     _id: "1",
     email: "x@test.com",
     password: "secret",
   })

   const req = mockReq({ params: { id: "1" } })
   const res = mockRes()

   await controller.getUserById(req as any, res as any)

   const payload = (res.json as any).mock.calls[0][0]
   expect(payload.data.password).toBeUndefined()
   expect(res.status).toHaveBeenCalledWith(200)
 })

 it("returns error.statusCode when service throws", async () => {
   userServiceMocks.getUserById.mockRejectedValue({
     statusCode: 404,
     message: "Not found",
   })

   const req = mockReq({ params: { id: "404" } })
   const res = mockRes()

   await controller.getUserById(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(404)
 })
})

describe("updateUser", () => {
 it("returns 400 when no valid fields to update", async () => {
   const req = mockReq({ params: { id: "1" }, body: { name: "" } })
   const res = mockRes()

   await controller.updateUser(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(400)
   expect(userServiceMocks.updateUserById).not.toHaveBeenCalled()
 })

 it("adds profile_picture when file exists", async () => {
   userServiceMocks.updateUserById.mockResolvedValue({
     _id: "1",
     email: "a@test.com",
     password: "x",
     profile_picture: "p.png",
   })

   const req = mockReq({
     params: { id: "1" },
     body: { name: "Updated" },
     file: { filename: "p.png" },
   })
   const res = mockRes()

   await controller.updateUser(req as any, res as any)

   expect(userServiceMocks.updateUserById).toHaveBeenCalledWith(
     "1",
     expect.objectContaining({ name: "Updated", profile_picture: "p.png" })
   )
   expect(res.status).toHaveBeenCalledWith(200)
 })

 it("removes empty-string fields before update", async () => {
   userServiceMocks.updateUserById.mockResolvedValue({
     _id: "1",
     email: "a@test.com",
     password: "x",
   })

   const req = mockReq({
     params: { id: "1" },
     body: { name: "N", address: "" },
   })
   const res = mockRes()

   await controller.updateUser(req as any, res as any)

   expect(userServiceMocks.updateUserById).toHaveBeenCalledWith(
     "1",
     expect.not.objectContaining({ address: "" })
   )
 })

 it("returns error.statusCode when service throws", async () => {
   userServiceMocks.updateUserById.mockRejectedValue({
     statusCode: 403,
     message: "Forbidden",
   })

   const req = mockReq({ params: { id: "1" }, body: { name: "X" } })
   const res = mockRes()

   await controller.updateUser(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(403)
 })
})

describe("deleteUser", () => {
 it("returns 200 when deleted", async () => {
   userServiceMocks.deleteUserById.mockResolvedValue(undefined)

   const req = mockReq({ params: { id: "1" } })
   const res = mockRes()

   await controller.deleteUser(req as any, res as any)

   expect(userServiceMocks.deleteUserById).toHaveBeenCalledWith("1")
   expect(res.status).toHaveBeenCalledWith(200)
 })

 it("returns error.statusCode when service throws", async () => {
   userServiceMocks.deleteUserById.mockRejectedValue({
     statusCode: 404,
     message: "Not found",
   })

   const req = mockReq({ params: { id: "404" } })
   const res = mockRes()

   await controller.deleteUser(req as any, res as any)

   expect(res.status).toHaveBeenCalledWith(404)
 })
})
})