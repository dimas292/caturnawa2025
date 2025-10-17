-- Check ALL constraints on DebateScore table
-- This will show us exactly what constraints exist

SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition,
  conkey as column_positions
FROM pg_constraint
WHERE conrelid = '"DebateScore"'::regclass
ORDER BY contype, conname;

-- Also check indexes that might be acting as constraints
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'DebateScore'
ORDER BY indexname;

-- Check table structure
\d "DebateScore"
