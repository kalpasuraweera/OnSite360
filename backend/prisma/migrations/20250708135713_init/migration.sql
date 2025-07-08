/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `RFI` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToIds` on the `RFI` table. All the data in the column will be lost.
  - You are about to drop the column `requestedBy` on the `RFI` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RFI" DROP COLUMN "assignedTo",
DROP COLUMN "assignedToIds",
DROP COLUMN "requestedBy";
