-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeWorkId" INTEGER NOT NULL,
    "trainId" INTEGER NOT NULL,
    "carriageId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "completedJobId" INTEGER NOT NULL,
    "currentLocationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "countEquipment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
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
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "status" TEXT NOT NULL,
    "lastService" TIMESTAMP(3),
    "carriageId" INTEGER NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "requests_applicationNumber_key" ON "requests"("applicationNumber");

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
