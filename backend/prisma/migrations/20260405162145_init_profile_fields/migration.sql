-- AlterTable
ALTER TABLE "users" ADD COLUMN     "business_address" TEXT,
ADD COLUMN     "business_name" TEXT,
ADD COLUMN     "default_currency" TEXT DEFAULT 'USD',
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "tax_rate" DECIMAL(5,2) DEFAULT 0;
