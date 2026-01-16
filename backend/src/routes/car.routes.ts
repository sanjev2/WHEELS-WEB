import express from 'express';
import { CarController } from '../controllers/car.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const carController = new CarController();

// ALL CAR ROUTES REQUIRE AUTH TOKEN
router.use(authMiddleware);

// POST /api/cars - Add new car
router.post('/', carController.createCar);

// GET /api/cars - Get user's cars
router.get('/', carController.getMyCars);

// DELETE /api/cars/:id - Delete a car
router.delete('/:id', carController.deleteCar);

export default router;