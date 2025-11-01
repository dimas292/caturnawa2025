
BEGIN;

ALTER TABLE "SPCFinalScore"
ADD COLUMN "pemaparanMateriPresentasi_new" INT,
ADD COLUMN "aspekKesesuaianTema_new" INT;

UPDATE "SPCFinalScore"
SET 
    "pemaparanMateriPresentasi_new" = "pemaparanMateri",
    "aspekKesesuaianTema_new" = "kesesuaianTema";

ALTER TABLE "SPCFinalScore"
DROP COLUMN "pemaparanMateri",
DROP COLUMN "kesesuaianTema";

ALTER TABLE "SPCFinalScore"
RENAME COLUMN "pemaparanMateriPresentasi_new" TO "pemaparanMateriPresentasi";

ALTER TABLE "SPCFinalScore"
RENAME COLUMN "aspekKesesuaianTema_new" TO "aspekKesesuaianTema";

COMMENT ON COLUMN "SPCFinalScore"."pemaparanMateriPresentasi" IS 'Pemaparan Materi dan Presentasi Ilmiah';
COMMENT ON COLUMN "SPCFinalScore"."pertanyaanJawaban" IS 'Pertanyaan dan Jawaban';
COMMENT ON COLUMN "SPCFinalScore"."aspekKesesuaianTema" IS 'Aspek Kesesuaian Dengan Tema';


-- Verification queries (run these after the migration):
-- SELECT COUNT(*) FROM "SPCFinalScore";
-- SELECT COUNT(*) FROM "SPCFinalScore_backup";
-- 
SELECT 
    s.id,
    s."pemaparanMateriPresentasi",
    b."pemaparanMateri",
    s."aspekKesesuaianTema",
    b."kesesuaianTema"
FROM "SPCFinalScore" s
JOIN "SPCFinalScore_backup" b ON s.id = b.id
LIMIT 5;