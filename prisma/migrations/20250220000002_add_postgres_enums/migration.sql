-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- Create ThemeStatus enum
CREATE TYPE "ThemeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BROKEN');

-- Convert User.role column from text to UserRole enum
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

-- Convert Theme.status column from text to ThemeStatus enum
ALTER TABLE "Theme" ALTER COLUMN "status" TYPE "ThemeStatus" USING "status"::"ThemeStatus";
