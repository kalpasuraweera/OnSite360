/*
  Warnings:

  - You are about to drop the column `reminders` on the `ScheduleEvent` table. All the data in the column will be lost.
  - You are about to drop the `_ScheduleEventToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `ScheduleEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ScheduleEventToUser" DROP CONSTRAINT "_ScheduleEventToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScheduleEventToUser" DROP CONSTRAINT "_ScheduleEventToUser_B_fkey";

-- AlterTable
ALTER TABLE "ScheduleEvent" DROP COLUMN "reminders",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ScheduleEventToUser";

-- CreateTable
CREATE TABLE "_EventAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventAssignees_B_index" ON "_EventAssignees"("B");

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAssignees" ADD CONSTRAINT "_EventAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "ScheduleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAssignees" ADD CONSTRAINT "_EventAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
