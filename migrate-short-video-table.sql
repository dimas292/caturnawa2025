-- Migration: Update DCCShortVideoScore table structure
-- From: 3 simple columns (konsepKreatif, produksiVideo, penyampaianPesan)
-- To: 14 sub-criteria + 4 weighted totals

BEGIN;

-- Step 1: Drop old columns
ALTER TABLE "DCCShortVideoScore" 
  DROP COLUMN IF EXISTS "konsepKreatif",
  DROP COLUMN IF EXISTS "produksiVideo",
  DROP COLUMN IF EXISTS "penyampaianPesan";

-- Step 2: Add Sinematografi sub-criteria
ALTER TABLE "DCCShortVideoScore" 
  ADD COLUMN "angleShot" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "komposisiGambar" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "kualitasGambar" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "sinematografi" INTEGER NOT NULL DEFAULT 0;

-- Step 3: Add Visual dan Bentuk sub-criteria
ALTER TABLE "DCCShortVideoScore" 
  ADD COLUMN "pilihanWarna" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "tataKostum" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "propertiLatar" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "kesesuaianSetting" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "visualBentuk" INTEGER NOT NULL DEFAULT 0;

-- Step 4: Add Visual dan Editing sub-criteria
ALTER TABLE "DCCShortVideoScore" 
  ADD COLUMN "kerapianTransisi" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ritmePemotongan" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "sinkronisasiAudio" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "kreativitasEfek" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "visualEditing" INTEGER NOT NULL DEFAULT 0;

-- Step 5: Add Isi/Pesan sub-criteria
ALTER TABLE "DCCShortVideoScore" 
  ADD COLUMN "kesesuaianTema" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "kedalamanIsi" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "dayaTarik" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "isiPesan" INTEGER NOT NULL DEFAULT 0;

-- Step 6: Remove default constraints (optional, for cleaner schema)
ALTER TABLE "DCCShortVideoScore" 
  ALTER COLUMN "angleShot" DROP DEFAULT,
  ALTER COLUMN "komposisiGambar" DROP DEFAULT,
  ALTER COLUMN "kualitasGambar" DROP DEFAULT,
  ALTER COLUMN "sinematografi" DROP DEFAULT,
  ALTER COLUMN "pilihanWarna" DROP DEFAULT,
  ALTER COLUMN "tataKostum" DROP DEFAULT,
  ALTER COLUMN "propertiLatar" DROP DEFAULT,
  ALTER COLUMN "kesesuaianSetting" DROP DEFAULT,
  ALTER COLUMN "visualBentuk" DROP DEFAULT,
  ALTER COLUMN "kerapianTransisi" DROP DEFAULT,
  ALTER COLUMN "ritmePemotongan" DROP DEFAULT,
  ALTER COLUMN "sinkronisasiAudio" DROP DEFAULT,
  ALTER COLUMN "kreativitasEfek" DROP DEFAULT,
  ALTER COLUMN "visualEditing" DROP DEFAULT,
  ALTER COLUMN "kesesuaianTema" DROP DEFAULT,
  ALTER COLUMN "kedalamanIsi" DROP DEFAULT,
  ALTER COLUMN "dayaTarik" DROP DEFAULT,
  ALTER COLUMN "isiPesan" DROP DEFAULT;

COMMIT;

-- Verify the new structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'DCCShortVideoScore'
ORDER BY ordinal_position;
