-- Add support for British Parliamentary system
-- Each match now has 4 teams instead of 2

-- Add new columns to DebateMatch for BP system
ALTER TABLE "DebateMatch" 
ADD COLUMN "team3Id" TEXT,
ADD COLUMN "team4Id" TEXT,
ADD COLUMN "matchFormat" TEXT DEFAULT 'BP',
ADD CONSTRAINT "DebateMatch_team3Id_fkey" FOREIGN KEY ("team3Id") REFERENCES "Registration" ("id"),
ADD CONSTRAINT "DebateMatch_team4Id_fkey" FOREIGN KEY ("team4Id") REFERENCES "Registration" ("id");

-- Add BP position tracking
ALTER TABLE "DebateScore"
ADD COLUMN "bpPosition" TEXT, -- 'PM', 'DPM', 'LO', 'DLO', 'MG', 'GW', 'MO', 'OW'
ADD COLUMN "teamPosition" TEXT; -- 'OG', 'OO', 'CG', 'CO'

-- Add BP-specific team standings
ALTER TABLE "TeamStanding"
ADD COLUMN "bpRankings" JSONB DEFAULT '{}', -- Store BP rankings history
ADD COLUMN "avgBPPosition" FLOAT DEFAULT 0, -- Average BP position (1-4)
ADD COLUMN "firstPlaces" INTEGER DEFAULT 0,
ADD COLUMN "secondPlaces" INTEGER DEFAULT 0,
ADD COLUMN "thirdPlaces" INTEGER DEFAULT 0,
ADD COLUMN "fourthPlaces" INTEGER DEFAULT 0;

-- Create index for BP queries
CREATE INDEX "idx_debate_match_all_teams" ON "DebateMatch" ("team1Id", "team2Id", "team3Id", "team4Id");
CREATE INDEX "idx_debate_score_bp_position" ON "DebateScore" ("bpPosition", "teamPosition");