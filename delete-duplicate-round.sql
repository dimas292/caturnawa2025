-- Delete duplicate round entry without "Sesi" specification
-- This removes "PRELIMINARY - Round 1" and keeps "PRELIMINARY - Round 1 Sesi 1"

DELETE FROM "DebateRound"
WHERE "roundName" = 'PRELIMINARY - Round 1'
  AND stage = 'PRELIMINARY'
  AND "roundNumber" = 1;

-- Verify the deletion
SELECT 
  "roundNumber",
  "roundName",
  stage,
  session
FROM "DebateRound" 
WHERE stage = 'PRELIMINARY'
ORDER BY "roundNumber", session;
