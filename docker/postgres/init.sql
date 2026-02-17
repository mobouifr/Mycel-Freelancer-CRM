-- =============================================================================
-- PostgreSQL Initialization Script
-- =============================================================================
-- This runs ONCE when the postgres container is created for the first time.
-- It will NOT run again if the data volume already exists.
-- To re-run: docker compose down -v && docker compose up
-- =============================================================================

-- Enable UUID generation (used by Prisma for ID fields)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text (useful for email searches, etc.)
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enable trigram matching (for fuzzy search on client names, etc.)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
