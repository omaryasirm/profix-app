-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "contact" DROP NOT NULL,
ALTER COLUMN "registrationNo" DROP NOT NULL,
ALTER COLUMN "vehicle" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "registrationNo" TEXT,
ADD COLUMN     "vehicle" TEXT;
