/*
  Warnings:

  - You are about to drop the `_ProjectToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectToUser" DROP CONSTRAINT "_ProjectToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToUser" DROP CONSTRAINT "_ProjectToUser_B_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "featuredImageUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "squareFeet" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "_ProjectToUser";

-- CreateTable
CREATE TABLE "UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectRole" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'Read',
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workSchedule" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "emergencyContact" TEXT,
    "notes" TEXT,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProject_userId_projectId_key" ON "UserProject"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
