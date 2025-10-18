/*
  Warnings:

  - You are about to drop the column `images` on the `DailyActivity` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `DailyLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyActivity" DROP COLUMN "images",
ADD COLUMN     "files" TEXT[];

-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "images",
ADD COLUMN     "files" TEXT[];
