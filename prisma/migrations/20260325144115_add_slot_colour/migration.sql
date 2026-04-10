/*
  Warnings:

  - You are about to drop the column `SlotType` on the `Slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "SlotType",
ADD COLUMN     "colour" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "slotType" "SlotType" NOT NULL DEFAULT 'INTERVIEW';
