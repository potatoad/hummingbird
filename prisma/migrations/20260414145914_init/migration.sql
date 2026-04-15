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
    "greenroomUrl" TEXT,
    "greenroomPassword" TEXT,
    "junketId" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "colour" TEXT NOT NULL DEFAULT '#ffffff',
    "name" TEXT NOT NULL,
    "producer" TEXT,
    "timer" TEXT,
    "technician" TEXT,
    "streamURL" TEXT,
    "zoomLink" TEXT,
    "checkInBuffer" INTEGER NOT NULL DEFAULT 60,
    "localTimeOffset" INTEGER NOT NULL DEFAULT 0,
    "turnaround" INTEGER NOT NULL DEFAULT 60,
    "plannedStartTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "plannedEndTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "orderIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dayId" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "outlet" TEXT,
    "notes" TEXT,
    "territory" TEXT,
    "colour" TEXT,
    "status" "Status" NOT NULL DEFAULT 'BLANK',
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "checkInTime" TIMESTAMPTZ(6),
    "plannedStartTime" TIMESTAMPTZ(6),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "plannedEndTime" TIMESTAMPTZ(6),
    "actualStartTime" TIMESTAMPTZ(6),
    "actualEndTime" TIMESTAMPTZ(6),
    "orderIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Junket_id_key" ON "Junket"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Day_id_key" ON "Day"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_key" ON "Room"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_id_key" ON "Slot"("id");

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_junketId_fkey" FOREIGN KEY ("junketId") REFERENCES "Junket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
