-- Script untuk Reset Semua Data Debate
-- HATI-HATI: Ini akan menghapus SEMUA data debate (rounds, matches, scores, standings)
-- Pastikan backup database dulu sebelum menjalankan!

-- ========================================
-- STEP 1: CEK DATA YANG AKAN DIHAPUS
-- ========================================

-- Cek jumlah data yang akan dihapus
SELECT 
  'DebateScore' as tabel,
  COUNT(*) as jumlah_data
FROM "DebateScore"

UNION ALL

SELECT 
  'DebateMatch' as tabel,
  COUNT(*) as jumlah_data
FROM "DebateMatch"

UNION ALL

SELECT 
  'DebateRound' as tabel,
  COUNT(*) as jumlah_data
FROM "DebateRound"

UNION ALL

SELECT 
  'TeamStanding' as tabel,
  COUNT(*) as jumlah_data
FROM "TeamStanding";

-- ========================================
-- STEP 2: BACKUP DATA (OPTIONAL)
-- ========================================
-- Jalankan ini jika ingin backup sebelum delete:
-- pg_dump $DATABASE_URL > backup-before-reset-$(date +%Y%m%d-%H%M%S).sql

-- ========================================
-- STEP 3: HAPUS SEMUA DATA DEBATE
-- ========================================

-- Hapus dalam urutan yang benar (child dulu, parent terakhir)

-- 1. Hapus DebateScore (child dari DebateMatch)
DELETE FROM "DebateScore";

-- 2. Hapus DebateMatch (child dari DebateRound)
DELETE FROM "DebateMatch";

-- 3. Hapus DebateRound (child dari Competition)
DELETE FROM "DebateRound";

-- 4. Reset TeamStanding (optional, tergantung apakah mau reset standings juga)
DELETE FROM "TeamStanding";

-- ========================================
-- STEP 4: VERIFIKASI SEMUA DATA TERHAPUS
-- ========================================

SELECT 
  'DebateScore' as tabel,
  COUNT(*) as sisa_data
FROM "DebateScore"

UNION ALL

SELECT 
  'DebateMatch' as tabel,
  COUNT(*) as sisa_data
FROM "DebateMatch"

UNION ALL

SELECT 
  'DebateRound' as tabel,
  COUNT(*) as sisa_data
FROM "DebateRound"

UNION ALL

SELECT 
  'TeamStanding' as tabel,
  COUNT(*) as sisa_data
FROM "TeamStanding";

-- Hasil harus 0 untuk semua tabel

-- ========================================
-- CATATAN PENTING
-- ========================================
-- Setelah reset, Anda bisa:
-- 1. Create rounds baru via admin dashboard
-- 2. Create matches/rooms baru
-- 3. Assign teams ke matches
-- 4. Juri bisa mulai scoring dari awal
--
-- Data yang TIDAK terhapus:
-- - Competition (KDBI, EDC, dll)
-- - Registration (tim yang sudah daftar)
-- - User (admin, judge, participant)
-- - TeamMember (anggota tim)
