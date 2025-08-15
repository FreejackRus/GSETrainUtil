-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('draft', 'completed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'engineer');

-- CreateEnum
CREATE TYPE "EquipmentPhotoType" AS ENUM ('equipment', 'serial', 'mac');

-- CreateEnum
CREATE TYPE "CarriagePhotoType" AS ENUM ('carriage', 'equipment');

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'draft',
    "currentLocationId" INTEGER,
    "performerId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_trains" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "trainId" INTEGER NOT NULL,

    CONSTRAINT "request_trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_carriages" (
    "id" SERIAL NOT NULL,
    "requestTrainId" INTEGER NOT NULL,
    "carriageId" INTEGER NOT NULL,

    CONSTRAINT "request_carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_equipment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "requestCarriageId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "typeWorkId" INTEGER NOT NULL,

    CONSTRAINT "request_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_equipment_photos" (
    "id" SERIAL NOT NULL,
    "requestEquipmentId" INTEGER NOT NULL,
    "photoType" "EquipmentPhotoType" NOT NULL,
    "photoPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_equipment_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_carriage_photos" (
    "id" SERIAL NOT NULL,
    "requestCarriageId" INTEGER NOT NULL,
    "photoType" "CarriagePhotoType" NOT NULL,
    "photoPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_carriage_photos_pkey" PRIMARY KEY ("id")
);

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

    CONSTRAINT "carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "lastService" TIMESTAMP(3),
    "carriageId" INTEGER,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "work_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "performers_pkey" PRIMARY KEY ("id")
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
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_trains_requestId_trainId_key" ON "request_trains"("requestId", "trainId");

-- CreateIndex
CREATE UNIQUE INDEX "request_carriages_requestTrainId_carriageId_key" ON "request_carriages"("requestTrainId", "carriageId");

-- CreateIndex
CREATE INDEX "request_equipment_requestId_idx" ON "request_equipment"("requestId");

-- CreateIndex
CREATE INDEX "request_equipment_requestCarriageId_idx" ON "request_equipment"("requestCarriageId");

-- CreateIndex
CREATE UNIQUE INDEX "request_equipment_requestId_equipmentId_typeWorkId_key" ON "request_equipment"("requestId", "equipmentId", "typeWorkId");

-- CreateIndex
CREATE INDEX "request_equipment_photos_requestEquipmentId_photoType_idx" ON "request_equipment_photos"("requestEquipmentId", "photoType");

-- CreateIndex
CREATE INDEX "request_carriage_photos_requestCarriageId_photoType_idx" ON "request_carriage_photos"("requestCarriageId", "photoType");

-- CreateIndex
CREATE UNIQUE INDEX "trains_number_key" ON "trains"("number");

-- CreateIndex
CREATE UNIQUE INDEX "carriages_number_key" ON "carriages"("number");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serialNumber_key" ON "equipment"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_macAddress_key" ON "equipment"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "work_types_name_key" ON "work_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "performers_name_key" ON "performers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "current_locations_name_key" ON "current_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "current_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "performers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_trains" ADD CONSTRAINT "request_trains_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_trains" ADD CONSTRAINT "request_trains_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_carriages" ADD CONSTRAINT "request_carriages_requestTrainId_fkey" FOREIGN KEY ("requestTrainId") REFERENCES "request_trains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_carriages" ADD CONSTRAINT "request_carriages_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_requestCarriageId_fkey" FOREIGN KEY ("requestCarriageId") REFERENCES "request_carriages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "work_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment_photos" ADD CONSTRAINT "request_equipment_photos_requestEquipmentId_fkey" FOREIGN KEY ("requestEquipmentId") REFERENCES "request_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_carriage_photos" ADD CONSTRAINT "request_carriage_photos_requestCarriageId_fkey" FOREIGN KEY ("requestCarriageId") REFERENCES "request_carriages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
