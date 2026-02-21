-- ============================================================
-- ADD DISCORD INTEGRATION FIELDS
-- ============================================================

-- Step 1: Add previewImage column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Theme' AND column_name = 'previewImage'
    ) THEN
        ALTER TABLE "Theme" ADD COLUMN "previewImage" TEXT;
        RAISE NOTICE 'Added previewImage column';
    ELSE
        RAISE NOTICE 'previewImage column already exists';
    END IF;
END $$;

-- Step 2: Add discordPostId column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Theme' AND column_name = 'discordPostId'
    ) THEN
        ALTER TABLE "Theme" ADD COLUMN "discordPostId" TEXT;
        RAISE NOTICE 'Added discordPostId column';
    ELSE
        RAISE NOTICE 'discordPostId column already exists';
    END IF;
END $$;

-- Step 3: Add index on discordPostId for faster lookups (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'Theme_discordPostId_idx'
    ) THEN
        CREATE INDEX "Theme_discordPostId_idx" ON "Theme"("discordPostId");
        RAISE NOTICE 'Created index on discordPostId';
    ELSE
        RAISE NOTICE 'Index on discordPostId already exists';
    END IF;
END $$;
