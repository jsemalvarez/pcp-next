/*
  Warnings:

  - The `categories` column on the `Place` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ageRanges` column on the `Place` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FREE_ENTRY', 'PAID_TICKET', 'DONATION_BASED', 'WITH_CONSUMPTION');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CIRCUS', 'MUSIC', 'WORKSHOP', 'THEATER', 'ENTERTAINMENT', 'FOOD');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('RANGE_0_2', 'RANGE_3_7', 'RANGE_8_PLUS');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('ALL_DAY', 'CULTURE', 'ENTERTAINMENT', 'FOOD', 'OUTDOORS', 'SUPERVISION');

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "categories",
ADD COLUMN     "categories" "PlaceCategory"[],
DROP COLUMN "ageRanges",
ADD COLUMN     "ageRanges" "AgeRange"[];

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "artists" TEXT,
    "photoId" TEXT,
    "bgColor" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'FREE_ENTRY',
    "activityTypes" "ActivityType"[],
    "ageRanges" "AgeRange"[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventOccurrence" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeStart" TEXT NOT NULL,
    "timeEnd" TEXT,
    "placeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventOccurrence_eventId_idx" ON "EventOccurrence"("eventId");

-- CreateIndex
CREATE INDEX "EventOccurrence_date_idx" ON "EventOccurrence"("date");

-- CreateIndex
CREATE INDEX "EventOccurrence_placeId_idx" ON "EventOccurrence"("placeId");

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD CONSTRAINT "EventOccurrence_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOccurrence" ADD CONSTRAINT "EventOccurrence_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
