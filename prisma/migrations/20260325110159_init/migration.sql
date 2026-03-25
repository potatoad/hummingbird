-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('TALENT', 'INTERVIEW', 'NOTE', 'BUFFER', 'BREAK');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('BLANK', 'ARRIVED', 'WAITING', 'INTERVIEW', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Junket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Junket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "greenroom" BOOLEAN NOT NULL DEFAULT false,
    "greenroomUrl" TEXT,
    "greenroomPassword" TEXT,
    "pressHospitalityURL" TEXT,
    "pressHospitalityID" TEXT,
    "pressHospitalityPassword" TEXT,
    "junketId" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "producer" TEXT,
    "timer" TEXT,
    "technician" TEXT,
    "streamURL" TEXT,
    "checkInBuffer" INTEGER NOT NULL DEFAULT 60,
    "localTimeOffset" INTEGER NOT NULL DEFAULT 0,
    "turnaround" INTEGER NOT NULL DEFAULT 60,
    "plannedStartTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "plannedEndTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "dayId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'BLANK',
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "SlotType" "SlotType" NOT NULL DEFAULT 'INTERVIEW',
    "checkInTime" TIMESTAMPTZ,
    "plannedStartTime" TIMESTAMPTZ,
    "duration" INTEGER,
    "plannedEndTime" TIMESTAMPTZ,
    "actualStartTime" TIMESTAMPTZ,
    "actualEndTime" TIMESTAMPTZ,
    "orderIndex" DOUBLE PRECISION NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_junketId_fkey" FOREIGN KEY ("junketId") REFERENCES "Junket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
