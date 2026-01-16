import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { CarModel } from "../models/car.model";
import { config } from "../config";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await mongoose.connect(config.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await UserModel.deleteMany({});
    await CarModel.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const testUser = await UserModel.create({
      name: "John Doe",
      email: "john@wheels.com",
      contact: "+977 9801234567",
      address: "Kathmandu, Nepal",
      password: hashedPassword,
      role: "user"
    });

    console.log(`✅ Created test user: ${testUser.email}`);

    // Create sample cars
    const sampleCars = [
      {
        make: "Toyota",
        model: "Camry",
        year: 2022,
        licensePlate: "BA-10-P-1234",
        fuelType: "Petrol",
        boughtDate: new Date("2023-05-15"),
        owner: testUser._id
      },
      {
        make: "Honda",
        model: "Civic",
        year: 2021,
        licensePlate: "BA-10-P-5678",
        fuelType: "Petrol",
        boughtDate: new Date("2022-08-20"),
        owner: testUser._id
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        licensePlate: "BA-10-P-9012",
        fuelType: "Electric",
        boughtDate: new Date("2023-12-10"),
        owner: testUser._id
      },
      {
        make: "Ford",
        model: "F-150",
        year: 2020,
        licensePlate: "BA-10-P-3456",
        fuelType: "Diesel",
        boughtDate: new Date("2021-03-10"),
        owner: testUser._id
      }
    ];

    const createdCars = await CarModel.insertMany(sampleCars);
    console.log(`✅ Created ${createdCars.length} sample cars`);

    // Display summary
    console.log("\n📊 SEEDING COMPLETE");
    console.log("==================");
    console.log(`👤 Test User: ${testUser.email} | Password: password123`);
    console.log(`🚗 Cars created:`);
    createdCars.forEach((car, index) => {
      console.log(`   ${index + 1}. ${car.make} ${car.model} (${car.licensePlate})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };