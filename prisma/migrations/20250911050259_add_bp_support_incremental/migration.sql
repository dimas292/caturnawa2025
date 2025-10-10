/*
  Warnings:

  - You are about to drop the column `winnerTeamId` on the `DebateMatch` table. All the data in the column will be lost.
  - You are about to drop the column `averageScore` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `draws` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `finalAvgScore` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `finalVP` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `prelimAvgScore` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `prelimVP` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `semifinalAvgScore` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `semifinalVP` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `victoryPoints` on the `TeamStanding` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `TeamStanding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."DebateMatch" DROP COLUMN "winnerTeamId",
ADD COLUMN     "firstPlaceTeamId" TEXT,
ADD COLUMN     "fourthPlaceTeamId" TEXT,
ADD COLUMN     "matchFormat" TEXT NOT NULL DEFAULT 'BP',
ADD COLUMN     "secondPlaceTeamId" TEXT,
ADD COLUMN     "team3Id" TEXT,
ADD COLUMN     "team4Id" TEXT,
ADD COLUMN     "thirdPlaceTeamId" TEXT;

-- AlterTable
ALTER TABLE "public"."DebateScore" ADD COLUMN     "bpPosition" TEXT,
ADD COLUMN     "speakerRank" INTEGER,
ADD COLUMN     "teamPosition" TEXT;

-- AlterTable
ALTER TABLE "public"."TeamStanding" DROP COLUMN "averageScore",
DROP COLUMN "draws",
DROP COLUMN "finalAvgScore",
DROP COLUMN "finalVP",
DROP COLUMN "losses",
DROP COLUMN "prelimAvgScore",
DROP COLUMN "prelimVP",
DROP COLUMN "semifinalAvgScore",
DROP COLUMN "semifinalVP",
DROP COLUMN "totalScore",
DROP COLUMN "victoryPoints",
DROP COLUMN "wins",
ADD COLUMN     "averageSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "finalAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "finalSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "finalTeamPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstPlaces" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fourthPlaces" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prelimAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "prelimSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "prelimTeamPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "secondPlaces" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "semifinalAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "semifinalSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "semifinalTeamPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "speakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "teamPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thirdPlaces" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team3Id_fkey" FOREIGN KEY ("team3Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team4Id_fkey" FOREIGN KEY ("team4Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
