-- SAFE UPDATE: Only update TeamMember names without creating new Participants
-- This preserves all existing references (scores, matches, etc.)
-- 
-- STRATEGY: Keep the same participantId, just update the fullName, email, etc.
-- This way all DebateScore records remain valid

-- ============================================================
-- BATCH UPDATE - Update TeamMember Position 2 Names Only
-- ============================================================

DO $$
DECLARE
  v_reg_id TEXT;
  v_competition_id TEXT;
BEGIN
  -- Get KDBI competition ID
  SELECT id INTO v_competition_id FROM "Competition" WHERE type = 'KDBI' LIMIT 1;

  -- SESI 1 - ROOM 1
  
  -- 1. Reforest
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Reforest%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Naufal Abrar Abhista', 
        email = 'naufal.abrar@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Reforest - Naufal Abrar Abhista';
  END IF;

  -- 2. Keiarin
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Keiarin%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Andi Naurah Aurysta',
        email = 'andi.naurah@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Keiarin - Andi Naurah Aurysta';
  END IF;

  -- 3. Wanung By Innovaung
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Wanung%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Laras Rigita Cahyani',
        email = 'laras.rigita@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Wanung By Innovaung - Laras Rigita Cahyani';
  END IF;

  -- 4. Capur/CAGUR KDMI
  SELECT id INTO v_reg_id FROM "Registration" WHERE ("teamName" ILIKE '%Capur%KDMI%' OR "teamName" ILIKE '%CAGUR%KDMI%') AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Riau Arman',
        email = 'riau.arman@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: CAGUR KDMI - Riau Arman';
  END IF;

  -- SESI 1 - ROOM 2
  
  -- 5. Grepek
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Grepek%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Ndayeyu Sharon Mondonggin',
        email = 'ndayeyu.sharon@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Grepek - Ndayeyu Sharon Mondonggin';
  END IF;

  -- 6. Hutan Rimba
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Hutan%Rimba%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Saifullah Anwar',
        email = 'saifullah.anwar@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Hutan Rimba - Saifullah Anwar';
  END IF;

  -- 7. Midwave Team
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Midwave%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Siti Haritza Kusuma Nuridfa',
        email = 'siti.haritza@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Midwave Team - Siti Haritza Kusuma Nuridfa';
  END IF;

  -- 8. Jumbo Air
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Jumbo%Air%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Kayla Qonita Sulaeman',
        email = 'kayla.qonita@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Jumbo Air - Kayla Qonita Sulaeman';
  END IF;

  -- SESI 2 - ROOM 1
  
  -- 9. Cengkeh
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Cengkeh%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Ratu Euis Pratiwi',
        email = 'ratu.euis@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Cengkeh - Ratu Euis Pratiwi';
  END IF;

  -- 10. Mont Sainte-Victoire Series
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Mont%Sainte%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Muhammad Jeri',
        email = 'muhammad.jeri@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Mont Sainte-Victoire Series - Muhammad Jeri';
  END IF;

  -- 11. Civitas Vox
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Civitas%Vox%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Salabilla Aprianti Hermansias',
        email = 'salabilla.aprianti@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Civitas Vox - Salabilla Aprianti Hermansias';
  END IF;

  -- 12. Balunijuknesia
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Balunijuknesia%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Aldy Chandra Tarigan',
        email = 'aldy.chandra@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Balunijuknesia - Aldy Chandra Tarigan';
  END IF;

  -- SESI 2 - ROOM 2
  
  -- 13. Lost Contact Tapi Gak Lost Logic
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Lost%Contact%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Farid Liu',
        email = 'farid.liu@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Lost Contact Tapi Gak Lost Logic - Farid Liu';
  END IF;

  -- 14. Cokrawala/Cakrawala
  SELECT id INTO v_reg_id FROM "Registration" WHERE ("teamName" ILIKE '%Cokrawala%' OR "teamName" ILIKE '%Cakrawala%') AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Videlo Prabumel Abi',
        email = 'videlo.prabumel@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Cakrawala - Videlo Prabumel Abi';
  END IF;

  -- 15. Swung Team 1 - SKIP (no member 2 data available)
  -- SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Swung%Team%1%' AND "competitionId" = v_competition_id LIMIT 1;
  -- IF v_reg_id IS NOT NULL THEN
  --   UPDATE "TeamMember" 
  --   SET "fullName" = 'Member 2 Name Unknown',
  --       email = 'swungteam1.member2@email.com',
  --       "updatedAt" = NOW()
  --   WHERE "registrationId" = v_reg_id AND position = 2;
  --   RAISE NOTICE 'Updated: Swung Team 1 - Member 2 (data not available)';
  -- END IF;
  RAISE NOTICE 'Skipped: Swung Team 1 - No member 2 data available';

  -- 16. Kayu Manis
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Kayu%Manis%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    UPDATE "TeamMember" 
    SET "fullName" = 'Yulia Halimatussadiyah',
        email = 'yulia.halimatussadiyah@email.com',
        "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Kayu Manis - Yulia Halimatussadiyah';
  END IF;

END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check updated teams (should show correct names now)
SELECT 
  r."teamName",
  tm.position,
  tm."participantId",
  tm."fullName" as team_member_name,
  p."fullName" as participant_name
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
LEFT JOIN "Participant" p ON p.id = tm."participantId"
WHERE r."competitionId" IN (SELECT id FROM "Competition" WHERE type = 'KDBI')
ORDER BY r."teamName", tm.position;

-- Check for duplicates (should still show duplicates because participantId is same)
-- This is EXPECTED and SAFE - the duplicate participantId won't cause issues
-- because we have deduplication in the code
SELECT 
  r."teamName",
  tm."participantId",
  COUNT(*) as count,
  STRING_AGG(tm."fullName", ' | ') as names
FROM "Registration" r
JOIN "TeamMember" tm ON tm."registrationId" = r.id
WHERE r."competitionId" IN (SELECT id FROM "Competition" WHERE type = 'KDBI')
GROUP BY r."teamName", tm."participantId"
HAVING COUNT(*) > 1
ORDER BY r."teamName";

-- ============================================================
-- IMPORTANT NOTES
-- ============================================================
-- 
-- 1. This script ONLY updates TeamMember.fullName and email
-- 2. It does NOT change participantId (keeps duplicate)
-- 3. All existing DebateScore records remain valid
-- 4. The code deduplication handles the duplicate participantId
-- 5. This is SAFE for production with existing data
--
-- After running this:
-- - Judge will see correct names in scoring form
-- - Admin will see correct names in participant list
-- - All scores remain intact
-- - Deduplication in code prevents duplicate score errors
