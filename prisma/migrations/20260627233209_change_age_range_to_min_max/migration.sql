/*
  Warnings:

  - You are about to drop the column `ageRanges` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ageRanges` on the `Place` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "ageRanges",
ADD COLUMN     "ageMax" DOUBLE PRECISION,
ADD COLUMN     "ageMin" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "ageRanges",
ADD COLUMN     "ageMax" DOUBLE PRECISION,
ADD COLUMN     "ageMin" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "AgeRange";
