/*
  Warnings:

  - You are about to drop the column `stepPhotos` on the `requestsTechnicalWorkLog` table. All the data in the column will be lost.
  - Added the required column `carriageNumber` to the `requestsTechnicalWorkLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "requestsTechnicalWorkLog" DROP COLUMN "stepPhotos",
ADD COLUMN     "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "carriageNumber" TEXT NOT NULL,
ADD COLUMN     "carriagePhoto" TEXT,
ADD COLUMN     "equipmentPhoto" TEXT,
ADD COLUMN     "generalPhoto" TEXT,
ADD COLUMN     "macPhoto" TEXT,
ADD COLUMN     "serialPhoto" TEXT,
ALTER COLUMN "finalPhoto" DROP NOT NULL;
