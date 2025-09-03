/*
  Warnings:

  - You are about to drop the column `achievementsProof` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `pddiktiProof` on the `TeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TeamMember" DROP COLUMN "achievementsProof",
DROP COLUMN "pddiktiProof";
