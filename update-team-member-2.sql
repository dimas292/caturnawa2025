-- SQL Script to Update Team Member 2 with Correct Participant Data
-- This script will:
-- 1. Create new Participant for member 2
-- 2. Update TeamMember (position 2) to use the new participant
--
-- USAGE:
-- 1. Replace the placeholder values with actual data
-- 2. Run this for each team that needs fixing
-- 3. Execute in PostgreSQL database

-- ============================================================
-- EXAMPLE: Update Member 2 for Team "Balunijuknesia"
-- ============================================================

-- Step 1: Find the registration ID and current duplicate participant
-- SELECT 
--   r.id as registration_id,
--   r."teamName",
--   tm.id as team_member_id,
--   tm."participantId",
--   tm.position,
--   p."fullName"
-- FROM "Registration" r
-- JOIN "TeamMember" tm ON tm."registrationId" = r.id
-- JOIN "Participant" p ON p.id = tm."participantId"
-- WHERE r."teamName" = 'Balunijuknesia'
-- ORDER BY tm.position;

-- Step 2: Create new Participant for Member 2
-- INSERT INTO "Participant" (
--   id,
--   "fullName",
--   email,
--   gender,
--   "fullAddress",
--   "whatsappNumber",
--   institution,
--   faculty,
--   "studyProgram",
--   "studentId",
--   "userId",
--   "createdAt",
--   "updatedAt"
-- ) VALUES (
--   gen_random_uuid()::text,  -- Generate new ID
--   'NAMA MEMBER 2',           -- Replace with actual name
--   'member2@email.com',       -- Replace with actual email
--   'MALE',                    -- Replace: MALE or FEMALE
--   'Alamat lengkap',          -- Replace with actual address
--   '08123456789',             -- Replace with actual phone
--   'Universitas XYZ',         -- Replace with actual institution
--   'Fakultas ABC',            -- Replace with actual faculty
--   'Program Studi DEF',       -- Replace with actual study program
--   '123456789',               -- Replace with actual student ID
--   NULL,                      -- No user account needed
--   NOW(),
--   NOW()
-- )
-- RETURNING id;  -- Save this ID for next step

-- Step 3: Update TeamMember (position 2) with new participant
-- UPDATE "TeamMember"
-- SET "participantId" = 'NEW_PARTICIPANT_ID_FROM_STEP_2',
--     "fullName" = 'NAMA MEMBER 2',
--     email = 'member2@email.com',
--     phone = '08123456789',
--     institution = 'Universitas XYZ',
--     faculty = 'Fakultas ABC',
--     "studentId" = '123456789',
--     "updatedAt" = NOW()
-- WHERE "registrationId" = 'REGISTRATION_ID_FROM_STEP_1'
--   AND position = 2;


-- ============================================================
-- BATCH UPDATE TEMPLATE (For Multiple Teams)
-- ============================================================

-- You can use this template to update multiple teams at once
-- Just duplicate the block for each team

DO $$
DECLARE
  v_registration_id TEXT;
  v_new_participant_id TEXT;
BEGIN
  -- Team 1: Balunijuknesia
  -- Find registration ID
  SELECT id INTO v_registration_id 
  FROM "Registration" 
  WHERE "teamName" = 'Balunijuknesia' 
  LIMIT 1;
  
  -- Create new participant for member 2
  INSERT INTO "Participant" (
    id, "fullName", email, gender, "fullAddress", "whatsappNumber",
    institution, faculty, "studyProgram", "studentId", "userId",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::text,
    'NAMA MEMBER 2 TEAM BALUNIJUKNESIA',  -- GANTI INI
    'member2.balunijuknesia@email.com',   -- GANTI INI
    'MALE',                                -- GANTI INI
    'Alamat member 2',                     -- GANTI INI
    '08123456789',                         -- GANTI INI
    'Universitas XYZ',                     -- GANTI INI
    'Fakultas ABC',                        -- GANTI INI
    'Program Studi',                       -- GANTI INI
    '123456789',                           -- GANTI INI
    NULL,
    NOW(),
    NOW()
  ) RETURNING id INTO v_new_participant_id;
  
  -- Update TeamMember position 2
  UPDATE "TeamMember"
  SET "participantId" = v_new_participant_id,
      "fullName" = 'NAMA MEMBER 2 TEAM BALUNIJUKNESIA',  -- GANTI INI
      email = 'member2.balunijuknesia@email.com',        -- GANTI INI
      phone = '08123456789',                             -- GANTI INI
      institution = 'Universitas XYZ',                   -- GANTI INI
      faculty = 'Fakultas ABC',                          -- GANTI INI
      "studentId" = '123456789',                         -- GANTI INI
      "updatedAt" = NOW()
  WHERE "registrationId" = v_registration_id
    AND position = 2;
  
  RAISE NOTICE 'Updated team: Balunijuknesia';
  
  -- Repeat for other teams...
  -- Team 2: CAGUR KDMI
  -- SELECT id INTO v_registration_id FROM "Registration" WHERE "teamName" = 'CAGUR KDMI' LIMIT 1;
  -- ... (copy the block above and change the values)
  
END $$;


-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this after update to verify the changes

SELECT 
  r.id as registration_id,
  r."teamName",
  r."competitionId",
  tm.position,
  tm."participantId",
  p."fullName" as participant_name,
  tm."fullName" as team_member_name,
  tm.email
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
JOIN "Participant" p ON p.id = tm."participantId"
WHERE r."competitionId" IN (
  SELECT id FROM "Competition" WHERE type IN ('KDBI', 'EDC')
)
ORDER BY r."teamName", tm.position;

-- Check for remaining duplicates
SELECT 
  r."teamName",
  tm."participantId",
  COUNT(*) as count,
  STRING_AGG(tm.position::text, ', ') as positions
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
WHERE r."competitionId" IN (
  SELECT id FROM "Competition" WHERE type IN ('KDBI', 'EDC')
)
GROUP BY r."teamName", tm."participantId"
HAVING COUNT(*) > 1
ORDER BY r."teamName";
