/*
  Warnings:

  - A unique constraint covering the columns `[applicationNumber]` on the table `requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "requestEquipment_requestId_key";

-- CreateIndex
CREATE UNIQUE INDEX "requests_applicationNumber_key" ON "requests"("applicationNumber");
