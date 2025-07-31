-- CreateTable
CREATE TABLE "public"."requests" (
    "id" SERIAL NOT NULL,
    "applicationNumber" SERIAL NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "typeWorkId" INTEGER,
    "trainId" INTEGER,
    "carriageId" INTEGER,
    "completedJobId" INTEGER,
    "currentLocationId" INTEGER,
    "userId" INTEGER NOT NULL,
    "carriagePhoto" TEXT,
    "generalPhoto" TEXT,
    "finalPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_equipment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "request_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trains" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "trains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carriages" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "trainId" INTEGER NOT NULL,

    CONSTRAINT "carriages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "status" TEXT NOT NULL,
    "lastService" TIMESTAMP(3),
    "carriageId" INTEGER,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_photos" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "photoType" TEXT NOT NULL,
    "photoPath" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."type_work" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."completed_jobs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "completed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."current_locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "current_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."devices" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_applicationNumber_key" ON "public"."requests"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "request_equipment_requestId_equipmentId_key" ON "public"."request_equipment"("requestId", "equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "trains_number_key" ON "public"."trains"("number");

-- CreateIndex
CREATE UNIQUE INDEX "carriages_number_trainId_key" ON "public"."carriages"("number", "trainId");

-- CreateIndex
CREATE UNIQUE INDEX "type_work_name_key" ON "public"."type_work"("name");

-- CreateIndex
CREATE UNIQUE INDEX "completed_jobs_name_key" ON "public"."completed_jobs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "current_locations_name_key" ON "public"."current_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "public"."users"("login");

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "public"."type_work"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "public"."trains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "public"."carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_completedJobId_fkey" FOREIGN KEY ("completedJobId") REFERENCES "public"."completed_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "public"."current_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_equipment" ADD CONSTRAINT "request_equipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_equipment" ADD CONSTRAINT "request_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carriages" ADD CONSTRAINT "carriages_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "public"."trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment" ADD CONSTRAINT "equipment_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "public"."carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_photos" ADD CONSTRAINT "equipment_photos_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
