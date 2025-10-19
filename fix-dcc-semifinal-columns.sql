-- Fix DCCSemifinalScore column names to match Prisma schema
-- Run this in production database

ALTER TABLE "DCCSemifinalScore" 
  RENAME COLUMN "konsepKreatif" TO "desainVisual";

ALTER TABLE "DCCSemifinalScore" 
  RENAME COLUMN "eksekusiDesain" TO "isiPesan";

ALTER TABLE "DCCSemifinalScore" 
  RENAME COLUMN "komunikasiVisual" TO "orisinalitas";

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'DCCSemifinalScore' 
ORDER BY ordinal_position;
