-- Rename existing columns first to preserve data
ALTER TABLE "SPCFinalScore" RENAME COLUMN "pemaparanMateri" TO "pemaparanMateriPresentasi";
ALTER TABLE "SPCFinalScore" RENAME COLUMN "pertanyaanJawaban" TO "pertanyaanJawaban";
ALTER TABLE "SPCFinalScore" RENAME COLUMN "kesesuaianTema" TO "aspekKesesuaianTema";

-- Update column comments to reflect new criteria
COMMENT ON COLUMN "SPCFinalScore"."pemaparanMateriPresentasi" IS 'Pemaparan Materi dan Presentasi Ilmiah';
COMMENT ON COLUMN "SPCFinalScore"."pertanyaanJawaban" IS 'Pertanyaan dan Jawaban';
COMMENT ON COLUMN "SPCFinalScore"."aspekKesesuaianTema" IS 'Aspek Kesesuaian Dengan Tema';