-- SQL Script: Update TeamMember Only (Simple Version)
-- Use this if you just want to update the TeamMember record
-- without creating new Participants

-- ============================================================
-- OPTION 1: Update TeamMember with existing Participant ID
-- ============================================================
-- Use this if you already know the correct participantId

UPDATE "TeamMember"
SET "participantId" = 'EXISTING_PARTICIPANT_ID',  -- Replace with actual participant ID
    "fullName" = 'Nama Member 2',                 -- Update name
    email = 'email@member2.com',                  -- Update email
    phone = '08123456789',                        -- Update phone
    institution = 'Universitas XYZ',              -- Update institution
    faculty = 'Fakultas ABC',                     -- Update faculty
    "studentId" = '123456',                       -- Update student ID
    "updatedAt" = NOW()
WHERE "registrationId" = 'REGISTRATION_ID'        -- Replace with registration ID
  AND position = 2;                               -- Update position 2 (member 2)


-- ============================================================
-- OPTION 2: Update TeamMember with data from another team
-- ============================================================
-- Use this if you want to copy participant from another registration

UPDATE "TeamMember" tm
SET "participantId" = (
      SELECT tm2."participantId" 
      FROM "TeamMember" tm2 
      JOIN "Registration" r2 ON r2.id = tm2."registrationId"
      WHERE r2."teamName" = 'SOURCE_TEAM_NAME'  -- Team to copy from
        AND tm2.position = 1                     -- Copy from leader
      LIMIT 1
    ),
    "fullName" = 'Nama Member 2',
    email = 'email@member2.com',
    "updatedAt" = NOW()
WHERE tm."registrationId" = (
      SELECT id FROM "Registration" WHERE "teamName" = 'TARGET_TEAM_NAME'
    )
  AND tm.position = 2;


-- ============================================================
-- OPTION 3: Batch update - Just change the name/data
-- ============================================================
-- Use this if participantId is already correct, just update the details

UPDATE "TeamMember"
SET "fullName" = 'Nama Baru Member 2',
    email = 'emailbaru@member2.com',
    phone = '08199999999',
    "updatedAt" = NOW()
WHERE "registrationId" IN (
      SELECT id FROM "Registration" 
      WHERE "teamName" IN ('Team A', 'Team B', 'Team C')  -- List teams to update
    )
  AND position = 2;


-- ============================================================
-- HELPER QUERIES
-- ============================================================

-- 1. Find registration ID by team name
SELECT id, "teamName", "competitionId"
FROM "Registration"
WHERE "teamName" = 'Balunijuknesia';

-- 2. See current TeamMember data for a team
SELECT 
  tm.id,
  tm."registrationId",
  tm."participantId",
  tm.position,
  tm."fullName",
  tm.email,
  tm.phone,
  p."fullName" as participant_name
FROM "TeamMember" tm
JOIN "Registration" r ON r.id = tm."registrationId"
LEFT JOIN "Participant" p ON p.id = tm."participantId"
WHERE r."teamName" = 'Balunijuknesia'
ORDER BY tm.position;

-- 3. Find all teams with duplicate participants
SELECT 
  r."teamName",
  tm."participantId",
  COUNT(*) as duplicate_count,
  STRING_AGG(tm.position::text, ', ') as positions,
  STRING_AGG(tm."fullName", ' | ') as names
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
WHERE r."competitionId" IN (
  SELECT id FROM "Competition" WHERE type IN ('KDBI', 'EDC')
)
GROUP BY r."teamName", tm."participantId"
HAVING COUNT(*) > 1
ORDER BY r."teamName";

-- 4. Verify after update
SELECT 
  r."teamName",
  tm.position,
  tm."participantId",
  tm."fullName" as team_member_name,
  p."fullName" as participant_name,
  tm.email
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
LEFT JOIN "Participant" p ON p.id = tm."participantId"
WHERE r."teamName" = 'Balunijuknesia'
ORDER BY tm.position;
