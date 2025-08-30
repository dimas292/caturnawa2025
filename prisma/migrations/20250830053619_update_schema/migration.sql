/*
  Warnings:

  - Added the required column `category` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegistrationFile" ADD COLUMN "memberId" TEXT;
ALTER TABLE "RegistrationFile" ADD COLUMN "originalName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Competition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "earlyBirdPrice" INTEGER NOT NULL,
    "phase1Price" INTEGER NOT NULL,
    "phase2Price" INTEGER NOT NULL,
    "earlyBirdStart" DATETIME NOT NULL,
    "earlyBirdEnd" DATETIME NOT NULL,
    "phase1Start" DATETIME NOT NULL,
    "phase1End" DATETIME NOT NULL,
    "phase2Start" DATETIME NOT NULL,
    "phase2End" DATETIME NOT NULL,
    "workUploadDeadline" DATETIME,
    "competitionDate" DATETIME,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Competition" ("competitionDate", "createdAt", "description", "earlyBirdEnd", "earlyBirdPrice", "earlyBirdStart", "id", "isActive", "maxTeamSize", "minTeamSize", "name", "phase1End", "phase1Price", "phase1Start", "phase2End", "phase2Price", "phase2Start", "type", "updatedAt", "workUploadDeadline") SELECT "competitionDate", "createdAt", "description", "earlyBirdEnd", "earlyBirdPrice", "earlyBirdStart", "id", "isActive", "maxTeamSize", "minTeamSize", "name", "phase1End", "phase1Price", "phase1Start", "phase2End", "phase2Price", "phase2Start", "type", "updatedAt", "workUploadDeadline" FROM "Competition";
DROP TABLE "Competition";
ALTER TABLE "new_Competition" RENAME TO "Competition";
CREATE UNIQUE INDEX "Competition_type_key" ON "Competition"("type");
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "faculty" TEXT,
    "studyProgram" TEXT,
    "studentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("createdAt", "faculty", "fullAddress", "fullName", "gender", "id", "institution", "studentId", "studyProgram", "updatedAt", "userId", "whatsappNumber") SELECT "createdAt", "faculty", "fullAddress", "fullName", "gender", "id", "institution", "studentId", "studyProgram", "updatedAt", "userId", "whatsappNumber" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_userId_key" ON "Participant"("userId");
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "teamName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentPhase" TEXT NOT NULL,
    "paymentAmount" INTEGER NOT NULL,
    "paymentCode" TEXT,
    "paymentProofUrl" TEXT,
    "adminNotes" TEXT,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "workTitle" TEXT,
    "workDescription" TEXT,
    "workFileUrl" TEXT,
    "workLinkUrl" TEXT,
    "verifiedAt" DATETIME,
    "rejectedAt" DATETIME,
    "verifiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registration_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("adminNotes", "competitionId", "createdAt", "id", "participantId", "paymentAmount", "paymentCode", "paymentPhase", "paymentProofUrl", "rejectedAt", "status", "teamName", "updatedAt", "verifiedAt", "verifiedBy", "workDescription", "workFileUrl", "workLinkUrl", "workTitle") SELECT "adminNotes", "competitionId", "createdAt", "id", "participantId", "paymentAmount", "paymentCode", "paymentPhase", "paymentProofUrl", "rejectedAt", "status", "teamName", "updatedAt", "verifiedAt", "verifiedBy", "workDescription", "workFileUrl", "workLinkUrl", "workTitle" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
CREATE UNIQUE INDEX "Registration_participantId_competitionId_key" ON "Registration"("participantId", "competitionId");
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMember_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("createdAt", "id", "participantId", "position", "registrationId", "role", "updatedAt") SELECT "createdAt", "id", "participantId", "position", "registrationId", "role", "updatedAt" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_registrationId_participantId_key" ON "TeamMember"("registrationId", "participantId");
CREATE UNIQUE INDEX "TeamMember_registrationId_position_key" ON "TeamMember"("registrationId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RegistrationFile_memberId_idx" ON "RegistrationFile"("memberId");
