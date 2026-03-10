/*
  Warnings:

  - You are about to drop the column `status` on the `receiving_confirmations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `receiving_headers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "receiving_headers_status_idx";

-- AlterTable
ALTER TABLE "receiving_confirmations" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "receiving_headers" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ReceivingStatus";
