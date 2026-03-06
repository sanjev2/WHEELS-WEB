import mongoose from "mongoose"
import { CarModel } from "../../../models/car.model"
import { OrderModel } from "../../../models/order.model"
import { PackageModel } from "../../../models/package.model"
import { ProviderModel } from "../../../models/provider.model"
import { UserModel } from "../../../models/user.model"
import { VehicleModel } from "../../../models/vehicle.model"

describe("Mongoose models (unit schema validation)", () => {
  beforeAll(() => {
    mongoose.set("strictQuery", true)
  })

  describe("CarModel", () => {
    it("fails when required fields missing", () => {
      const doc = new CarModel({})
      const err = doc.validateSync()
      expect(err).toBeTruthy()
    })

    it("uppercases licensePlate", () => {
      const doc = new CarModel({
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        licensePlate: "ba 1 pa 1234",
        fuelType: "Petrol",
        boughtDate: new Date(),
        category: "SUV",
        owner: new mongoose.Types.ObjectId(),
      })
      expect(doc.licensePlate).toBe("BA 1 PA 1234")
    })

    it.each(["SUV", "SEDAN", "HATCHBACK"] as const)("accepts category %s", (cat) => {
      const doc = new CarModel({
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        licensePlate: "TEST123",
        fuelType: "Petrol",
        boughtDate: new Date(),
        category: cat,
        owner: new mongoose.Types.ObjectId(),
      })
      expect(doc.validateSync()).toBeUndefined()
    })

    it("rejects invalid fuelType", () => {
      const doc = new CarModel({
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        licensePlate: "TEST123",
        fuelType: "Water" as any,
        boughtDate: new Date(),
        category: "SUV",
        owner: new mongoose.Types.ObjectId(),
      })
      expect(doc.validateSync()).toBeTruthy()
    })
  })

  describe("OrderModel", () => {
    it("defaults status=PENDING_PAYMENT", () => {
      const doc: any = new OrderModel({
        user: new mongoose.Types.ObjectId(),
        car: new mongoose.Types.ObjectId(),
        packageId: new mongoose.Types.ObjectId(),
        packageTitle: "Basic",
        category: "SUV",
        basePrice: 100,
        providerId: new mongoose.Types.ObjectId(),
        providerName: "P1",
        totalPrice: 100,
      })
      expect(doc.status).toBe("PENDING_PAYMENT")
    })

    it("defaults client=web", () => {
      const doc: any = new OrderModel({
        user: new mongoose.Types.ObjectId(),
        car: new mongoose.Types.ObjectId(),
        packageId: new mongoose.Types.ObjectId(),
        packageTitle: "Basic",
        category: "SUV",
        basePrice: 100,
        providerId: new mongoose.Types.ObjectId(),
        providerName: "P1",
        totalPrice: 100,
      })
      expect(doc.client).toBe("web")
    })

    it("rejects invalid status", () => {
      const doc: any = new OrderModel({
        user: new mongoose.Types.ObjectId(),
        car: new mongoose.Types.ObjectId(),
        packageId: new mongoose.Types.ObjectId(),
        packageTitle: "Basic",
        category: "SUV",
        basePrice: 100,
        providerId: new mongoose.Types.ObjectId(),
        providerName: "P1",
        totalPrice: 100,
        status: "HELLO" as any,
      })
      expect(doc.validateSync()).toBeTruthy()
    })
  })

  describe("PackageModel", () => {
    it("defaults isActive=true", () => {
      const doc: any = new PackageModel({
        title: "Basic",
        category: "SUV",
        price: 100,
      })
      expect(doc.isActive).toBe(true)
    })

    it("allows engineOilTypes array", () => {
      const doc: any = new PackageModel({
        title: "Basic",
        category: "SUV",
        price: 100,
        engineOilTypes: ["Synthetic", "Fully Synthetic"],
      })
      expect(doc.validateSync()).toBeUndefined()
    })
  })

  describe("ProviderModel", () => {
    it("requires openFrom/openTo/lat/lng", () => {
      const doc = new ProviderModel({ name: "P1" })
      expect(doc.validateSync()).toBeTruthy()
    })
  })

  describe("UserModel", () => {
    it("defaults role=user", () => {
      const doc: any = new UserModel({
        name: "A",
        email: "a@test.com",
        contact: "9800000000",
        address: "KTM",
        password: "hashed",
      })
      expect(doc.role).toBe("user")
    })

    it("has reset fields", () => {
      const doc: any = new UserModel({
        name: "A",
        email: "a@test.com",
        contact: "9800000000",
        address: "KTM",
        password: "hashed",
        reset_code_hash: null,
      })
      expect(doc.reset_code_hash).toBeNull()
    })
  })

  describe("VehicleModel", () => {
    it("requires category", () => {
      const doc = new VehicleModel({ name: "Sedan" })
      expect(doc.validateSync()).toBeTruthy()
    })

    it("defaults isActive=true", () => {
      const doc: any = new VehicleModel({ name: "Sedan", category: "SUV" })
      expect(doc.isActive).toBe(true)
    })
  })
})