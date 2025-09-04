/*
  Warnings:

  - You are about to drop the column `attendanceCommitmentLetter` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `delegationLetter` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `socialMediaProof` on the `TeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TeamMember" DROP COLUMN "attendanceCommitmentLetter",
DROP COLUMN "delegationLetter",
DROP COLUMN "socialMediaProof";
