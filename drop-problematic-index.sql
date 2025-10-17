-- Drop the problematic unique index that's blocking duplicate participantId
-- This index enforces unique (matchId, participantId) which prevents saving 2 scores for same participant

-- Drop the old index
DROP INDEX IF EXISTS "DebateScore_matchId_participantId_key";

-- Verify the index is gone
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'DebateScore'
  AND indexname LIKE '%matchId_participantId%'
ORDER BY indexname;

-- Should return no rows if successfully dropped

-- Verify only the correct constraint remains
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = '"DebateScore"'::regclass
  AND contype = 'u';

-- Expected: Only DebateScore_matchId_participantId_judgeId_bpPosition_key
