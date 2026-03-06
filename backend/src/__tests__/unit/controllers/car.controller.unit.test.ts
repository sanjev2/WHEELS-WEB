jest.mock("../../../models/car.model", () => {
  const mocks = {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
  }
  return { __esModule: true, __mocks: mocks, CarModel: mocks }
})

import { CarController } from "../../../controllers/car.controller"
import { mockReq, mockRes } from "../test-helpers"

const carModelMocks = require("../../../models/car.model").__mocks as {
  create: jest.Mock
  find: jest.Mock
  findOneAndDelete: jest.Mock
}

describe("CarController (unit)", () => {
  const controller = new CarController()

  beforeEach(() => jest.clearAllMocks())

  describe("createCar", () => {
    it("401 when no userId", async () => {
      const req = mockReq({ user: undefined })
      const res = mockRes()
      await controller.createCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it("400 when required fields missing", async () => {
      const req = mockReq({ user: { userId: "u1" }, body: { make: "T" } })
      const res = mockRes()
      await controller.createCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it("400 when category invalid", async () => {
      const req = mockReq({
        user: { userId: "u1" },
        body: {
          make: "T",
          model: "X",
          year: 2020,
          licensePlate: "ba 1",
          category: "TRUCK",
        },
      })
      const res = mockRes()
      await controller.createCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it("201 when valid; license plate uppercased; fuel defaults Petrol", async () => {
      carModelMocks.create.mockResolvedValue({ _id: "c1" })

      const req = mockReq({
        user: { userId: "u1" },
        body: {
          make: " Toyota ",
          model: " Vitz ",
          year: 2020,
          licensePlate: "ba 1 pa 1234",
          category: "SUV",
        },
      })
      const res = mockRes()

      await controller.createCar(req as any, res as any)

      expect(carModelMocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          make: "Toyota",
          model: "Vitz",
          year: 2020,
          licensePlate: "BA 1 PA 1234",
          fuelType: "Petrol",
          owner: "u1",
          category: "SUV",
        })
      )
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it("handles duplicate plate (error.code=11000) => 400", async () => {
      carModelMocks.create.mockRejectedValue({ code: 11000 })
      const req = mockReq({
        user: { userId: "u1" },
        body: {
          make: "T",
          model: "X",
          year: 2020,
          licensePlate: "BA",
          category: "SUV",
        },
      })
      const res = mockRes()

      await controller.createCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it("handles generic error => 500", async () => {
      carModelMocks.create.mockRejectedValue(new Error("Boom"))
      const req = mockReq({
        user: { userId: "u1" },
        body: {
          make: "T",
          model: "X",
          year: 2020,
          licensePlate: "BA",
          category: "SUV",
        },
      })
      const res = mockRes()

      await controller.createCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe("getMyCars", () => {
    it("401 when no userId", async () => {
      const req = mockReq({ user: undefined })
      const res = mockRes()
      await controller.getMyCars(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it("200 returns count and data; sorts by boughtDate desc", async () => {
      const sort = jest.fn().mockResolvedValue([{ _id: "c1" }, { _id: "c2" }])
      carModelMocks.find.mockReturnValue({ sort })

      const req = mockReq({ user: { userId: "u1" } })
      const res = mockRes()

      await controller.getMyCars(req as any, res as any)

      expect(carModelMocks.find).toHaveBeenCalledWith({ owner: "u1" })
      expect(sort).toHaveBeenCalledWith({ boughtDate: -1 })
      expect(res.status).toHaveBeenCalledWith(200)

      const payload = (res.json as any).mock.calls[0][0]
      expect(payload.count).toBe(2)
      expect(payload.data.length).toBe(2)
    })

    it("500 on error", async () => {
      carModelMocks.find.mockImplementation(() => {
        throw new Error("Fail")
      })
      const req = mockReq({ user: { userId: "u1" } })
      const res = mockRes()

      await controller.getMyCars(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe("deleteCar", () => {
    it("401 when no userId", async () => {
      const req = mockReq({ user: undefined, params: { id: "c1" } })
      const res = mockRes()

      await controller.deleteCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it("404 when car not found", async () => {
      carModelMocks.findOneAndDelete.mockResolvedValue(null)
      const req = mockReq({ user: { userId: "u1" }, params: { id: "c1" } })
      const res = mockRes()

      await controller.deleteCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it("200 when deleted", async () => {
      carModelMocks.findOneAndDelete.mockResolvedValue({ _id: "c1" })
      const req = mockReq({ user: { userId: "u1" }, params: { id: "c1" } })
      const res = mockRes()

      await controller.deleteCar(req as any, res as any)

      expect(carModelMocks.findOneAndDelete).toHaveBeenCalledWith({
        _id: "c1",
        owner: "u1",
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it("500 on error", async () => {
      carModelMocks.findOneAndDelete.mockRejectedValue(new Error("Fail"))
      const req = mockReq({ user: { userId: "u1" }, params: { id: "c1" } })
      const res = mockRes()

      await controller.deleteCar(req as any, res as any)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})