-- Drop old unique constraint (without session)
ALTER TABLE "DebateRound" DROP CONSTRAINT IF EXISTS "DebateRound_competitionId_stage_roundNumber_key";

-- Add new unique constraint (with session)
ALTER TABLE "DebateRound" ADD CONSTRAINT "DebateRound_competitionId_stage_roundNumber_session_key" 
  UNIQUE ("competitionId", "stage", "roundNumber", "session");
