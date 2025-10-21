-- Update SPC Final Score table columns
-- Change from materi/penyampaian/bahasa to pemaparanMateri/pertanyaanJawaban/kesesuaianTema

-- Step 1: Add new columns
ALTER TABLE "SPCFinalScore" 
ADD COLUMN IF NOT EXISTS "pemaparanMateri" INTEGER,
ADD COLUMN IF NOT EXISTS "pertanyaanJawaban" INTEGER,
ADD COLUMN IF NOT EXISTS "kesesuaianTema" INTEGER;

-- Step 2: Copy data from old columns to new columns (if you have existing data)
UPDATE "SPCFinalScore"
SET 
  "pemaparanMateri" = "materi",
  "pertanyaanJawaban" = "penyampaian",
  "kesesuaianTema" = "bahasa"
WHERE "pemaparanMateri" IS NULL;

-- Step 3: Drop old columns (after verifying data is copied)
ALTER TABLE "SPCFinalScore" 
DROP COLUMN IF EXISTS "materi",
DROP COLUMN IF EXISTS "penyampaian",
DROP COLUMN IF EXISTS "bahasa";

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'SPCFinalScore' 
AND column_name IN (
    'pemaparanMateri',
    'pertanyaanJawaban', 
    'kesesuaianTema',
    'total',
    'feedback'
)
ORDER BY column_name;
