-- AlterTable
-- Add session column to DebateRound table
ALTER TABLE "public"."DebateRound" ADD COLUMN IF NOT EXISTS "session" INTEGER NOT NULL DEFAULT 1;

-- Drop old unique constraint if it exists
ALTER TABLE "public"."DebateRound" DROP CONSTRAINT IF EXISTS "DebateRound_competitionId_stage_roundNumber_key";

-- Create new unique constraint with session
CREATE UNIQUE INDEX IF NOT EXISTS "DebateRound_competitionId_stage_roundNumber_session_key" 
ON "public"."DebateRound"("competitionId", "stage", "roundNumber", "session");

