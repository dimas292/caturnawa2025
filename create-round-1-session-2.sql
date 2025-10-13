-- Buat Round 1 Sesi 2 untuk KDBI
-- Workaround: Pakai roundNumber = 2 karena constraint lama
-- Frontend akan display sebagai "Round 1 Sesi 2"

-- Cek Competition KDBI
SELECT id, name, type FROM "Competition" WHERE type = 'KDBI';

-- Buat Round 1 Sesi 2 (roundNumber = 2 di database)
INSERT INTO "DebateRound" (
  id, 
  "competitionId", 
  stage, 
  "roundNumber", 
  session, 
  "roundName",
  "isFrozen",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  c.id,
  'PRELIMINARY',
  2,  -- roundNumber = 2 (akan ditampilkan sebagai Sesi 2)
  1,  -- session tetap 1
  'PRELIMINARY - Round 1 Sesi 2',
  false,
  NOW(),
  NOW()
FROM "Competition" c
WHERE c.type = 'KDBI';

-- Verifikasi
SELECT 
  stage,
  "roundNumber",
  session,
  "roundName"
FROM "DebateRound" 
WHERE stage = 'PRELIMINARY'
ORDER BY "roundNumber";
