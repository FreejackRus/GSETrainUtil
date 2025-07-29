/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `requestEquipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "requestEquipment_requestId_key" ON "requestEquipment"("requestId");
