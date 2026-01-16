import { Request, Response } from 'express';
import { CarModel } from '../models/car.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class CarController {
  // CREATE a new car
  async createCar(req: AuthRequest, res: Response) {
    try {
      const { make, model, year, licensePlate, fuelType, boughtDate } = req.body;
      
      const newCar = await CarModel.create({
        make,
        model,
        year,
        licensePlate,
        fuelType: fuelType || 'Petrol',
        boughtDate: boughtDate || new Date(),
        owner: req.user?.userId
      });

      return res.status(201).json({
        success: true,
        message: 'Car added successfully',
        data: newCar
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'License plate already exists'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // GET all user's cars
  async getMyCars(req: AuthRequest, res: Response) {
    try {
      const cars = await CarModel.find({ owner: req.user?.userId })
        .sort({ boughtDate: -1 });

      return res.status(200).json({
        success: true,
        count: cars.length,
        data: cars
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // DELETE a car
  async deleteCar(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const car = await CarModel.findOneAndDelete({
        _id: id,
        owner: req.user?.userId
      });

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Car deleted'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}