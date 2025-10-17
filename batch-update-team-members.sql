-- Batch Update TeamMembers from Spreadsheet Data
-- Generated from KDBI Sesi 1 & 2 data
-- This will update TeamMember position 2 with correct participant data

-- ============================================================
-- STEP 1: Create new Participants for all Member 2
-- ============================================================

DO $$
DECLARE
  v_reg_id TEXT;
  v_new_participant_id TEXT;
  v_competition_id TEXT;
BEGIN
  -- Get KDBI competition ID
  SELECT id INTO v_competition_id FROM "Competition" WHERE type = 'KDBI' LIMIT 1;

  -- SESI 1 - ROOM 1 (Juri 1: Kak Parwo)
  
  -- 1. Reforest (Universitas Sriwijaya) - OG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Reforest%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Naufal Abrar Abhista', 'naufal.abrar@email.com', 'MALE', '', '', 'Universitas Sriwijaya', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Naufal Abrar Abhista', email = 'naufal.abrar@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Reforest - Naufal Abrar Abhista';
  END IF;

  -- 2. Keiarin (Universitas Trisakti) - OO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Keiarin%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Andi Naurah Aurysta', 'andi.naurah@email.com', 'FEMALE', '', '', 'Universitas Trisakti', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Andi Naurah Aurysta', email = 'andi.naurah@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Keiarin - Andi Naurah Aurysta';
  END IF;

  -- 3. Wanung By Innovaung (Universitas Negeri Jakarta) - CG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Wanung%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Laras Rigita Cahyani', 'laras.rigita@email.com', 'FEMALE', '', '', 'Universitas Negeri Jakarta', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Laras Rigita Cahyani', email = 'laras.rigita@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Wanung By Innovaung - Laras Rigita Cahyani';
  END IF;

  -- 4. Capur KDMI (Universitas Indonesia) - CO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Capur%KDMI%' OR "teamName" ILIKE '%CAGUR%KDMI%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Riau Arman', 'riau.arman@email.com', 'MALE', '', '', 'Universitas Indonesia', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Riau Arman', email = 'riau.arman@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Capur/CAGUR KDMI - Riau Arman';
  END IF;

  -- SESI 1 - ROOM 2 (Juri 2: Kak Laila)
  
  -- 5. Grepek (Universitas Nasional) - OG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Grepek%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Ndayeyu Sharon Mondonggin', 'ndayeyu.sharon@email.com', 'FEMALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Ndayeyu Sharon Mondonggin', email = 'ndayeyu.sharon@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Grepek - Ndayeyu Sharon Mondonggin';
  END IF;

  -- 6. Hutan Rimba (Universitas Nasional) - OO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Hutan%Rimba%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Saifullah Anwar', 'saifullah.anwar@email.com', 'MALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Saifullah Anwar', email = 'saifullah.anwar@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Hutan Rimba - Saifullah Anwar';
  END IF;

  -- 7. Midwave Team (Universitas Nasional) - CG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Midwave%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Siti Haritza Kusuma Nuridfa', 'siti.haritza@email.com', 'FEMALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Siti Haritza Kusuma Nuridfa', email = 'siti.haritza@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Midwave Team - Siti Haritza Kusuma Nuridfa';
  END IF;

  -- 8. Jumbo Air (Universitas Nasional) - CO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Jumbo%Air%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Kayla Qonita Sulaeman', 'kayla.qonita@email.com', 'FEMALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Kayla Qonita Sulaeman', email = 'kayla.qonita@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Jumbo Air - Kayla Qonita Sulaeman';
  END IF;

  -- SESI 2 - ROOM 1 (Juri 1: Kak Lusman)
  
  -- 9. Cengkeh (Universitas Nasional) - OG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Cengkeh%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Ratu Euis Pratiwi', 'ratu.euis@email.com', 'FEMALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Ratu Euis Pratiwi', email = 'ratu.euis@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Cengkeh - Ratu Euis Pratiwi';
  END IF;

  -- 10. Mont Sainte-Victoire Series (Universitas Sriwijaya) - OO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Mont%Sainte%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Muhammad Jeri', 'muhammad.jeri@email.com', 'MALE', '', '', 'Universitas Sriwijaya', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Muhammad Jeri', email = 'muhammad.jeri@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Mont Sainte-Victoire Series - Muhammad Jeri';
  END IF;

  -- 11. Civitas Vox (Universitas Trisakti) - CG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Civitas%Vox%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Salabilla Aprianti Hermansias', 'salabilla.aprianti@email.com', 'FEMALE', '', '', 'Universitas Trisakti', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Salabilla Aprianti Hermansias', email = 'salabilla.aprianti@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Civitas Vox - Salabilla Aprianti Hermansias';
  END IF;

  -- 12. Balunijuknesia (Universitas Bangka Belitung) - CO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Balunijuknesia%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Aldy Chandra Tarigan', 'aldy.chandra@email.com', 'MALE', '', '', 'Universitas Bangka Belitung', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Aldy Chandra Tarigan', email = 'aldy.chandra@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Balunijuknesia - Aldy Chandra Tarigan';
  END IF;

  -- SESI 2 - ROOM 2 (Juri 2: Kak Laila)
  
  -- 13. Lost Contact Tapi Gak Lost Logic (Universitas Airlangga) - OG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Lost%Contact%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Farid Liu', 'farid.liu@email.com', 'MALE', '', '', 'Universitas Airlangga', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Farid Liu', email = 'farid.liu@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Lost Contact Tapi Gak Lost Logic - Farid Liu';
  END IF;

  -- 14. Cokrawala (Universitas Negeri Malang) - OO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Cokrawala%' OR "teamName" ILIKE '%Cakrawala%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Videlo Prabumel Abi', 'videlo.prabumel@email.com', 'MALE', '', '', 'Universitas Negeri Malang', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Videlo Prabumel Abi', email = 'videlo.prabumel@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Cokrawala/Cakrawala - Videlo Prabumel Abi';
  END IF;

  -- 15. Swung Team 1 - CG
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Swung%Team%1%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Siti Fayya Nur Fadillah', 'siti.fayya@email.com', 'FEMALE', '', '', '', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Siti Fayya Nur Fadillah', email = 'siti.fayya@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Swung Team 1 - Siti Fayya Nur Fadillah';
  END IF;

  -- 16. Kayu Manis (Universitas Nasional) - CO
  SELECT id INTO v_reg_id FROM "Registration" WHERE "teamName" ILIKE '%Kayu%Manis%' AND "competitionId" = v_competition_id LIMIT 1;
  IF v_reg_id IS NOT NULL THEN
    INSERT INTO "Participant" (id, "fullName", email, gender, "fullAddress", "whatsappNumber", institution, faculty, "studyProgram", "studentId", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Yulia Halimatussadiyah', 'yulia.halimatussadiyah@email.com', 'FEMALE', '', '', 'Universitas Nasional', '', '', '', NULL, NOW(), NOW())
    RETURNING id INTO v_new_participant_id;
    
    UPDATE "TeamMember" SET "participantId" = v_new_participant_id, "fullName" = 'Yulia Halimatussadiyah', email = 'yulia.halimatussadiyah@email.com', "updatedAt" = NOW()
    WHERE "registrationId" = v_reg_id AND position = 2;
    RAISE NOTICE 'Updated: Kayu Manis - Yulia Halimatussadiyah';
  END IF;

END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check updated teams
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

-- Check for remaining duplicates
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
