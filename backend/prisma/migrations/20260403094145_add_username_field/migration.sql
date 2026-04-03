/*
  Warnings:

  - A unique constraint covering the columns `[intraId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "budget" SET DEFAULT 0,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "client_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "intraId" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_intraId_key" ON "users"("intraId");
