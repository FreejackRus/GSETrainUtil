/*
  Warnings:

  - You are about to drop the column `finalPhoto` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `stepPhotos` on the `equipment` table. All the data in the column will be lost.
  - Added the required column `finalPhoto` to the `requestsTechnicalWorkLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "finalPhoto",
DROP COLUMN "stepPhotos";

-- AlterTable
ALTER TABLE "requestsTechnicalWorkLog" ADD COLUMN     "finalPhoto" TEXT NOT NULL,
ADD COLUMN     "stepPhotos" TEXT[];
