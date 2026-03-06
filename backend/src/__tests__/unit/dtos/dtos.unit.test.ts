import { CreateUserDTO, AdminCreateUserDTO, LoginUserDTO } from "../../../dtos/user.dto"
import { CreateOrderDTO } from "../../../dtos/order.dto"
import { AdminCreatePackageDTO, AdminUpdatePackageDTO } from "../../../dtos/package.dto"
import { AdminCreateProviderDTO } from "../../../dtos/provider.dto"
import { AdminCreateVehicleDTO, AdminUpdateVehicleDTO } from "../../../dtos/vehicle.dto"

describe("DTO validation (unit)", () => {
  // ---------- LoginUserDTO ----------
  describe("LoginUserDTO", () => {
    test.each([
      [{}, false],
      [{ email: "not-email", password: "123456" }, false],
      [{ email: "a@test.com", password: "12345" }, false],
      [{ email: "a@test.com", password: "123456" }, true],
      [{ email: "a@test.com", password: "Password@123" }, true],
    ])("LoginUserDTO.safeParse(%j) => %s", (input, ok) => {
      const r = LoginUserDTO.safeParse(input)
      expect(r.success).toBe(ok)
    })
  })

  // ---------- CreateUserDTO ----------
  describe("CreateUserDTO", () => {
    // ⚠️ Adjust these 3 fields if your UserSchema is strict:
    // - contact
    // - address
    // - password rules
    const base = {
      name: "Aayusha",
      email: "a@test.com",
      contact: "9812345678",
      address: "Kathmandu",
      password: "Password@123",
      confirmPassword: "Password@123",
    }

    test("base should pass (if it fails, see printed errors)", () => {
      const r = CreateUserDTO.safeParse(base)
      if (!r.success) console.log("CreateUserDTO base error:", r.error.format())
      expect(r.success).toBe(true)
    })

    test.each([
      [{ ...base, confirmPassword: "Mismatch" }, false],
      [{ ...base, email: "bad" }, false],
      [{ ...base, password: "12345", confirmPassword: "12345" }, false],
      [{ ...base, name: "" }, false],
      [{ ...base, contact: "" }, false],
      [{ ...base, address: "" }, false],
    ])("CreateUserDTO.safeParse(%j) => %s", (input, ok) => {
      const r = CreateUserDTO.safeParse(input)
      if (!r.success && ok === true) console.log("CreateUserDTO unexpected fail:", r.error.format())
      expect(r.success).toBe(ok)
    })
  })

  // ---------- AdminCreateUserDTO ----------
  describe("AdminCreateUserDTO", () => {
    const base = {
      name: "Admin",
      email: "admin@test.com",
      contact: "9812345678",
      address: "Kathmandu",
      password: "Password@123",
      confirmPassword: "Password@123",
    }

    test("base should pass (if it fails, see printed errors)", () => {
      const r = AdminCreateUserDTO.safeParse(base)
      if (!r.success) console.log("AdminCreateUserDTO base error:", r.error.format())
      expect(r.success).toBe(true)
    })

    test.each([
      [{ ...base, role: "admin" }, true],
      [{ ...base, role: "user" }, true],
      [{ ...base, role: "superadmin" }, false],
      [{ ...base, confirmPassword: "Mismatch" }, false],
      [{ ...base, email: "bad" }, false],
    ])("AdminCreateUserDTO.safeParse(%j) => %s", (input, ok) => {
      const r = AdminCreateUserDTO.safeParse(input as any)
      if (!r.success && ok === true) console.log("AdminCreateUserDTO unexpected fail:", r.error.format())
      expect(r.success).toBe(ok)
    })
  })

  // ---------- CreateOrderDTO ----------
  describe("CreateOrderDTO", () => {
    const base = {
      carId: "c1",
      packageId: "p1",
      packageTitle: "Basic",
      category: "SUV",
      basePrice: 0,
      providerId: "pr1",
      providerName: "Garage",
      totalPrice: 0,
    }

    test.each([
      [{ ...base }, true],
      [{ ...base, carId: "" }, false],
      [{ ...base, packageId: "" }, false],
      [{ ...base, basePrice: -1 }, false],
      [{ ...base, totalPrice: -1 }, false],
      [{ ...base, durationMins: null }, true],
      [{ ...base, selectedOilType: null }, true],
      [{ ...base, selectedAddons: ["  A  ", "B"] }, true],
    ])("CreateOrderDTO.safeParse(%j) => %s", (input, ok) => {
      const r = CreateOrderDTO.safeParse(input as any)
      expect(r.success).toBe(ok)
    })
  })

  // ---------- Package DTOs ----------
  describe("Package DTOs", () => {
    const base = {
      title: "Basic",
      description: "x",
      category: "SUV",
      price: 0,
      durationMins: 10,
      engineOilTypes: ["Synthetic"],
      services: [" A ", "B", ""],
      addons: ["X", "X", "  "],
      isActive: true,
    }

    it("AdminCreatePackageDTO trims arrays and removes empty", () => {
      const r = AdminCreatePackageDTO.safeParse(base as any)
      expect(r.success).toBe(true)
      if (!r.success) return
      expect(r.data.services).toEqual(["A", "B"])
      expect(r.data.addons).toEqual(["X", "X"])
    })

    it("engineOilTypes removes duplicates", () => {
      const r = AdminCreatePackageDTO.safeParse({ ...base, engineOilTypes: ["Synthetic", "Synthetic"] } as any)
      expect(r.success).toBe(true)
      if (!r.success) return
      expect(r.data.engineOilTypes).toEqual(["Synthetic"])
    })

    test.each([
      [{ ...base }, true],
      [{ ...base, title: "" }, false],
      [{ ...base, category: "TRUCK" }, false],
      [{ ...base, price: -1 }, false],
      [{ ...base, durationMins: null }, true],
      [{ ...base, engineOilTypes: undefined }, true],
    ])("AdminCreatePackageDTO.safeParse => %s", (input, ok) => {
      const r = AdminCreatePackageDTO.safeParse(input as any)
      expect(r.success).toBe(ok)
    })

    test.each([
      [{ ...base }, true],
      [{ ...base, title: "" }, false],
      [{ ...base, category: "TRUCK" }, false],
      [{ ...base, price: -1 }, false],
      [{ ...base, durationMins: null }, true],
    ])("AdminUpdatePackageDTO.safeParse => %s", (input, ok) => {
      const r = AdminUpdatePackageDTO.safeParse(input as any)
      expect(r.success).toBe(ok)
    })
  })

  // ---------- Provider DTO ----------
  describe("AdminCreateProviderDTO", () => {
    const base = {
      name: "Garage",
      openFrom: "09:00",
      openTo: "18:00",
      lat: 27.7,
      lng: 85.3,
      categories: ["SUV"],
      isActive: true,
    }

    test.each([
      [{ ...base }, true],
      [{ ...base, name: "" }, false],
      [{ ...base, openFrom: "9:00" }, false],
      [{ ...base, openTo: "18:0" }, false],
      [{ ...base, categories: ["TRUCK"] }, false],
    ])("AdminCreateProviderDTO.safeParse(%j) => %s", (input, ok) => {
      const r = AdminCreateProviderDTO.safeParse(input as any)
      expect(r.success).toBe(ok)
    })
  })

  // ---------- Vehicle DTOs ----------
  describe("Vehicle DTOs", () => {
    test.each([
      [{ name: "Car", category: "SUV" }, true],
      [{ name: "C", category: "SUV" }, false],
      [{ name: "Car", category: "TRUCK" }, false],
      [{ name: "Car", category: "SUV", year: "2020" }, true],
    ])("AdminCreateVehicleDTO.safeParse(%j) => %s", (input, ok) => {
      const r = AdminCreateVehicleDTO.safeParse(input as any)
      expect(r.success).toBe(ok)
    })

    it("AdminUpdateVehicleDTO allows partial", () => {
      const r = AdminUpdateVehicleDTO.safeParse({ brand: "T" } as any)
      expect(r.success).toBe(true)
    })
  })
})