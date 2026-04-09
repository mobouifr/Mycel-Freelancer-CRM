-- Make user_id, client_id and username NOT NULL (requires no existing NULL values)
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "client_id" SET NOT NULL;

-- AlterTable: make username NOT NULL and set default
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "username" SET DEFAULT 'User';

-- NOTE: notifications, user_achievements, user_badges tables are already
-- created in migration 20260407000001_add_notifications_gamification.
-- They were removed from here to avoid duplicate CREATE TABLE errors.
