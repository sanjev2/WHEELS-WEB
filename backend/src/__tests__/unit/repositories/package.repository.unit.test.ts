import { PackageRepository } from "../../../repositories/package.repository"
import { PackageModel } from "../../../models/package.model"

jest.mock("../../../models/package.model", () => ({
  PackageModel: {
    create: jest.fn(),
    find: jest.fn(() => ({ sort: jest.fn() })),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

describe("PackageRepository (unit)", () => {
  const repo = new PackageRepository()

  it("create calls PackageModel.create", async () => {
    ;(PackageModel.create as any).mockResolvedValue({ _id: "1" })
    const r = await repo.create({ title: "A" })
    expect(PackageModel.create).toHaveBeenCalledWith({ title: "A" })
    expect(r._id).toBe("1")
  })

  it("findAll calls find(filter).sort(createdAt:-1)", async () => {
    const sortMock = jest.fn().mockResolvedValue([])
    ;(PackageModel.find as any).mockReturnValue({ sort: sortMock })

    await repo.findAll({ isActive: true })
    expect(PackageModel.find).toHaveBeenCalledWith({ isActive: true })
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
  })



  it("updateById calls findByIdAndUpdate with new:true", async () => {
    await repo.updateById("1", { title: "B" })
    expect(PackageModel.findByIdAndUpdate).toHaveBeenCalledWith("1", { title: "B" }, { new: true })
  })

  it("deleteById calls findByIdAndDelete", async () => {
    await repo.deleteById("1")
    expect(PackageModel.findByIdAndDelete).toHaveBeenCalledWith("1")
  })
})