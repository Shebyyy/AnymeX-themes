-- Create enum types only if they don't exist
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ThemeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BROKEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Convert User.role column from text to UserRole enum (only if still text)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        WHERE c.relname = 'User' AND a.attname = 'role' AND a.atttypid = 'text'::regtype
    ) THEN
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
    END IF;
END $$;

-- Convert Theme.status column from text to ThemeStatus enum (only if still text)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        WHERE c.relname = 'Theme' AND a.attname = 'status' AND a.atttypid = 'text'::regtype
    ) THEN
        ALTER TABLE "Theme" ALTER COLUMN "status" TYPE "ThemeStatus" USING "status"::"ThemeStatus";
    END IF;
END $$;
