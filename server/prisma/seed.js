const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // clean (optional)
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);

  const [manager, dispatcher, safety, finance] = await prisma.$transaction([
    prisma.user.create({
      data: { name: "Manager", email: "manager@fleetops.com", passwordHash, role: "FLEET_MANAGER" }
    }),
    prisma.user.create({
      data: { name: "Dispatcher", email: "dispatcher@fleetops.com", passwordHash, role: "DISPATCHER" }
    }),
    prisma.user.create({
      data: { name: "Safety", email: "safety@fleetops.com", passwordHash, role: "SAFETY_OFFICER" }
    }),
    prisma.user.create({
      data: { name: "Finance", email: "finance@fleetops.com", passwordHash, role: "FINANCE_ANALYST" }
    })
  ]);

  const vehicles = await prisma.vehicle.createMany({
    data: [
      { vehicleCode: "VAN-05", type: "VAN", licensePlate: "GJ01AB1234", maxCapacityKg: 500, odometerKm: 12000, acquisitionCost: 800000 },
      { vehicleCode: "TRK-01", type: "TRUCK", licensePlate: "GJ01TR0001", maxCapacityKg: 8000, odometerKm: 45000, acquisitionCost: 3500000 },
      { vehicleCode: "BIKE-02", type: "BIKE", licensePlate: "GJ01BK0002", maxCapacityKg: 50, odometerKm: 9000, acquisitionCost: 120000 }
    ]
  });

  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60);

  await prisma.driver.createMany({
    data: [
      { fullName: "Alex", licenseNumber: "LIC-1001", licenseExpiryDate: future, licenseCategory: "VAN", status: "ON_DUTY", safetyScore: 88 },
      { fullName: "John", licenseNumber: "LIC-2002", licenseExpiryDate: future, licenseCategory: "TRUCK", status: "ON_DUTY", safetyScore: 82 },
      { fullName: "Vishal", licenseNumber: "LIC-3003", licenseExpiryDate: future, licenseCategory: "BIKE", status: "ON_DUTY", safetyScore: 90 }
    ]
  });

  console.log("✅ Seed complete");
  console.log("Login users (Password@123):");
  console.log("manager@fleetops.com | dispatcher@fleetops.com | safety@fleetops.com | finance@fleetops.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
