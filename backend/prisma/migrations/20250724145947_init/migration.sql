/*
  Warnings:

  - A unique constraint covering the columns `[typeWork]` on the table `typeWork` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeWorkId` to the `typeWork` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "typeWork" DROP CONSTRAINT "typeWork_id_fkey";

-- AlterTable
ALTER TABLE "typeWork" ADD COLUMN     "typeWorkId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "typeWork_typeWork_key" ON "typeWork"("typeWork");

-- AddForeignKey
ALTER TABLE "typeWork" ADD CONSTRAINT "typeWork_typeWorkId_fkey" FOREIGN KEY ("typeWorkId") REFERENCES "technicalWorkLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
