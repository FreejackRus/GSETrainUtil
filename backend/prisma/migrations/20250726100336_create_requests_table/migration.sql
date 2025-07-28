/*
  Warnings:

  - You are about to drop the `requestsTechnicalWorkLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_completedJobId_fkey";

-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_currentLocationId_fkey";

-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_trainNumberId_fkey";

-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_typeWorkId_fkey";

-- DropForeignKey
ALTER TABLE "requestsTechnicalWorkLog" DROP CONSTRAINT "requestsTechnicalWorkLog_userId_fkey";

-- DropTable
DROP TABLE "requestsTechnicalWorkLog";

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeWork" TEXT NOT NULL,
    "trainNumber" TEXT NOT NULL,
    "carriageType" TEXT NOT NULL,
    "carriageNumber" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "countEquipment" INTEGER NOT NULL,
    "completedJob" TEXT NOT NULL,
    "currentLocation" TEXT NOT NULL,
    "carriagePhoto" TEXT,
    "equipmentPhoto" TEXT,
    "serialPhoto" TEXT,
    "macPhoto" TEXT,
    "generalPhoto" TEXT,
    "finalPhoto" TEXT,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_applicationNumber_key" ON "requests"("applicationNumber");
