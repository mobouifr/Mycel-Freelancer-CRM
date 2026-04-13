/*
  Warnings:

  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proposals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_project_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_project_id_fkey";

-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_user_id_fkey";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "proposals";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "ProposalStatus";
