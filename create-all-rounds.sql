-- Buat semua rounds untuk KDBI
-- Round 1-4, masing-masing 2 sesi
-- Mapping: roundNumber di DB = (actualRound - 1) * 2 + session

-- Cek Competition KDBI
SELECT id, name, type FROM "Competition" WHERE type = 'KDBI';

-- Round 1 Sesi 1 (sudah ada - roundNumber = 1)
-- Round 1 Sesi 2 (roundNumber = 2)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 2, 1, 'PRELIMINARY - Round 1 Sesi 2', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 2 Sesi 1 (roundNumber = 3)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 3, 1, 'PRELIMINARY - Round 2 Sesi 1', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 2 Sesi 2 (roundNumber = 4)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 4, 1, 'PRELIMINARY - Round 2 Sesi 2', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 3 Sesi 1 (roundNumber = 5)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 5, 1, 'PRELIMINARY - Round 3 Sesi 1', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 3 Sesi 2 (roundNumber = 6)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 6, 1, 'PRELIMINARY - Round 3 Sesi 2', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 4 Sesi 1 (roundNumber = 7)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 7, 1, 'PRELIMINARY - Round 4 Sesi 1', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Round 4 Sesi 2 (roundNumber = 8)
INSERT INTO "DebateRound" (id, "competitionId", stage, "roundNumber", session, "roundName", "isFrozen", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c.id, 'PRELIMINARY', 8, 1, 'PRELIMINARY - Round 4 Sesi 2', false, NOW(), NOW()
FROM "Competition" c WHERE c.type = 'KDBI';

-- Verifikasi semua rounds
SELECT 
  "roundNumber",
  "roundName",
  stage
FROM "DebateRound" 
WHERE stage = 'PRELIMINARY'
ORDER BY "roundNumber";
