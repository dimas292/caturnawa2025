-- Add DCC Final Score columns for presentation criteria
-- This migration adds the final scoring criteria columns to DCCFinalScore table

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Check and add strukturPresentasi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'strukturPresentasi'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "strukturPresentasi" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Check and add teknikPenyampaian
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'teknikPenyampaian'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "teknikPenyampaian" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Check and add penguasaanMateri
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'penguasaanMateri'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "penguasaanMateri" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Check and add kolaborasiTeam
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'kolaborasiTeam'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "kolaborasiTeam" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Check and add total
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'total'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "total" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Check and add feedback
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'feedback'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "feedback" TEXT;
    END IF;

    -- Check and add judgeName
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'DCCFinalScore' 
        AND column_name = 'judgeName'
    ) THEN
        ALTER TABLE "DCCFinalScore" ADD COLUMN "judgeName" TEXT NOT NULL DEFAULT 'Unknown';
    END IF;

END $$;

-- Remove default constraints after adding columns
ALTER TABLE "DCCFinalScore" ALTER COLUMN "strukturPresentasi" DROP DEFAULT;
ALTER TABLE "DCCFinalScore" ALTER COLUMN "teknikPenyampaian" DROP DEFAULT;
ALTER TABLE "DCCFinalScore" ALTER COLUMN "penguasaanMateri" DROP DEFAULT;
ALTER TABLE "DCCFinalScore" ALTER COLUMN "kolaborasiTeam" DROP DEFAULT;
ALTER TABLE "DCCFinalScore" ALTER COLUMN "total" DROP DEFAULT;
ALTER TABLE "DCCFinalScore" ALTER COLUMN "judgeName" DROP DEFAULT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'DCCFinalScore'
ORDER BY ordinal_position;
