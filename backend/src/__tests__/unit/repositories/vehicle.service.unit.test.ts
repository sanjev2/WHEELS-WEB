import { VehicleService } from "../../../services/vehicle.service"
import { HttpError } from "../../../errors/http-error"
import { VehicleRepository } from "../../../repositories/vehicle.repository"

jest.mock("../../../repositories/vehicle.repository", () => {
  const mocks = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  }
  return {
    __esModule: true,
    VehicleRepository: jest.fn().mockImplementation(() => mocks),
    __mocks: mocks,
  }
})

const repoMocks = require("../../../repositories/vehicle.repository").__mocks as {
  create: jest.Mock
  findAll: jest.Mock
  updateById: jest.Mock
  deleteById: jest.Mock
}

describe("VehicleService (unit)", () => {
  const service = new VehicleService()

  beforeEach(() => jest.clearAllMocks())

  it("createVehicle defaults isActive=true", async () => {
    repoMocks.create.mockResolvedValue({ _id: "1" })
    await service.createVehicle({ name: "A" })
    expect(repoMocks.create).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }))
  })

  it("getPublicVehicles filters isActive and category", async () => {
    repoMocks.findAll.mockResolvedValue([])
    await service.getPublicVehicles("SUV")
    expect(repoMocks.findAll).toHaveBeenCalledWith({ isActive: true, category: "SUV" })
  })

  it("updateVehicle throws 404 when repo returns null", async () => {
    repoMocks.updateById.mockResolvedValue(null)
    await expect(service.updateVehicle("1", { name: "X" })).rejects.toBeInstanceOf(HttpError)
  })

  it("deleteVehicle throws 404 when repo returns null", async () => {
    repoMocks.deleteById.mockResolvedValue(null)
    await expect(service.deleteVehicle("1")).rejects.toBeInstanceOf(HttpError)
  })
})