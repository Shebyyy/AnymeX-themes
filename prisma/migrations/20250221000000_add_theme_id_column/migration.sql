-- ============================================================
-- ADD THEME ID COLUMN FOR SHAREABLE URLs
-- ============================================================

-- Step 1: Add themeId column to Theme table as optional (nullable)
-- This will store the ID from theme JSON (e.g., "cinema_director_mode")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Theme' AND column_name = 'themeId'
    ) THEN
        ALTER TABLE "Theme" ADD COLUMN "themeId" TEXT;
        RAISE NOTICE 'Added themeId column';
    ELSE
        RAISE NOTICE 'themeId column already exists';
    END IF;
END $$;

-- Step 2: Generate themeId for existing themes from their JSON
-- Extract the 'id' field from the themeJson, or use a slug from the name
UPDATE "Theme"
SET "themeId" = COALESCE(
    -- Try to extract 'id' from JSON
    (themeJson::json->>'id'),
    -- Fallback: generate from name
    lower(replace(replace(name, ' ', '_'), '-', '_'))
)
WHERE "themeId" IS NULL;

-- Step 3: Handle any potential duplicates by appending a number
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

-- Step 4: Add unique constraint (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Theme_themeId_key'
    ) THEN
        ALTER TABLE "Theme" ADD CONSTRAINT "Theme_themeId_key" UNIQUE ("themeId");
        RAISE NOTICE 'Added unique constraint on themeId';
    ELSE
        RAISE NOTICE 'Unique constraint on themeId already exists';
    END IF;
END $$;

-- Step 5: Make themeId NOT NULL (if not already)
DO $$
BEGIN
    -- First, ensure all rows have a themeId
    UPDATE "Theme"
    SET "themeId" = lower(replace(replace(name, ' ', '_'), '-', '_')) || '_' || id
    WHERE "themeId" IS NULL;

    -- Then set NOT NULL
    ALTER TABLE "Theme" ALTER COLUMN "themeId" SET NOT NULL;
    RAISE NOTICE 'Made themeId NOT NULL';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not set NOT NULL: %', SQLERRM;
END $$;

-- Step 6: Create index on themeId for faster lookups (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'Theme_themeId_idx'
    ) THEN
        CREATE INDEX "Theme_themeId_idx" ON "Theme"("themeId");
        RAISE NOTICE 'Created index on themeId';
    ELSE
        RAISE NOTICE 'Index on themeId already exists';
    END IF;
END $$;

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
