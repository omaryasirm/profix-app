/*
  Warnings:

  - You are about to drop the column `address` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle` on the `Invoice` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('INVOICE', 'ESTIMATE');

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "address",
DROP COLUMN "contact",
DROP COLUMN "name",
DROP COLUMN "vehicle",
ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'INVOICE',
ALTER COLUMN "paymentMethod" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
