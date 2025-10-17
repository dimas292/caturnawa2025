-- Update work upload deadline untuk SPC dan DCC menjadi 21 Oktober 2025
-- Script ini akan mengupdate langsung di database tanpa perlu re-seed

-- Update SPC (Speech Competition)
UPDATE "Competition"
SET 
    "workUploadDeadline" = '2025-10-21 23:59:59',
    "updatedAt" = NOW()
WHERE "type" = 'SPC';

-- Update DCC Infografis
UPDATE "Competition"
SET 
    "workUploadDeadline" = '2025-10-21 23:59:59',
    "updatedAt" = NOW()
WHERE "type" = 'DCC_INFOGRAFIS';

-- Update DCC Short Video
UPDATE "Competition"
SET 
    "workUploadDeadline" = '2025-10-21 23:59:59',
    "updatedAt" = NOW()
WHERE "type" = 'DCC_SHORT_VIDEO';

-- Verifikasi hasil update
SELECT 
    "type" as "Competition Type",
    "shortName" as "Short Name",
    "workUploadDeadline" as "Work Upload Deadline",
    "competitionDate" as "Competition Date",
    "updatedAt" as "Last Updated"
FROM "Competition"
WHERE "type" IN ('SPC', 'DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')
ORDER BY "type";
