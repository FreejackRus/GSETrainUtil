/*
  Warnings:

  - You are about to drop the column `carriageId` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `macAddress` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `carriageId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `completedJobId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `countEquipment` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocationId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `trainId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `typeWorkId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the `carriages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `completed_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `current_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trains` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `type_work` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `numberWagonId` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeWagonsId` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastService` on table `equipment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `carriageNumber` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carriageType` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedJob` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentLocation` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainNumber` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeWork` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userRole` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "carriages" DROP CONSTRAINT "carriages_trainId_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_carriageId_fkey";

-- DropForeignKey
ALTER TABLE "equipment_photos" DROP CONSTRAINT "equipment_photos_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_carriageId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_completedJobId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_currentLocationId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_trainId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_typeWorkId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_userId_fkey";

-- DropIndex
DROP INDEX "requests_applicationNumber_key";

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "carriageId",
DROP COLUMN "macAddress",
DROP COLUMN "serialNumber",
ADD COLUMN     "mac" TEXT,
ADD COLUMN     "numberWagonId" INTEGER NOT NULL,
ADD COLUMN     "photo" TEXT NOT NULL,
ADD COLUMN     "snNumber" TEXT,
ADD COLUMN     "typeWagonsId" INTEGER NOT NULL,
ALTER COLUMN "lastService" SET NOT NULL;

-- AlterTable
ALTER TABLE "requests" DROP COLUMN "carriageId",
DROP COLUMN "completedJobId",
DROP COLUMN "countEquipment",
DROP COLUMN "currentLocationId",
DROP COLUMN "equipmentId",
DROP COLUMN "trainId",
DROP COLUMN "typeWorkId",
ADD COLUMN     "carriageNumber" TEXT NOT NULL,
ADD COLUMN     "carriagePhoto" TEXT,
ADD COLUMN     "carriageType" TEXT NOT NULL,
ADD COLUMN     "completedJob" TEXT NOT NULL,
ADD COLUMN     "currentLocation" TEXT NOT NULL,
ADD COLUMN     "equipment" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "finalPhoto" TEXT,
ADD COLUMN     "generalPhoto" TEXT,
ADD COLUMN     "trainNumber" TEXT NOT NULL,
ADD COLUMN     "typeWork" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL,
ADD COLUMN     "userRole" TEXT NOT NULL;

-- DropTable
DROP TABLE "carriages";

-- DropTable
DROP TABLE "completed_jobs";

-- DropTable
DROP TABLE "current_locations";

-- DropTable
DROP TABLE "devices";

-- DropTable
DROP TABLE "equipment_photos";

-- DropTable
DROP TABLE "trains";

-- DropTable
DROP TABLE "type_work";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "requestEquipment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "countEquipment" INTEGER NOT NULL DEFAULT 1,
    "equipmentPhoto" TEXT,
    "serialPhoto" TEXT,
    "macPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requestEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typeWagons" (
    "id" SERIAL NOT NULL,
    "typeWagon" TEXT NOT NULL,

    CONSTRAINT "typeWagons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numberWagons" (
    "id" SERIAL NOT NULL,
    "numberWagon" TEXT NOT NULL,

    CONSTRAINT "numberWagons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typeWork" (
    "id" SERIAL NOT NULL,
    "typeWork" TEXT NOT NULL,

    CONSTRAINT "typeWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainNumber" (
    "id" SERIAL NOT NULL,
    "trainNumber" TEXT NOT NULL,

    CONSTRAINT "trainNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completedJob" (
    "id" SERIAL NOT NULL,
    "completedJob" TEXT NOT NULL,

    CONSTRAINT "completedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currentLocation" (
    "id" SERIAL NOT NULL,
    "currentLocation" TEXT NOT NULL,

    CONSTRAINT "currentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "typeWagons_typeWagon_key" ON "typeWagons"("typeWagon");

-- CreateIndex
CREATE UNIQUE INDEX "numberWagons_numberWagon_key" ON "numberWagons"("numberWagon");

-- CreateIndex
CREATE UNIQUE INDEX "typeWork_typeWork_key" ON "typeWork"("typeWork");

-- CreateIndex
CREATE UNIQUE INDEX "trainNumber_trainNumber_key" ON "trainNumber"("trainNumber");

-- CreateIndex
CREATE UNIQUE INDEX "completedJob_completedJob_key" ON "completedJob"("completedJob");

-- CreateIndex
CREATE UNIQUE INDEX "currentLocation_currentLocation_key" ON "currentLocation"("currentLocation");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- AddForeignKey
ALTER TABLE "requestEquipment" ADD CONSTRAINT "requestEquipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_typeWagonsId_fkey" FOREIGN KEY ("typeWagonsId") REFERENCES "typeWagons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_numberWagonId_fkey" FOREIGN KEY ("numberWagonId") REFERENCES "numberWagons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
