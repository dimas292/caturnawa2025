-- Quick Fix: Hapus Duplikat DebateScore di Production
-- Jalankan ini SEKARANG di TablePlus untuk fix error sementara

-- 1. CEK DUPLIKAT
SELECT 
  "matchId",
  "participantId",
  COUNT(*) as jumlah,
  STRING_AGG(id, ', ') as ids
FROM "DebateScore"
GROUP BY "matchId", "participantId"
HAVING COUNT(*) > 1;

-- 2. HAPUS DUPLIKAT (simpan yang terbaru)
DELETE FROM "DebateScore"
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "matchId", "participantId" 
        ORDER BY "createdAt" DESC
      ) as rn
    FROM "DebateScore"
  ) t
  WHERE rn > 1
);

-- 3. VERIFIKASI (harus 0)
SELECT COUNT(*) as total_duplikat
FROM (
  SELECT "matchId", "participantId"
  FROM "DebateScore"
  GROUP BY "matchId", "participantId"
  HAVING COUNT(*) > 1
) as duplicates;
