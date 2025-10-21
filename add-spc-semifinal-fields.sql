-- Add new semifinal scoring fields to SPCSubmission table
-- Run this script to add the new columns for SPC semifinal ranking system

ALTER TABLE "SPCSubmission" 
ADD COLUMN IF NOT EXISTS "penilaianKaryaTulisIlmiah" INTEGER,
ADD COLUMN IF NOT EXISTS "substansiKaryaTulisIlmiah" INTEGER,
ADD COLUMN IF NOT EXISTS "kualitasKaryaTulisIlmiah" INTEGER,
ADD COLUMN IF NOT EXISTS "catatanPenilaian" TEXT,
ADD COLUMN IF NOT EXISTS "catatanSubstansi" TEXT,
ADD COLUMN IF NOT EXISTS "catatanKualitas" TEXT,
ADD COLUMN IF NOT EXISTS "totalSemifinalScore" INTEGER,
ADD COLUMN IF NOT EXISTS "semifinalRank" INTEGER;

-- Verify the columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'SPCSubmission' 
AND column_name IN (
    'penilaianKaryaTulisIlmiah',
    'substansiKaryaTulisIlmiah', 
    'kualitasKaryaTulisIlmiah',
    'catatanPenilaian',
    'catatanSubstansi',
    'catatanKualitas',
    'totalSemifinalScore',
    'semifinalRank'
)
ORDER BY column_name;

-- Show sample of updated table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'SPCSubmission'
ORDER BY ordinal_position;
