-- ============================================================
-- RESOLVE FAILED MIGRATION AND FIX SCHEMA
-- ============================================================

-- Step 1: Mark the failed migration as resolved
-- This allows Prisma to continue with new migrations
INSERT INTO "_prisma_migrations" (
    "migration_name",
    "started_at",
    "applied_steps_count",
    "finished_at"
) VALUES (
    '20250220000002_add_postgres_enums',
    NOW(),
    1,
    NOW()
)
ON CONFLICT ("migration_name") DO UPDATE SET
    "applied_steps_count" = 1,
    "finished_at" = NOW(),
    "rolled_back_at" = NULL;

-- Step 2: Convert User.role column from text to UserRole enum (only if still text)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relname = 'User' 
          AND a.attname = 'role' 
          AND a.atttypid = 'text'::regtype
    ) THEN
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
        RAISE NOTICE 'Converted User.role to UserRole enum';
    ELSE
        RAISE NOTICE 'User.role is already enum type';
    END IF;
END $$;

-- Step 3: Convert Theme.status column from text to ThemeStatus enum (only if still text)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relname = 'Theme' 
          AND a.attname = 'status' 
          AND a.atttypid = 'text'::regtype
    ) THEN
        ALTER TABLE "Theme" ALTER COLUMN "status" TYPE "ThemeStatus" USING "status"::"ThemeStatus";
        RAISE NOTICE 'Converted Theme.status to ThemeStatus enum';
    ELSE
        RAISE NOTICE 'Theme.status is already enum type';
    END IF;
END $$;
