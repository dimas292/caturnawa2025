-- ============================================================================
-- ROLLBACK: Remove SPCSemifinalScore Table
-- Date: 2025-01-22
-- Description: Rollback migrasi jika ada masalah
-- WARNING: Ini akan menghapus tabel SPCSemifinalScore dan semua datanya!
-- ============================================================================

-- SAFETY CHECK: Uncomment baris ini untuk enable rollback
-- SET client_min_messages TO WARNING;

-- Step 1: Backup data sebelum rollback (optional, untuk safety)
-- Uncomment jika ingin backup dulu
-- CREATE TABLE IF NOT EXISTS "SPCSemifinalScore_backup" AS 
-- SELECT * FROM "SPCSemifinalScore";

-- Step 2: Drop foreign key constraint
ALTER TABLE "SPCSemifinalScore" 
DROP CONSTRAINT IF EXISTS "SPCSemifinalScore_submissionId_fkey";

-- Step 3: Drop indexes
DROP INDEX IF EXISTS "SPCSemifinalScore_submissionId_judgeId_key";
DROP INDEX IF EXISTS "SPCSemifinalScore_submissionId_idx";
DROP INDEX IF EXISTS "SPCSemifinalScore_judgeId_idx";

-- Step 4: Drop table
DROP TABLE IF EXISTS "SPCSemifinalScore";

-- Success message
DO $$
BEGIN
    RAISE NOTICE '⚠️  Rollback completed!';
    RAISE NOTICE 'Table SPCSemifinalScore has been removed';
    RAISE NOTICE 'Old data in SPCSubmission is still intact';
END $$;

-- ============================================================================
-- NOTES:
-- 1. Data lama di SPCSubmission tetap aman (tidak terpengaruh)
-- 2. Setelah rollback, sistem akan kembali menggunakan field lama
-- 3. Jika ingin re-apply migration, jalankan add-spc-semifinal-score-table.sql
-- ============================================================================
