-- CreateTable
CREATE TABLE "technicalWorkLog" (
    "id" SERIAL NOT NULL,
    "dataWork" TIMESTAMP(3) NOT NULL,
    "applicationNumber" INTEGER NOT NULL,
    "typeWork" TEXT NOT NULL,
    "trainNumber" TEXT NOT NULL,
    "typeCarriage" TEXT NOT NULL,
    "carriageNumber" TEXT NOT NULL,
    "equipment" INTEGER NOT NULL,
    "snEquipment" TEXT NOT NULL,

    CONSTRAINT "technicalWorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicationNumber" (
    "id" SERIAL NOT NULL,
    "applicationNumber" INTEGER NOT NULL,

    CONSTRAINT "applicationNumber_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "typeCarriage" (
    "id" SERIAL NOT NULL,
    "typeCarriage" TEXT NOT NULL,

    CONSTRAINT "typeCarriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriageNumber" (
    "id" SERIAL NOT NULL,
    "carriageNumber" TEXT NOT NULL,

    CONSTRAINT "carriageNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "equipment" TEXT NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snEquipment" (
    "id" SERIAL NOT NULL,
    "snEquipment" TEXT NOT NULL,

    CONSTRAINT "snEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macAddress" (
    "id" SERIAL NOT NULL,
    "macAddress" TEXT NOT NULL,

    CONSTRAINT "macAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countEquipment" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "countEquipment_pkey" PRIMARY KEY ("id")
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
