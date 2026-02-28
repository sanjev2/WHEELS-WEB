import { Response } from "express"
import { CarModel } from "../models/car.model"
import { AuthRequest } from "../middleware/auth.middleware"

type CarCategory = "SUV" | "SEDAN" | "HATCHBACK"

export class CarController {
  async createCar(req: AuthRequest, res: Response) {
    try {
      const { make, model, year, licensePlate, fuelType, boughtDate, category } = req.body

      if (!req.user?.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized (no userId in token)" })
      }

      if (!make || !model || !year || !licensePlate || !category) {
        return res.status(400).json({
          success: false,
          message: "make, model, year, licensePlate, category are required",
        })
      }

      const allowed: CarCategory[] = ["SUV", "SEDAN", "HATCHBACK"]
      if (!allowed.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "category must be SUV, SEDAN, or HATCHBACK",
        })
      }

      const newCar = await CarModel.create({
        make: String(make).trim(),
        model: String(model).trim(),
        year: Number(year),
        licensePlate: String(licensePlate).trim().toUpperCase(),
        fuelType: fuelType || "Petrol",
        boughtDate: boughtDate ? new Date(boughtDate) : new Date(),
        category,
        owner: req.user.userId,
      })

      return res.status(201).json({ success: true, message: "Car added successfully", data: newCar })
    } catch (error: any) {
      console.error("createCar ERROR:", error) // ✅ important
      if (error?.code === 11000) {
        return res.status(400).json({ success: false, message: "License plate already exists" })
      }
      return res.status(500).json({
        success: false,
        message: error?.message || "Server error",
      })
    }
  }

  async getMyCars(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized (no userId in token)" })
      }

      const cars = await CarModel.find({ owner: req.user.userId }).sort({ boughtDate: -1 })

      return res.status(200).json({ success: true, count: cars.length, data: cars })
    } catch (error: any) {
      console.error("getMyCars ERROR:", error) // ✅ important
      return res.status(500).json({
        success: false,
        message: error?.message || "Server error",
      })
    }
  }

  async deleteCar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized (no userId in token)" })
      }

      const { id } = req.params

      const car = await CarModel.findOneAndDelete({ _id: id, owner: req.user.userId })

      if (!car) return res.status(404).json({ success: false, message: "Car not found" })

      return res.status(200).json({ success: true, message: "Car deleted" })
    } catch (error: any) {
      console.error("deleteCar ERROR:", error) // ✅ important
      return res.status(500).json({
        success: false,
        message: error?.message || "Server error",
      })
    }
  }
}