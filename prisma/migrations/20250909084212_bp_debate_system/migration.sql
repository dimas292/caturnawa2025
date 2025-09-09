-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'judge', 'participant');

-- CreateEnum
CREATE TYPE "public"."CompetitionType" AS ENUM ('KDBI', 'EDC', 'SPC', 'DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'VERIFIED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentPhase" AS ENUM ('EARLY_BIRD', 'PHASE_1', 'PHASE_2');

-- CreateEnum
CREATE TYPE "public"."DebateStage" AS ENUM ('PRELIMINARY', 'SEMIFINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."TeamRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'participant',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "type" "public"."CompetitionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "earlyBirdPrice" INTEGER NOT NULL,
    "phase1Price" INTEGER NOT NULL,
    "phase2Price" INTEGER NOT NULL,
    "earlyBirdStart" TIMESTAMP(3) NOT NULL,
    "earlyBirdEnd" TIMESTAMP(3) NOT NULL,
    "phase1Start" TIMESTAMP(3) NOT NULL,
    "phase1End" TIMESTAMP(3) NOT NULL,
    "phase2Start" TIMESTAMP(3) NOT NULL,
    "phase2End" TIMESTAMP(3) NOT NULL,
    "workUploadDeadline" TIMESTAMP(3),
    "competitionDate" TIMESTAMP(3),
    "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Participant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "fullAddress" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "faculty" TEXT,
    "studyProgram" TEXT,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "teamName" TEXT,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentPhase" "public"."PaymentPhase" NOT NULL,
    "paymentAmount" INTEGER NOT NULL,
    "paymentCode" TEXT,
    "paymentProofUrl" TEXT,
    "adminNotes" TEXT,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "workTitle" TEXT,
    "workDescription" TEXT,
    "workFileUrl" TEXT,
    "workLinkUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "role" "public"."TeamRole" NOT NULL DEFAULT 'MEMBER',
    "position" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "faculty" TEXT,
    "studentId" TEXT NOT NULL,
    "ktmFile" TEXT,
    "photoFile" TEXT,
    "khsFile" TEXT,
    "socialMediaProof" TEXT,
    "twibbonProof" TEXT,
    "delegationLetter" TEXT,
    "achievementsProof" TEXT,
    "pddiktiProof" TEXT,
    "instagramFollowProof" TEXT,
    "youtubeFollowProof" TEXT,
    "tiktokFollowProof" TEXT,
    "attendanceCommitmentLetter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RegistrationFile" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "originalName" TEXT,
    "memberId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DebateRound" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "stage" "public"."DebateStage" NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DebateMatch" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "matchFormat" TEXT NOT NULL DEFAULT 'BP',
    "team1Id" TEXT,
    "team2Id" TEXT,
    "team3Id" TEXT,
    "team4Id" TEXT,
    "firstPlaceTeamId" TEXT,
    "secondPlaceTeamId" TEXT,
    "thirdPlaceTeamId" TEXT,
    "fourthPlaceTeamId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DebateScore" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "judgeId" TEXT,
    "bpPosition" TEXT,
    "teamPosition" TEXT,
    "speakerRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamStanding" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "teamPoints" INTEGER NOT NULL DEFAULT 0,
    "speakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "firstPlaces" INTEGER NOT NULL DEFAULT 0,
    "secondPlaces" INTEGER NOT NULL DEFAULT 0,
    "thirdPlaces" INTEGER NOT NULL DEFAULT 0,
    "fourthPlaces" INTEGER NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prelimTeamPoints" INTEGER NOT NULL DEFAULT 0,
    "prelimSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prelimAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "semifinalTeamPoints" INTEGER NOT NULL DEFAULT 0,
    "semifinalSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "semifinalAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalTeamPoints" INTEGER NOT NULL DEFAULT 0,
    "finalSpeakerPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAvgPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_type_key" ON "public"."Competition"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_key" ON "public"."Participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_participantId_competitionId_key" ON "public"."Registration"("participantId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_registrationId_position_key" ON "public"."TeamMember"("registrationId", "position");

-- CreateIndex
CREATE INDEX "RegistrationFile_registrationId_fileType_idx" ON "public"."RegistrationFile"("registrationId", "fileType");

-- CreateIndex
CREATE INDEX "RegistrationFile_memberId_idx" ON "public"."RegistrationFile"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "DebateRound_competitionId_stage_roundNumber_key" ON "public"."DebateRound"("competitionId", "stage", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DebateMatch_roundId_matchNumber_key" ON "public"."DebateMatch"("roundId", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DebateScore_matchId_participantId_key" ON "public"."DebateScore"("matchId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamStanding_registrationId_key" ON "public"."TeamStanding"("registrationId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistrationFile" ADD CONSTRAINT "RegistrationFile_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateRound" ADD CONSTRAINT "DebateRound_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."DebateRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team3Id_fkey" FOREIGN KEY ("team3Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_team4Id_fkey" FOREIGN KEY ("team4Id") REFERENCES "public"."Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateScore" ADD CONSTRAINT "DebateScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."DebateMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DebateScore" ADD CONSTRAINT "DebateScore_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamStanding" ADD CONSTRAINT "TeamStanding_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

