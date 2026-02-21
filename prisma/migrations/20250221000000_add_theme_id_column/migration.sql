-- ============================================================
-- ADD THEME ID COLUMN FOR SHAREABLE URLs
-- ============================================================

-- Step 1: Add themeId column to Theme table
-- This will store the ID from theme JSON (e.g., "cinema_director_mode")
ALTER TABLE "Theme" ADD COLUMN "themeId" TEXT;

-- Step 2: Generate themeId for existing themes from their JSON
-- Extract the 'id' field from the themeJson, or use a slug from the name
UPDATE "Theme"
SET "themeId" = COALESCE(
    -- Try to extract 'id' from JSON
    (themeJson::json->>'id'),
    -- Fallback: generate from name
    lower(replace(replace(name, ' ', '_'), '-', '_'))
);

-- Step 3: Make themeId unique and NOT NULL
-- First, handle any potential duplicates by appending a number
DO $$
DECLARE
    duplicate RECORD;
    counter INTEGER;
BEGIN
    FOR duplicate IN
        SELECT "themeId", COUNT(*) as count
        FROM "Theme"
        WHERE "themeId" IS NOT NULL
        GROUP BY "themeId"
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        FOR id IN
            SELECT "id"
            FROM "Theme"
            WHERE "themeId" = duplicate."themeId"
            ORDER BY "id"
        LOOP
            IF counter > 1 THEN
                UPDATE "Theme"
                SET "themeId" = duplicate."themeId" || '_' || counter
                WHERE "id" = id;
            END IF;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Step 4: Add unique constraint
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_themeId_key" UNIQUE ("themeId");

-- Step 5: Make themeId NOT NULL
ALTER TABLE "Theme" ALTER COLUMN "themeId" SET NOT NULL;

-- Step 6: Create index on themeId for faster lookups
CREATE INDEX "Theme_themeId_idx" ON "Theme"("themeId");

-- Step 7: Add AppSettings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AppSettings" (
    "id" TEXT NOT NULL,
    "defaultPreviewBackground" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- Step 8: Insert default AppSettings row if it doesn't exist
INSERT INTO "AppSettings" ("id", "updatedAt")
VALUES ('default', NOW())
ON CONFLICT ("id") DO NOTHING;
