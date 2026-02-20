-- Create Enum Types if they don't exist
-- This is handled by plpgsql blocks to avoid errors on re-run

CREATE OR REPLACE FUNCTION create_enum_types() RETURNS void AS $$
BEGIN
    -- Create UserRole enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
    END IF;

    -- Create ThemeStatus enum  
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ThemeStatus') THEN
        CREATE TYPE "ThemeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BROKEN');
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_enum_types();
DROP FUNCTION create_enum_types();
