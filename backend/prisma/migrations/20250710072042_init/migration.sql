/*
  Warnings:

  - You are about to drop the column `attachments` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `documents` on the `RFI` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "attachments";

-- AlterTable
ALTER TABLE "RFI" DROP COLUMN "documents";

-- CreateTable
CREATE TABLE "_DocumentToRFI" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentToRFI_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentToIssue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentToIssue_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DocumentToRFI_B_index" ON "_DocumentToRFI"("B");

-- CreateIndex
CREATE INDEX "_DocumentToIssue_B_index" ON "_DocumentToIssue"("B");

-- AddForeignKey
ALTER TABLE "_DocumentToRFI" ADD CONSTRAINT "_DocumentToRFI_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToRFI" ADD CONSTRAINT "_DocumentToRFI_B_fkey" FOREIGN KEY ("B") REFERENCES "RFI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToIssue" ADD CONSTRAINT "_DocumentToIssue_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToIssue" ADD CONSTRAINT "_DocumentToIssue_B_fkey" FOREIGN KEY ("B") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
