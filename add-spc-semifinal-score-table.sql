-- ============================================================================
-- Migration: Add SPCSemifinalScore Table for Multiple Judges Support
-- Date: 2025-01-22
-- Description: Menambahkan tabel baru untuk mendukung 3 juri di SPC Semifinal
-- ============================================================================

-- Step 1: Create SPCSemifinalScore table
CREATE TABLE IF NOT EXISTS "SPCSemifinalScore" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "penilaianKaryaTulisIlmiah" INTEGER NOT NULL,
    "substansiKaryaTulisIlmiah" INTEGER NOT NULL,
    "kualitasKaryaTulisIlmiah" INTEGER NOT NULL,
    "catatanPenilaian" TEXT,
    "catatanSubstansi" TEXT,
    "catatanKualitas" TEXT,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SPCSemifinalScore_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique constraint (setiap juri hanya bisa nilai 1x per submission)
CREATE UNIQUE INDEX IF NOT EXISTS "SPCSemifinalScore_submissionId_judgeId_key" 
ON "SPCSemifinalScore"("submissionId", "judgeId");

-- Step 3: Create indexes untuk performa
CREATE INDEX IF NOT EXISTS "SPCSemifinalScore_submissionId_idx" 
ON "SPCSemifinalScore"("submissionId");

CREATE INDEX IF NOT EXISTS "SPCSemifinalScore_judgeId_idx" 
ON "SPCSemifinalScore"("judgeId");

-- Step 4: Add foreign key constraint
ALTER TABLE "SPCSemifinalScore" 
ADD CONSTRAINT "SPCSemifinalScore_submissionId_fkey" 
FOREIGN KEY ("submissionId") 
REFERENCES "SPCSubmission"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 5: Migrate existing data from SPCSubmission to SPCSemifinalScore
-- Migrate SEMUA data yang sudah dinilai (ada nilai semifinal)
-- Data yang belum dinilai tidak perlu dimigrasi karena belum ada score
INSERT INTO "SPCSemifinalScore" (
    "id",
    "submissionId",
    "judgeId",
    "judgeName",
    "penilaianKaryaTulisIlmiah",
    "substansiKaryaTulisIlmiah",
    "kualitasKaryaTulisIlmiah",
    "catatanPenilaian",
    "catatanSubstansi",
    "catatanKualitas",
    "total",
    "createdAt",
    "updatedAt"
)
SELECT 
    gen_random_uuid()::text as "id",
    s."id" as "submissionId",
    COALESCE(s."evaluatedBy", 'UNKNOWN_JUDGE') as "judgeId",
    COALESCE(u."name", 'Unknown Judge') as "judgeName",
    s."penilaianKaryaTulisIlmiah",
    s."substansiKaryaTulisIlmiah",
    s."kualitasKaryaTulisIlmiah",
    s."catatanPenilaian",
    s."catatanSubstansi",
    s."catatanKualitas",
    COALESCE(s."totalSemifinalScore", 
             s."penilaianKaryaTulisIlmiah" + 
             s."substansiKaryaTulisIlmiah" + 
             s."kualitasKaryaTulisIlmiah") as "total",
    COALESCE(s."evaluatedAt", s."createdAt") as "createdAt",
    s."updatedAt"
FROM "SPCSubmission" s
LEFT JOIN "users" u ON s."evaluatedBy" = u."id"
WHERE s."penilaianKaryaTulisIlmiah" IS NOT NULL
  AND s."substansiKaryaTulisIlmiah" IS NOT NULL
  AND s."kualitasKaryaTulisIlmiah" IS NOT NULL
  -- Prevent duplicates jika script dijalankan berkali-kali
  AND NOT EXISTS (
    SELECT 1 FROM "SPCSemifinalScore" ss
    WHERE ss."submissionId" = s."id"
      AND ss."judgeId" = COALESCE(s."evaluatedBy", 'UNKNOWN_JUDGE')
  );

-- Step 6: Verify migration
-- Uncomment untuk melihat hasil migrasi
-- SELECT 
--     'SPCSubmission' as source,
--     COUNT(*) as count
-- FROM "SPCSubmission"
-- WHERE "penilaianKaryaTulisIlmiah" IS NOT NULL
-- UNION ALL
-- SELECT 
--     'SPCSemifinalScore' as source,
--     COUNT(*) as count
-- FROM "SPCSemifinalScore";

-- ============================================================================
-- NOTES:
-- 1. Field lama di SPCSubmission TIDAK DIHAPUS untuk backward compatibility
-- 2. Data bisa dimigrasi berkali-kali (idempotent) karena ada check NOT EXISTS
-- 3. Foreign key dengan ON DELETE CASCADE untuk data integrity
-- 4. Jika evaluatedBy NULL, akan menggunakan 'UNKNOWN_JUDGE'
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Table SPCSemifinalScore created with indexes and constraints';
    RAISE NOTICE 'Existing data migrated from SPCSubmission';
END $$;
