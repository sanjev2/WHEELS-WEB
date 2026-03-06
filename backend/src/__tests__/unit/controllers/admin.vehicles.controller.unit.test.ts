// src/__tests__/unit/controllers/admin.vehicles.controller.unit.test.ts

// ✅ mock must be BEFORE controller import
jest.mock("../../../services/vehicle.service", () => {
  const mocks = {
    createVehicle: jest.fn(),
    getAdminVehicles: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
  }

  return {
    __esModule: true,
    __mocks: mocks,
    VehicleService: jest.fn().mockImplementation(() => mocks),
  }
})

import { AdminVehiclesController } from "../../../controllers/admin.vehicles.controller"
import { mockReq, mockRes } from "../test-helpers"

const vehicleServiceMocks = require("../../../services/vehicle.service").__mocks as {
  createVehicle: jest.Mock
  getAdminVehicles: jest.Mock
  updateVehicle: jest.Mock
  deleteVehicle: jest.Mock
}

describe("AdminVehiclesController (unit)", () => {
  const controller = new AdminVehiclesController()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("list returns 200", async () => {
    vehicleServiceMocks.getAdminVehicles.mockResolvedValue([{ _id: "v1" }])

    const req = mockReq({})
    const res = mockRes()

    await controller.list(req as any, res as any)

    expect(vehicleServiceMocks.getAdminVehicles).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("create returns 201", async () => {
    vehicleServiceMocks.createVehicle.mockResolvedValue({ _id: "v1" })

    const req = mockReq({
      body: { name: "Car", category: "SUV", isActive: true },
    })
    const res = mockRes()

    await controller.create(req as any, res as any)

    expect(vehicleServiceMocks.createVehicle).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it("update returns 400 when invalid (empty body)", async () => {
    const req = mockReq({ params: { id: "v1" }, body: {} })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(vehicleServiceMocks.updateVehicle).not.toHaveBeenCalled()
  })

  it("update returns 200 when valid", async () => {
    vehicleServiceMocks.updateVehicle.mockResolvedValue({ _id: "v1", name: "Updated" })

    const req = mockReq({
      params: { id: "v1" },
      body: { name: "Updated" },
    })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(vehicleServiceMocks.updateVehicle).toHaveBeenCalledWith("v1", { name: "Updated" })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("remove returns 200", async () => {
    vehicleServiceMocks.deleteVehicle.mockResolvedValue(true)

    const req = mockReq({ params: { id: "v1" } })
    const res = mockRes()

    await controller.remove(req as any, res as any)

    expect(vehicleServiceMocks.deleteVehicle).toHaveBeenCalledWith("v1")
    expect(res.status).toHaveBeenCalledWith(200)
  })

  
})