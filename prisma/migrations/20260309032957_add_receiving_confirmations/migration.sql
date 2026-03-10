-- AlterEnum
ALTER TYPE "ReceivingStatus" ADD VALUE 'confirmed';

-- CreateTable
CREATE TABLE "receiving_confirmations" (
    "id" TEXT NOT NULL,
    "receiving_header_id" TEXT NOT NULL,
    "confirmed_by" TEXT NOT NULL,
    "status" "ReceivingStatus" NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "receiving_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "receiving_confirmations_receiving_header_id_idx" ON "receiving_confirmations"("receiving_header_id");

-- AddForeignKey
ALTER TABLE "receiving_confirmations" ADD CONSTRAINT "receiving_confirmations_receiving_header_id_fkey" FOREIGN KEY ("receiving_header_id") REFERENCES "receiving_headers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_confirmations" ADD CONSTRAINT "receiving_confirmations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
