import { VehicleRepository } from "../../../repositories/vehicle.repository"
import { VehicleModel } from "../../../models/vehicle.model"

jest.mock("../../../models/vehicle.model", () => ({
  VehicleModel: {
    create: jest.fn(),
    find: jest.fn(() => ({ sort: jest.fn() })),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

describe("VehicleRepository (unit)", () => {
  const repo = new VehicleRepository()

  it("create calls VehicleModel.create", async () => {
    ;(VehicleModel.create as any).mockResolvedValue({ _id: "1" })
    const r = await repo.create({ name: "A" })
    expect(VehicleModel.create).toHaveBeenCalledWith({ name: "A" })
    expect(r._id).toBe("1")
  })

  it("findAll uses find(filter).sort(createdAt:-1)", async () => {
    const sortMock = jest.fn().mockResolvedValue([])
    ;(VehicleModel.find as any).mockReturnValue({ sort: sortMock })
    await repo.findAll({ isActive: true })
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
  })

  it("updateById uses new:true", async () => {
    await repo.updateById("id", { name: "X" })
    expect(VehicleModel.findByIdAndUpdate).toHaveBeenCalledWith("id", { name: "X" }, { new: true })
  })
})