/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `qc_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "qc_templates" DROP CONSTRAINT "qc_templates_product_id_fkey";

-- DropIndex
DROP INDEX "qc_templates_product_id_code_key";

-- AlterTable
ALTER TABLE "qc_templates" ALTER COLUMN "product_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "qc_templates_code_key" ON "qc_templates"("code");

-- AddForeignKey
ALTER TABLE "qc_templates" ADD CONSTRAINT "qc_templates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
