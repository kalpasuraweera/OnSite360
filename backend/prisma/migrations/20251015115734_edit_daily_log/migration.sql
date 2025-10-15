-- AlterTable
ALTER TABLE "DailyActivity" ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" TEXT;
