jest.mock("../../../services/package.service", () => {
  const mocks = {
    createPackage: jest.fn(),
    getAdminPackages: jest.fn(),
    updatePackage: jest.fn(),
    deletePackage: jest.fn(),
  }
  return {
    __esModule: true,
    __mocks: mocks,
    PackageService: jest.fn().mockImplementation(() => mocks),
  }
})

import { AdminPackagesController } from "../../../controllers/admin.packages.controller"
import { mockReq, mockRes } from "../test-helpers"

const packageMocks = require("../../../services/package.service").__mocks as {
  createPackage: jest.Mock
  getAdminPackages: jest.Mock
  updatePackage: jest.Mock
  deletePackage: jest.Mock
}

describe("AdminPackagesController (unit)", () => {
  const controller = new AdminPackagesController()
  beforeEach(() => jest.clearAllMocks())

  it("create returns 400 when DTO invalid", async () => {
    const req = mockReq({ body: {} })
    const res = mockRes()

    await controller.create(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(packageMocks.createPackage).not.toHaveBeenCalled()
  })

  it("create returns 201 when valid", async () => {
    packageMocks.createPackage.mockResolvedValue({ _id: "p1" })
    const req = mockReq({
      body: {
        title: "Basic",
        category: "SUV",
        price: 0,
        durationMins: 10,
      },
    })
    const res = mockRes()

    await controller.create(req as any, res as any)

    expect(packageMocks.createPackage).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it("list returns 200", async () => {
    packageMocks.getAdminPackages.mockResolvedValue([{ _id: "p1" }])

    const req = mockReq()
    const res = mockRes()

    await controller.list(req as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("update returns 400 when DTO invalid", async () => {
    const req = mockReq({ params: { id: "p1" }, body: {} })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(packageMocks.updatePackage).not.toHaveBeenCalled()
  })

  it("update returns 200 when valid", async () => {
    packageMocks.updatePackage.mockResolvedValue({ _id: "p1" })
    const req = mockReq({
      params: { id: "p1" },
      body: {
        title: "Pro",
        category: "SUV",
        price: 4500,
        durationMins: 60,
      },
    })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(packageMocks.updatePackage).toHaveBeenCalledWith("p1", expect.any(Object))
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("remove returns 200", async () => {
    packageMocks.deletePackage.mockResolvedValue(undefined)
    const req = mockReq({ params: { id: "p1" } })
    const res = mockRes()

    await controller.remove(req as any, res as any)

    expect(packageMocks.deletePackage).toHaveBeenCalledWith("p1")
    expect(res.status).toHaveBeenCalledWith(200)
  })
})