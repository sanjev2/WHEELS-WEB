import axios from "axios";
import colors from "colors";

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let testUserId = "";

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: [] as string[]
};

const logTest = (name: string, success: boolean, error?: any) => {
  if (success) {
    console.log(`✅ ${name}`.green);
    results.passed++;
  } else {
    console.log(`❌ ${name}`.red);
    results.failed++;
    if (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.log(`   Error: ${errorMsg}`.yellow);
      results.errors.push(`${name}: ${errorMsg}`);
    }
  }
};

const runTests = async () => {
  console.log("🚗 Testing Wheels Backend API".cyan.bold);
  console.log("=============================\n");

  try {
    // 1. TEST SIGNUP
    console.log("1. Testing User Signup...".cyan);
    try {
      const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: "Test User",
        email: "test@wheels.com",
        password: "password123",
        contact: "+977 9800000000",
        address: "Test Address"
      });
      logTest("POST /api/auth/register - Signup", true);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes("already exists")) {
        logTest("POST /api/auth/register - Signup", true); // User already exists is okay
      } else {
        logTest("POST /api/auth/register - Signup", false, error);
      }
    }

    // 2. TEST LOGIN
    console.log("\n2. Testing User Login...".cyan);
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: "test@wheels.com",
        password: "password123"
      });
      
      authToken = loginRes.data.token;
      testUserId = loginRes.data.data._id;
      
      logTest("POST /api/auth/login - Login", true);
      console.log(`   Token received: ${authToken.substring(0, 20)}...`.gray);
    } catch (error) {
      logTest("POST /api/auth/login - Login", false, error);
    }

    // 3. TEST CREATE CAR (Protected)
    console.log("\n3. Testing Car Creation...".cyan);
    if (authToken) {
      try {
        const carRes = await axios.post(
          `${BASE_URL}/cars`,
          {
            make: "Test Make",
            model: "Test Model",
            year: 2024,
            licensePlate: "TEST-001",
            fuelType: "Petrol",
            boughtDate: new Date().toISOString()
          },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        logTest("POST /api/cars - Create Car", true);
      } catch (error) {
        logTest("POST /api/cars - Create Car", false, error);
      }
    }

    // 4. TEST GET USER'S CARS
    console.log("\n4. Testing Get User's Cars...".cyan);
    if (authToken) {
      try {
        const carsRes = await axios.get(`${BASE_URL}/cars`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        logTest("GET /api/cars - Get Cars", true);
        console.log(`   Found ${carsRes.data.count} cars`.gray);
      } catch (error) {
        logTest("GET /api/cars - Get Cars", false, error);
      }
    }

    // 5. TEST HEALTH ENDPOINT
    console.log("\n5. Testing Health Check...".cyan);
    try {
      const healthRes = await axios.get("http://localhost:5000/health");
      logTest("GET /health - Health Check", true);
    } catch (error) {
      logTest("GET /health - Health Check", false, error);
    }

  } catch (error) {
    console.error("Fatal error during testing:".red, error);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY".cyan.bold);
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${results.passed}`.green);
  console.log(`❌ Failed: ${results.failed}`.red);
  
  const total = results.passed + results.failed;
  const successRate = total > 0 ? (results.passed / total) * 100 : 0;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log("\n❌ Errors:".red);
    results.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`.yellow);
    });
  }
  
  console.log("\n" + "=".repeat(50));
  process.exit(results.failed > 0 ? 1 : 0);
};

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

export { runTests };