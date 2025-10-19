-- ============================================
-- DCC SYSTEM DIAGNOSTIC CHECK
-- ============================================

-- 1. Check if DCC tables exist
SELECT 
    'TABLE CHECK' as check_type,
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        ) THEN 'EXISTS ✓'
        ELSE 'MISSING ✗'
    END as status
FROM (
    VALUES 
        ('DCCSubmission'),
        ('DCCFinalScore'),
        ('DCCSemifinalScore'),
        ('DCCShortVideoScore')
) AS t(table_name);

-- 2. Check if DCC enums exist
SELECT 
    'ENUM CHECK' as check_type,
    enumtypid::regtype AS enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) AS enum_values
FROM pg_enum
WHERE enumtypid::regtype::text IN ('DCCSubmissionStatus', 'DCCStage')
GROUP BY enumtypid;

-- 3. Check DCC Competitions
SELECT 
    'COMPETITION CHECK' as check_type,
    id,
    type,
    name,
    "isActive",
    "workUploadDeadline"
FROM "Competition"
WHERE type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')
ORDER BY type;

-- 4. Check DCC Registrations
SELECT 
    'REGISTRATION CHECK' as check_type,
    r.id as registration_id,
    u.email as user_email,
    u.name as user_name,
    c.type as competition_type,
    r.status as registration_status,
    r."verifiedAt",
    CASE 
        WHEN r.status = 'VERIFIED' THEN 'CAN UPLOAD ✓'
        ELSE 'CANNOT UPLOAD ✗ (Status: ' || r.status || ')'
    END as upload_eligibility
FROM "Registration" r
JOIN "Participant" p ON r."participantId" = p.id
JOIN "users" u ON p."userId" = u.id
JOIN "Competition" c ON r."competitionId" = c.id
WHERE c.type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')
ORDER BY r."createdAt" DESC;

-- 5. Check if DCCSubmission table exists and count submissions
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'DCCSubmission'
    ) THEN
        RAISE NOTICE 'DCCSubmission table exists';
        
        -- Count submissions
        EXECUTE '
            SELECT 
                ''SUBMISSION CHECK'' as check_type,
                COUNT(*) as total_submissions,
                COUNT(CASE WHEN status = ''PENDING'' THEN 1 END) as pending,
                COUNT(CASE WHEN status = ''REVIEWED'' THEN 1 END) as reviewed,
                COUNT(CASE WHEN status = ''QUALIFIED'' THEN 1 END) as qualified,
                COUNT(CASE WHEN status = ''NOT_QUALIFIED'' THEN 1 END) as not_qualified
            FROM "DCCSubmission"
        ';
    ELSE
        RAISE NOTICE 'DCCSubmission table DOES NOT EXIST - This is why upload fails!';
    END IF;
END $$;

-- 6. Check users with participant role
SELECT 
    'USER CHECK' as check_type,
    u.id,
    u.email,
    u.name,
    u.role,
    CASE 
        WHEN p.id IS NOT NULL THEN 'HAS PARTICIPANT PROFILE ✓'
        ELSE 'NO PARTICIPANT PROFILE ✗'
    END as participant_status
FROM "users" u
LEFT JOIN "Participant" p ON u.id = p."userId"
WHERE u.role = 'participant'
ORDER BY u."createdAt" DESC
LIMIT 10;

-- 7. Check test user specifically
SELECT 
    'TEST USER CHECK' as check_type,
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    p.id as participant_id,
    p."fullName",
    p.institution
FROM "users" u
LEFT JOIN "Participant" p ON u.id = p."userId"
WHERE u.email = 'testdcc@example.com';

-- 8. Check test user's registrations
SELECT 
    'TEST USER REGISTRATION' as check_type,
    r.id as registration_id,
    c.type as competition,
    r.status,
    r."paymentPhase",
    r."paymentAmount",
    r."verifiedAt",
    CASE 
        WHEN r.status = 'VERIFIED' THEN 'READY TO UPLOAD ✓'
        ELSE 'NOT READY ✗'
    END as ready_status
FROM "Registration" r
JOIN "Participant" p ON r."participantId" = p.id
JOIN "users" u ON p."userId" = u.id
JOIN "Competition" c ON r."competitionId" = c.id
WHERE u.email = 'testdcc@example.com';

-- 9. Summary Report
SELECT 
    'SUMMARY' as report_type,
    (SELECT COUNT(*) FROM "Competition" WHERE type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')) as dcc_competitions,
    (SELECT COUNT(*) FROM "Registration" r 
     JOIN "Competition" c ON r."competitionId" = c.id 
     WHERE c.type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')) as total_registrations,
    (SELECT COUNT(*) FROM "Registration" r 
     JOIN "Competition" c ON r."competitionId" = c.id 
     WHERE c.type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO') 
     AND r.status = 'VERIFIED') as verified_registrations,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'DCCSubmission')
        THEN 'TABLE EXISTS ✓'
        ELSE 'TABLE MISSING ✗ - UPLOAD WILL FAIL'
    END as dcc_submission_table_status;

-- 10. Diagnostic Conclusion
DO $$
DECLARE
    table_exists boolean;
    verified_count integer;
BEGIN
    -- Check if DCCSubmission table exists
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'DCCSubmission'
    ) INTO table_exists;
    
    -- Count verified registrations
    SELECT COUNT(*) INTO verified_count
    FROM "Registration" r
    JOIN "Competition" c ON r."competitionId" = c.id
    WHERE c.type IN ('DCC_INFOGRAFIS', 'DCC_SHORT_VIDEO')
    AND r.status = 'VERIFIED';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC CONCLUSION';
    RAISE NOTICE '========================================';
    
    IF NOT table_exists THEN
        RAISE NOTICE '❌ CRITICAL: DCCSubmission table does not exist';
        RAISE NOTICE '   This is why DCC upload returns 400 error';
        RAISE NOTICE '   Solution: Run create-dcc-tables.sql';
    ELSE
        RAISE NOTICE '✓ DCCSubmission table exists';
    END IF;
    
    IF verified_count > 0 THEN
        RAISE NOTICE '✓ Found % verified DCC registration(s)', verified_count;
    ELSE
        RAISE NOTICE '⚠ No verified DCC registrations found';
        RAISE NOTICE '   Users need VERIFIED status to upload';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;
