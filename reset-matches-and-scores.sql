-- Reset DebateMatch dan DebateScore saja
-- DebateRound tetap ada, hanya hapus match dan score

-- ========================================
-- STEP 1: CEK DATA YANG AKAN DIHAPUS
-- ========================================

SELECT 
  'DebateScore' as tabel,
  COUNT(*) as jumlah_data
FROM "DebateScore"

UNION ALL

SELECT 
  'DebateMatch' as tabel,
  COUNT(*) as jumlah_data
FROM "DebateMatch";

-- ========================================
-- STEP 2: HAPUS DATA
-- ========================================

-- 1. Hapus DebateScore dulu (child dari DebateMatch)
DELETE FROM "DebateScore";

-- 2. Hapus DebateMatch
DELETE FROM "DebateMatch";

-- ========================================
-- STEP 3: VERIFIKASI (harus 0)
-- ========================================

SELECT 
  'DebateScore' as tabel,
  COUNT(*) as sisa_data
FROM "DebateScore"

UNION ALL

SELECT 
  'DebateMatch' as tabel,
  COUNT(*) as sisa_data
FROM "DebateMatch";

-- ========================================
-- CATATAN
-- ========================================
-- Yang DIHAPUS:
-- - DebateScore (semua penilaian juri)
-- - DebateMatch (semua match/room)
--
-- Yang TETAP ADA:
-- - DebateRound (rounds tetap ada)
-- - Competition (KDBI, EDC, dll)
-- - Registration (tim yang sudah daftar)
-- - User (admin, judge, participant)
-- - TeamMember (anggota tim)
-- - TeamStanding (standings)
--
-- Setelah reset, Anda bisa:
-- - Create matches/rooms baru di rounds yang sudah ada
-- - Assign teams ke matches baru
-- - Juri mulai scoring dari awal
