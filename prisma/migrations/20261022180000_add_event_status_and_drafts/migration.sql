-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'INCOMPLETE', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "missingFields" TEXT[],
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "sourceText" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "priceType" DROP NOT NULL,
ALTER COLUMN "priceType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EventOccurrence" ADD COLUMN     "placeText" TEXT,
ALTER COLUMN "placeId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");


-- Datos: los eventos que ya existen estaban visibles, así que quedan publicados
UPDATE "Event" SET "status" = 'PUBLISHED', "publishedAt" = "createdAt", "missingFields" = '{}';

-- Datos: las fechas se guardan a medianoche UTC (el front lee el día en UTC).
-- Algunas quedaron a las 03:00 UTC por cargarse con la hora local; mismo día, se normalizan.
UPDATE "EventOccurrence" SET "date" = date_trunc('day', "date") WHERE "date" <> date_trunc('day', "date");
