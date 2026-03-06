/*
  Warnings:

  - You are about to drop the column `product_id` on the `level_inspections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qc_template_id]` on the table `level_inspections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id,code]` on the table `qc_templates` will be added. If there are existing duplicate values, this will fail.
  - Made the column `qc_template_id` on table `level_inspections` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `product_id` to the `qc_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "level_inspections" DROP CONSTRAINT "level_inspections_product_id_fkey";

-- DropForeignKey
ALTER TABLE "level_inspections" DROP CONSTRAINT "level_inspections_qc_template_id_fkey";

-- DropIndex
DROP INDEX "level_inspections_product_id_is_active_idx";

-- DropIndex
DROP INDEX "level_inspections_qc_template_id_idx";

-- DropIndex
DROP INDEX "qc_templates_code_key";

-- AlterTable
ALTER TABLE "level_inspections" DROP COLUMN "product_id",
ALTER COLUMN "qc_template_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "qc_templates" ADD COLUMN     "product_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "level_inspections_qc_template_id_key" ON "level_inspections"("qc_template_id");

-- CreateIndex
CREATE INDEX "level_inspections_is_active_idx" ON "level_inspections"("is_active");

-- CreateIndex
CREATE INDEX "qc_templates_product_id_idx" ON "qc_templates"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "qc_templates_product_id_code_key" ON "qc_templates"("product_id", "code");

-- AddForeignKey
ALTER TABLE "level_inspections" ADD CONSTRAINT "level_inspections_qc_template_id_fkey" FOREIGN KEY ("qc_template_id") REFERENCES "qc_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_templates" ADD CONSTRAINT "qc_templates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
