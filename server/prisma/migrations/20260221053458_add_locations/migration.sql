/*
  Warnings:

  - You are about to drop the column `speed` on the `VehicleLocation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VehicleOnlineStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- DropIndex
DROP INDEX "VehicleLocation_vehicleId_createdAt_idx";

-- AlterTable
ALTER TABLE "VehicleLocation" DROP COLUMN "speed",
ADD COLUMN     "speedKph" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "VehiclePresence" (
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT,
    "lastLat" DOUBLE PRECISION NOT NULL,
    "lastLng" DOUBLE PRECISION NOT NULL,
    "lastSpeedKph" DOUBLE PRECISION,
    "lastHeading" DOUBLE PRECISION,
    "lastPingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "VehicleOnlineStatus" NOT NULL DEFAULT 'ONLINE',

    CONSTRAINT "VehiclePresence_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateIndex
CREATE INDEX "VehiclePresence_lastPingAt_idx" ON "VehiclePresence"("lastPingAt");

-- CreateIndex
CREATE INDEX "VehicleLocation_vehicleId_createdAt_idx" ON "VehicleLocation"("vehicleId", "createdAt");

-- AddForeignKey
ALTER TABLE "VehiclePresence" ADD CONSTRAINT "VehiclePresence_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePresence" ADD CONSTRAINT "VehiclePresence_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
