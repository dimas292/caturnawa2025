-- Update SPCFinalScore table column names
ALTER TABLE "SPCFinalScore" RENAME COLUMN "pemaparanMateri" TO "pemaparanMateriPresentasi";
ALTER TABLE "SPCFinalScore" RENAME COLUMN "kesesuaianTema" TO "aspekKesesuaianTema";

-- Update column descriptions
COMMENT ON COLUMN "SPCFinalScore"."pemaparanMateriPresentasi" IS 'Pemaparan Materi dan Presentasi Ilmiah';
COMMENT ON COLUMN "SPCFinalScore"."pertanyaanJawaban" IS 'Pertanyaan dan Jawaban';
COMMENT ON COLUMN "SPCFinalScore"."aspekKesesuaianTema" IS 'Aspek Kesesuaian Dengan Tema';