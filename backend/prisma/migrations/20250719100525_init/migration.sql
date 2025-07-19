-- CreateTable
CREATE TABLE "ProjectAttendance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "workDelayed" BOOLEAN NOT NULL DEFAULT false,
    "delayReason" TEXT,
    "delayDuration" INTEGER,
    "markedById" TEXT NOT NULL,
    "dayType" TEXT NOT NULL DEFAULT 'WORKDAY',
    "dayTypeReason" TEXT,
    "isWorkDay" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "projectAttendanceId" TEXT NOT NULL,
    "crewMemberId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "breakDuration" INTEGER,
    "totalHours" DOUBLE PRECISION,
    "scheduledHours" DOUBLE PRECISION,
    "leaveType" TEXT,
    "isApproved" BOOLEAN,
    "workLocation" TEXT,
    "tasks" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAttendance_projectId_date_key" ON "ProjectAttendance"("projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_projectAttendanceId_crewMemberId_key" ON "AttendanceRecord"("projectAttendanceId", "crewMemberId");

-- AddForeignKey
ALTER TABLE "ProjectAttendance" ADD CONSTRAINT "ProjectAttendance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAttendance" ADD CONSTRAINT "ProjectAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_projectAttendanceId_fkey" FOREIGN KEY ("projectAttendanceId") REFERENCES "ProjectAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "CrewMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
