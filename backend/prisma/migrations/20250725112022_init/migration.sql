-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'engineer');

-- CreateTable
CREATE TABLE "requestsTechnicalWorkLog" (
    "id" SERIAL NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "typeWorkId" INTEGER NOT NULL,
    "trainNumberId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "countEquipment" INTEGER NOT NULL,
    "completedJobId" INTEGER NOT NULL,
    "currentLocationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "requestsTechnicalWorkLog_pkey" PRIMARY KEY ("id")
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
    "numberWagon" INTEGER NOT NULL,

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
    "role" "Role" NOT NULL DEFAULT 'admin',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "typeWork_typeWork_key" ON "typeWork"("typeWork");

-- CreateIndex
CREATE UNIQUE INDEX "trainNumber_trainNumber_key" ON "trainNumber"("trainNumber");

-- CreateIndex
CREATE UNIQUE INDEX "completedJob_completedJob_key" ON "completedJob"("completedJob");

-- CreateIndex
CREATE UNIQUE INDEX "currentLocation_currentLocation_key" ON "currentLocation"("currentLocation");

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "typeWork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_trainNumberId_fkey" FOREIGN KEY ("trainNumberId") REFERENCES "trainNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_completedJobId_fkey" FOREIGN KEY ("completedJobId") REFERENCES "completedJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "currentLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requestsTechnicalWorkLog" ADD CONSTRAINT "requestsTechnicalWorkLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_typeWagonsId_fkey" FOREIGN KEY ("typeWagonsId") REFERENCES "typeWagons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_numberWagonId_fkey" FOREIGN KEY ("numberWagonId") REFERENCES "numberWagons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
