/*
  Warnings:

  - You are about to drop the column `mac` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `numberWagonId` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `snNumber` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `typeWagonsId` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `carriageNumber` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `carriagePhoto` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `carriageType` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `completedJob` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocation` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `finalPhoto` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `generalPhoto` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `trainNumber` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `typeWork` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `userRole` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `completedJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `currentLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `numberWagons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requestEquipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trainNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typeWagons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typeWork` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[applicationNumber]` on the table `requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carriageId` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carriageId` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedJobId` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countEquipment` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentLocationId` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentId` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainId` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeWorkId` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_numberWagonId_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_typeWagonsId_fkey";

-- DropForeignKey
ALTER TABLE "requestEquipment" DROP CONSTRAINT "requestEquipment_requestId_fkey";

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "mac",
DROP COLUMN "numberWagonId",
DROP COLUMN "photo",
DROP COLUMN "snNumber",
DROP COLUMN "typeWagonsId",
ADD COLUMN     "carriageId" INTEGER NOT NULL,
ADD COLUMN     "macAddress" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ALTER COLUMN "lastService" DROP NOT NULL;

-- AlterTable
ALTER TABLE "requests" DROP COLUMN "carriageNumber",
DROP COLUMN "carriagePhoto",
DROP COLUMN "carriageType",
DROP COLUMN "completedJob",
DROP COLUMN "currentLocation",
DROP COLUMN "equipment",
DROP COLUMN "finalPhoto",
DROP COLUMN "generalPhoto",
DROP COLUMN "trainNumber",
DROP COLUMN "typeWork",
DROP COLUMN "userName",
DROP COLUMN "userRole",
ADD COLUMN     "carriageId" INTEGER NOT NULL,
ADD COLUMN     "completedJobId" INTEGER NOT NULL,
ADD COLUMN     "countEquipment" INTEGER NOT NULL,
ADD COLUMN     "currentLocationId" INTEGER NOT NULL,
ADD COLUMN     "equipmentId" INTEGER NOT NULL,
ADD COLUMN     "trainId" INTEGER NOT NULL,
ADD COLUMN     "typeWorkId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "completedJob";

-- DropTable
DROP TABLE "currentLocation";

-- DropTable
DROP TABLE "numberWagons";

-- DropTable
DROP TABLE "requestEquipment";

-- DropTable
DROP TABLE "trainNumber";

-- DropTable
DROP TABLE "typeWagons";

-- DropTable
DROP TABLE "typeWork";

-- CreateTable
CREATE TABLE "trains" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriages" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trainId" INTEGER NOT NULL,

    CONSTRAINT "carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_photos" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "photoType" TEXT NOT NULL,
    "photoPath" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_work" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_jobs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "completed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "current_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trains_number_key" ON "trains"("number");

-- CreateIndex
CREATE UNIQUE INDEX "carriages_number_trainId_key" ON "carriages"("number", "trainId");

-- CreateIndex
CREATE UNIQUE INDEX "type_work_name_key" ON "type_work"("name");

-- CreateIndex
CREATE UNIQUE INDEX "completed_jobs_name_key" ON "completed_jobs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "current_locations_name_key" ON "current_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "requests_applicationNumber_key" ON "requests"("applicationNumber");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "type_work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_completedJobId_fkey" FOREIGN KEY ("completedJobId") REFERENCES "completed_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "current_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriages" ADD CONSTRAINT "carriages_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_photos" ADD CONSTRAINT "equipment_photos_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
