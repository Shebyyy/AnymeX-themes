-- Convert User.role column from text to UserRole enum (only if still text)
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

-- Convert Theme.status column from text to ThemeStatus enum (only if still text)
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
