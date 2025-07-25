/*
  Warnings:

  - Added the required column `finalPhoto` to the `equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "finalPhoto" TEXT NOT NULL,
ADD COLUMN     "stepPhotos" TEXT[];
