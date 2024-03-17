/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Made the column `invoiceId` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_invoiceId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "invoiceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_invoiceId_key" ON "Item"("invoiceId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
