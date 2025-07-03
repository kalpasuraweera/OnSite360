/*
  Warnings:

  - The `accessLevel` column on the `UserProject` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserProject" DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" INTEGER NOT NULL DEFAULT 0;
