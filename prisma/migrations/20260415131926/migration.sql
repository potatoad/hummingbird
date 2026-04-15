/*
  Warnings:

  - You are about to drop the column `colour` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `colour` on the `Slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "colour",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#ffffff';

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "colour",
ADD COLUMN     "color" TEXT;
