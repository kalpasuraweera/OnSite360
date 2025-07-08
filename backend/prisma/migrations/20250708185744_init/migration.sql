/*
  Warnings:

  - You are about to drop the column `crewMembers` on the `DailyActivity` table. All the data in the column will be lost.
  - You are about to drop the column `loggedBy` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `assignees` on the `ScheduleEvent` table. All the data in the column will be lost.
  - You are about to drop the column `dependencies` on the `ScheduleEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyActivity" DROP COLUMN "crewMembers";

-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "loggedBy";

-- AlterTable
ALTER TABLE "ScheduleEvent" DROP COLUMN "assignees",
DROP COLUMN "dependencies";

-- CreateTable
CREATE TABLE "_CrewMemberToDailyActivity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CrewMemberToDailyActivity_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ScheduleEventToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ScheduleEventToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventDependencies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventDependencies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CrewMemberToDailyActivity_B_index" ON "_CrewMemberToDailyActivity"("B");

-- CreateIndex
CREATE INDEX "_ScheduleEventToUser_B_index" ON "_ScheduleEventToUser"("B");

-- CreateIndex
CREATE INDEX "_EventDependencies_B_index" ON "_EventDependencies"("B");

-- AddForeignKey
ALTER TABLE "_CrewMemberToDailyActivity" ADD CONSTRAINT "_CrewMemberToDailyActivity_A_fkey" FOREIGN KEY ("A") REFERENCES "CrewMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrewMemberToDailyActivity" ADD CONSTRAINT "_CrewMemberToDailyActivity_B_fkey" FOREIGN KEY ("B") REFERENCES "DailyActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleEventToUser" ADD CONSTRAINT "_ScheduleEventToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ScheduleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleEventToUser" ADD CONSTRAINT "_ScheduleEventToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDependencies" ADD CONSTRAINT "_EventDependencies_A_fkey" FOREIGN KEY ("A") REFERENCES "ScheduleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDependencies" ADD CONSTRAINT "_EventDependencies_B_fkey" FOREIGN KEY ("B") REFERENCES "ScheduleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
