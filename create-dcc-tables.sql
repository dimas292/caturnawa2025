-- Create missing DCC enums
CREATE TYPE "DCCSubmissionStatus" AS ENUM ('PENDING', 'REVIEWED', 'QUALIFIED', 'NOT_QUALIFIED');
CREATE TYPE "DCCStage" AS ENUM ('SEMIFINAL', 'FINAL');

-- Create DCCSubmission table
CREATE TABLE "DCCSubmission" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "judulKarya" TEXT NOT NULL,
    "deskripsiKarya" TEXT,
    "catatan" TEXT,
    "fileKarya" TEXT,
    "status" "DCCSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "evaluatedAt" TIMESTAMP(3),
    "evaluatedBy" TEXT,
    "feedback" TEXT,
    "qualifiedToFinal" BOOLEAN NOT NULL DEFAULT false,
    "presentationOrder" INTEGER,
    "scheduledTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCCSubmission_pkey" PRIMARY KEY ("id")
);

-- Create DCCFinalScore table
-- Each judge creates one row per submission
CREATE TABLE "DCCFinalScore" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "konsepKreatif" INTEGER NOT NULL,
    "eksekusiDesain" INTEGER NOT NULL,
    "komunikasiVisual" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCCFinalScore_pkey" PRIMARY KEY ("id")
);

-- Create DCCSemifinalScore table
-- Each judge creates one row per submission
CREATE TABLE "DCCSemifinalScore" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "konsepKreatif" INTEGER NOT NULL,
    "eksekusiDesain" INTEGER NOT NULL,
    "komunikasiVisual" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCCSemifinalScore_pkey" PRIMARY KEY ("id")
);

-- Create DCCShortVideoScore table
-- Each judge creates one row per submission
CREATE TABLE "DCCShortVideoScore" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "konsepKreatif" INTEGER NOT NULL,
    "produksiVideo" INTEGER NOT NULL,
    "penyampaianPesan" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCCShortVideoScore_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "DCCSubmission_registrationId_key" ON "DCCSubmission"("registrationId");
CREATE UNIQUE INDEX "DCCFinalScore_submissionId_judgeId_key" ON "DCCFinalScore"("submissionId", "judgeId");
CREATE UNIQUE INDEX "DCCSemifinalScore_submissionId_judgeId_key" ON "DCCSemifinalScore"("submissionId", "judgeId");
CREATE UNIQUE INDEX "DCCShortVideoScore_submissionId_judgeId_key" ON "DCCShortVideoScore"("submissionId", "judgeId");

-- Add foreign keys
ALTER TABLE "DCCSubmission" ADD CONSTRAINT "DCCSubmission_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DCCFinalScore" ADD CONSTRAINT "DCCFinalScore_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "DCCSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DCCSemifinalScore" ADD CONSTRAINT "DCCSemifinalScore_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "DCCSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DCCShortVideoScore" ADD CONSTRAINT "DCCShortVideoScore_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "DCCSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
