-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeWork" TEXT NOT NULL,
    "trainNumber" TEXT NOT NULL,
    "carriageType" TEXT NOT NULL,
    "carriageNumber" TEXT NOT NULL,
    "completedJob" TEXT NOT NULL,
    "currentLocation" TEXT NOT NULL,
    "carriagePhoto" TEXT,
    "generalPhoto" TEXT,
    "finalPhoto" TEXT,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "equipment" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "snNumber" TEXT,
    "mac" TEXT,
    "status" TEXT NOT NULL,
    "lastService" TIMESTAMP(3) NOT NULL,
    "typeWagonsId" INTEGER NOT NULL,
    "numberWagonId" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
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
