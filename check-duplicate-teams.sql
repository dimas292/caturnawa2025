-- Check which teams have duplicate participants vs correct data
-- Run this to identify which teams actually need fixing

-- ============================================================
-- Query 1: Find teams with DUPLICATE participants
-- ============================================================
SELECT 
  r."teamName",
  tm."participantId",
  COUNT(*) as position_count,
  STRING_AGG(tm."fullName", ' | ' ORDER BY tm.position) as member_names,
  STRING_AGG(tm.position::text, ', ' ORDER BY tm.position) as positions
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
WHERE r."competitionId" IN (SELECT id FROM "Competition" WHERE type = 'KDBI')
GROUP BY r."teamName", tm."participantId"
HAVING COUNT(*) > 1
ORDER BY r."teamName";

-- If this returns rows = Teams with DUPLICATE participants (need fixing)
-- If this returns 0 rows = All teams have correct data (no fixing needed)

-- ============================================================
-- Query 2: See all team members with their participant details
-- ============================================================
SELECT 
  r."teamName",
  tm.position,
  tm."participantId",
  tm."fullName" as team_member_name,
  tm.email as team_member_email,
  p."fullName" as participant_name,
  p.email as participant_email,
  CASE 
    WHEN tm."participantId" = LAG(tm."participantId") OVER (PARTITION BY r.id ORDER BY tm.position) 
    THEN '❌ DUPLICATE'
    ELSE '✅ OK'
  END as status
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
LEFT JOIN "Participant" p ON p.id = tm."participantId"
WHERE r."competitionId" IN (SELECT id FROM "Competition" WHERE type = 'KDBI')
ORDER BY r."teamName", tm.position;

-- ============================================================
-- Query 3: Count teams by status
-- ============================================================
WITH team_status AS (
  SELECT 
    r.id,
    r."teamName",
    COUNT(DISTINCT tm."participantId") as unique_participants,
    COUNT(*) as total_members
  FROM "Registration" r
  JOIN "TeamMember" tm ON tm."registrationId" = r.id
  WHERE r."competitionId" IN (SELECT id FROM "Competition" WHERE type = 'KDBI')
  GROUP BY r.id, r."teamName"
)
SELECT 
  CASE 
    WHEN unique_participants = total_members THEN '✅ Correct (2 different participants)'
    WHEN unique_participants = 1 THEN '❌ Duplicate (same participant)'
    ELSE '⚠️ Other issue'
  END as status,
  COUNT(*) as team_count,
  STRING_AGG("teamName", ', ') as teams
FROM team_status
GROUP BY 
  CASE 
    WHEN unique_participants = total_members THEN '✅ Correct (2 different participants)'
    WHEN unique_participants = 1 THEN '❌ Duplicate (same participant)'
    ELSE '⚠️ Other issue'
  END;
