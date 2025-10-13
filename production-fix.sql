-- Production Database Fix: Add session column to DebateRound
-- Run this SQL in production database to fix the error

-- Step 1: Add session column with default value
ALTER TABLE "DebateRound" 
ADD COLUMN IF NOT EXISTS "session" INTEGER NOT NULL DEFAULT 1;

-- Step 2: Drop old unique constraint (if exists)
ALTER TABLE "DebateRound" 
DROP CONSTRAINT IF EXISTS "DebateRound_competitionId_stage_roundNumber_key";

-- Step 3: Add new unique constraint with session
ALTER TABLE "DebateRound" 
ADD CONSTRAINT "DebateRound_competitionId_stage_roundNumber_session_key" 
UNIQUE ("competitionId", "stage", "roundNumber", "session");

-- Step 4: Add judgeId column to DebateMatch (if not exists)
ALTER TABLE "DebateMatch" 
ADD COLUMN IF NOT EXISTS "judgeId" TEXT;

-- Step 5: Add foreign key constraint for judge
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'DebateMatch_judgeId_fkey'
    ) THEN
        ALTER TABLE "DebateMatch" 
        ADD CONSTRAINT "DebateMatch_judgeId_fkey" 
        FOREIGN KEY ("judgeId") REFERENCES "users"("id") 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Step 6: Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'DebateRound' 
AND column_name = 'session';

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'DebateMatch' 
AND column_name = 'judgeId';

-- Step 7: Check constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'DebateRound'::regclass
AND conname LIKE '%session%';

-- Success message
SELECT 'Migration completed successfully!' as status;
