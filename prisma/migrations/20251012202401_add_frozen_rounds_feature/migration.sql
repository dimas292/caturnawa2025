-- AlterTable
ALTER TABLE "public"."DebateRound" ADD COLUMN     "frozenAt" TIMESTAMP(3),
ADD COLUMN     "frozenBy" TEXT,
ADD COLUMN     "isFrozen" BOOLEAN NOT NULL DEFAULT false;
