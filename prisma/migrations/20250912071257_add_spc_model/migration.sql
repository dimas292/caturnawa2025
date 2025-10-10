-- CreateEnum
CREATE TYPE "public"."SPCStage" AS ENUM ('SEMIFINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."SPCSubmissionStatus" AS ENUM ('PENDING', 'REVIEWED', 'QUALIFIED', 'NOT_QUALIFIED');

-- CreateTable
CREATE TABLE "public"."SPCSubmission" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "judulKarya" TEXT NOT NULL,
    "catatan" TEXT,
    "fileKarya" TEXT,
    "suratOrisinalitas" TEXT,
    "suratPengalihanHakCipta" TEXT,
    "status" "public"."SPCSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "evaluatedAt" TIMESTAMP(3),
    "evaluatedBy" TEXT,
    "feedback" TEXT,
    "strukturOrganisasi" INTEGER,
    "kualitasArgumen" INTEGER,
    "gayaBahasaTulis" INTEGER,
    "qualifiedToFinal" BOOLEAN NOT NULL DEFAULT false,
    "presentationOrder" INTEGER,
    "presentationTitle" TEXT,
    "scheduledTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SPCSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SPCFinalScore" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "materi" INTEGER NOT NULL,
    "penyampaian" INTEGER NOT NULL,
    "bahasa" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SPCFinalScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SPCSubmission_registrationId_key" ON "public"."SPCSubmission"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "SPCFinalScore_submissionId_judgeId_key" ON "public"."SPCFinalScore"("submissionId", "judgeId");

-- AddForeignKey
ALTER TABLE "public"."SPCSubmission" ADD CONSTRAINT "SPCSubmission_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SPCFinalScore" ADD CONSTRAINT "SPCFinalScore_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."SPCSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
