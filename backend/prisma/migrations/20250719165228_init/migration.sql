/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `Issue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_assignedToId_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "assignedTo",
DROP COLUMN "assignedToId";

-- CreateTable
CREATE TABLE "_IssueTaggedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IssueTaggedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IssueTaggedUsers_B_index" ON "_IssueTaggedUsers"("B");

-- AddForeignKey
ALTER TABLE "_IssueTaggedUsers" ADD CONSTRAINT "_IssueTaggedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IssueTaggedUsers" ADD CONSTRAINT "_IssueTaggedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
