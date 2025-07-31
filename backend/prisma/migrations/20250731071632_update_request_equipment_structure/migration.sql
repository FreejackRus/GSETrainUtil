/*
  Warnings:

  - You are about to drop the column `countEquipment` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentId` on the `requests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_carriageId_fkey";

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

-- AlterTable
ALTER TABLE "equipment" ALTER COLUMN "carriageId" DROP NOT NULL;

-- AlterTable
CREATE SEQUENCE requests_applicationnumber_seq;
ALTER TABLE "requests" DROP COLUMN "countEquipment",
DROP COLUMN "equipmentId",
ADD COLUMN     "carriagePhoto" TEXT,
ADD COLUMN     "finalPhoto" TEXT,
ADD COLUMN     "generalPhoto" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ALTER COLUMN "applicationNumber" SET DEFAULT nextval('requests_applicationnumber_seq'),
ALTER COLUMN "carriageId" DROP NOT NULL,
ALTER COLUMN "completedJobId" DROP NOT NULL,
ALTER COLUMN "currentLocationId" DROP NOT NULL,
ALTER COLUMN "trainId" DROP NOT NULL,
ALTER COLUMN "typeWorkId" DROP NOT NULL;
ALTER SEQUENCE requests_applicationnumber_seq OWNED BY "requests"."applicationNumber";

-- CreateTable
CREATE TABLE "request_equipment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "request_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_equipment_requestId_equipmentId_key" ON "request_equipment"("requestId", "equipmentId");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "type_work"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_completedJobId_fkey" FOREIGN KEY ("completedJobId") REFERENCES "completed_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "current_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_equipment" ADD CONSTRAINT "request_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_carriageId_fkey" FOREIGN KEY ("carriageId") REFERENCES "carriages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
