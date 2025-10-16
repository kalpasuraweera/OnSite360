-- AlterTable
ALTER TABLE "DailyActivity" ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "taskId" TEXT;

-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "coordinates" JSONB,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "projectPhaseId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectPhaseId_fkey" FOREIGN KEY ("projectPhaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
