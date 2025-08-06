-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currentLocationId" INTEGER,
    "completedJobId" INTEGER,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,
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
    "requestId" INTEGER NOT NULL,
    "carriageId" INTEGER NOT NULL,
    "carriagePhoto" TEXT,

    CONSTRAINT "request_carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_equipment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "typeWorkId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "request_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_equipment_photos" (
    "id" SERIAL NOT NULL,
    "requestEquipmentId" INTEGER NOT NULL,
    "photoType" TEXT NOT NULL,
    "photoPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_equipment_photos_pkey" PRIMARY KEY ("id")
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
    "trainId" INTEGER NOT NULL,

    CONSTRAINT "carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "lastService" TIMESTAMP(3),
    "carriageId" INTEGER,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
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
    "name" TEXT NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_trains_requestId_trainId_key" ON "request_trains"("requestId", "trainId");

-- CreateIndex
CREATE UNIQUE INDEX "request_carriages_requestId_carriageId_key" ON "request_carriages"("requestId", "carriageId");

-- CreateIndex
CREATE UNIQUE INDEX "request_equipment_requestId_equipmentId_key" ON "request_equipment"("requestId", "equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "request_equipment_photos_requestEquipmentId_photoType_key" ON "request_equipment_photos"("requestEquipmentId", "photoType");

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
CREATE UNIQUE INDEX "devices_name_key" ON "devices"("name");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "current_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_completedJobId_fkey" FOREIGN KEY ("completedJobId") REFERENCES "completed_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_trains" ADD CONSTRAINT "request_trains_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_trains" ADD CONSTRAINT "request_trains_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_carriages" ADD CONSTRAINT "request_carriages_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_carriages" ADD CONSTRAINT "request_carriages_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "type_work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment_photos" ADD CONSTRAINT "request_equipment_photos_requestEquipmentId_fkey" FOREIGN KEY ("requestEquipmentId") REFERENCES "request_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriages" ADD CONSTRAINT "carriages_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
