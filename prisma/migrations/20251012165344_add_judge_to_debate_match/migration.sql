-- AlterTable
ALTER TABLE "public"."DebateMatch" ADD COLUMN     "judgeId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."DebateMatch" ADD CONSTRAINT "DebateMatch_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
