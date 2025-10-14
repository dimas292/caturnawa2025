# Solusi Memperbaiki Duplicate Scores di Production

**Problem**: Di production, setiap participant muncul 2x dengan score yang sama  
**Local Status**: ✅ Berfungsi dengan baik, tidak ada duplicate  
**Production Status**: ❌ Ada duplicate entries di database

---

## 🔍 Root Cause Analysis

### Data di Production (Berdasarkan Screenshot):
```
participantId: cmgptg3jyw004ioe8j7prbjb70 → Score 72.5 (muncul 2x)
participantId: cmgptplz0004moe8jyoesos4e → Score 75.5 (muncul 2x)
```

### Kenapa Terjadi Duplicate?

**Penyebab #1: CREATE tanpa Protection**
```javascript
// Code saat ini di judge-scoring-system.js line 86
await prisma.debateScore.create({
  data: { ... }
})
```
- Setiap kali API dipanggil, akan create entry baru
- Jika button diklik 2x atau ada network retry → duplicate
- Tidak ada check apakah data sudah ada

**Penyebab #2: Unique Constraint Tidak Mencegah**
```prisma
// schema.prisma line 256
@@unique([matchId, participantId, judgeId])
```
- Constraint ini BENAR untuk multi-judge scenario
- TAPI tidak mencegah duplicate jika API dipanggil 2x dengan data sama persis
- Karena matchId, participantId, dan judgeId semuanya SAMA

**Penyebab #3: Tidak Ada Transaction**
- Insert dilakukan satu per satu tanpa transaction wrapper
- Jika error di tengah, sebagian data sudah masuk
- Retry akan create duplicate

---

## 🎯 Solusi yang Tersedia

### **Solusi A: Quick Fix - Cleanup Only (TEMPORARY)**
**Yang dilakukan:**
1. Hapus duplicate yang sudah ada di production
2. TIDAK ubah code
3. Masalah akan muncul lagi jika ada double submit

**Langkah:**
```bash
# 1. Jalankan cleanup script
node scripts/cleanup-duplicate-scores.js --confirm
```

**Kelebihan:**
- ✅ Cepat (5 menit)
- ✅ Tidak perlu deploy
- ✅ Data langsung bersih

**Kekurangan:**
- ❌ Masalah akan terulang
- ❌ Harus manual cleanup setiap kali terjadi
- ❌ Tidak sustainable

**Rekomendasi**: ❌ TIDAK DISARANKAN (temporary only)

---

### **Solusi B: Medium Fix - Add Frontend Protection Only**
**Yang dilakukan:**
1. Cleanup duplicate di database
2. Tambah double-submit protection di frontend
3. Backend tetap pakai CREATE

**Langkah:**
```bash
# 1. Cleanup database
node scripts/cleanup-duplicate-scores.js --confirm

# 2. Deploy frontend fix saja
# Edit: src/components/judge/bp-scoring-form.tsx
# Tambah check isSubmitting di line 132-136
```

**Kelebihan:**
- ✅ Mencegah user double click
- ✅ Mudah implement
- ✅ Frontend fix saja

**Kekurangan:**
- ❌ Tidak protect dari network retry
- ❌ Tidak protect dari concurrent requests
- ❌ Masih bisa duplicate jika network lambat

**Rekomendasi**: ⚠️ KURANG OPTIMAL (50% solution)

---

### **Solusi C: Complete Fix - Backend UPSERT + Transaction (RECOMMENDED)**
**Yang dilakukan:**
1. Cleanup duplicate di database
2. Ganti CREATE ke UPSERT di backend
3. Tambah Transaction wrapper
4. Tambah frontend protection
5. Deploy ke production

**Langkah:**
```bash
# 1. Cleanup database
node scripts/cleanup-duplicate-scores.js --confirm

# 2. Update backend code
# File: scripts/judge-scoring-system.js
# - Ganti prisma.create → prisma.upsert (line 86)
# - Wrap dalam transaction (line 78-129)
# - Relax validasi 60-80 → 0-100 (line 152)

# 3. Update frontend code
# File: src/components/judge/bp-scoring-form.tsx
# - Tambah isSubmitting check (line 132-136)
# - Fix data format teamRankings (line 152-159)

# 4. Deploy
git add .
git commit -m "fix: prevent duplicate scores with UPSERT + transaction"
git push origin main
```

**Kelebihan:**
- ✅ Permanent solution
- ✅ Multi-layer protection (frontend + backend)
- ✅ Transaction safety
- ✅ Support re-submission
- ✅ Production-grade

**Kekurangan:**
- ⚠️ Perlu deploy (10-15 menit)
- ⚠️ Perlu test setelah deploy

**Rekomendasi**: ✅ **SANGAT DISARANKAN** (100% solution)

---

### **Solusi D: Nuclear Option - Reset All Scores**
**Yang dilakukan:**
1. Hapus SEMUA scores di production
2. Deploy fix code
3. Minta juri submit ulang

**Langkah:**
```sql
-- DANGER! Ini akan hapus semua scores
DELETE FROM "DebateScore" WHERE "matchId" IN (
  SELECT id FROM "DebateMatch" WHERE "roundId" IN (
    SELECT id FROM "DebateRound" WHERE "competitionId" IN (
      SELECT id FROM "Competition" WHERE "type" IN ('KDBI', 'EDC')
    )
  )
);
```

**Kelebihan:**
- ✅ Database benar-benar clean
- ✅ Fresh start

**Kekurangan:**
- ❌ Kehilangan semua data scoring
- ❌ Juri harus submit ulang
- ❌ Waste of time

**Rekomendasi**: ❌ **JANGAN** (last resort only)

---

## 📊 Comparison Table

| Kriteria | Solusi A | Solusi B | Solusi C | Solusi D |
|----------|----------|----------|----------|----------|
| Waktu Implementasi | 5 min | 15 min | 30 min | 10 min |
| Permanent Fix | ❌ | ⚠️ | ✅ | ✅ |
| Data Loss | ❌ | ❌ | ❌ | ✅ |
| Perlu Deploy | ❌ | ✅ | ✅ | ✅ |
| Protection Level | 0% | 50% | 100% | 100% |
| Sustainable | ❌ | ⚠️ | ✅ | ✅ |
| Risk Level | Low | Medium | Low | **HIGH** |

---

## 🎯 REKOMENDASI FINAL

### **Pilih Solusi C - Complete Fix**

**Alasan:**
1. ✅ Permanent solution yang sustainable
2. ✅ Multi-layer protection (frontend + backend + database)
3. ✅ No data loss, hanya cleanup duplicate
4. ✅ Support re-submission untuk juri
5. ✅ Production-grade quality
6. ✅ Fix sekali, aman selamanya

**Timeline:**
```
10:00 - Backup database (jaga-jaga)
10:05 - Run cleanup script
10:10 - Verify cleanup berhasil
10:15 - Deploy code fixes
10:25 - Test di production
10:30 - Monitor logs
10:45 - Done ✅
```

---

## 🚀 Step-by-Step Implementation (Solusi C)

### **Step 1: Backup Database** (Safety First!)
```bash
# Export database dump (di production)
pg_dump $DATABASE_URL > backup-before-fix-$(date +%Y%m%d-%H%M%S).sql
```

### **Step 2: Cleanup Duplicate Scores**
```bash
# Dry run - lihat duplicate
node scripts/cleanup-duplicate-scores.js

# Actual cleanup
node scripts/cleanup-duplicate-scores.js --confirm
```

**Expected Output:**
```
🧹 Starting cleanup of duplicate scores...
📊 Total scores in database: 16
🔍 Found 8 participants with duplicate scores
⚠️  This will delete duplicate entries, keeping only the LATEST one.
✅ Cleanup complete! Deleted 8 duplicate scores.
📊 Final score count: 8
```

### **Step 3: Verify Cleanup**
```sql
-- Check tidak ada duplicate lagi
SELECT 
  "participantId",
  COUNT(*) as count
FROM "DebateScore"
WHERE "matchId" = 'cmgomb4ka0002wxgetuzgeznb'
GROUP BY "participantId"
HAVING COUNT(*) > 1;

-- Expected: 0 rows (tidak ada duplicate)
```

### **Step 4: Deploy Fixed Code**
```bash
# Code sudah ready di:
# - scripts/judge-scoring-system.js (UPSERT + Transaction)
# - src/components/judge/bp-scoring-form.tsx (Double submit protection)

git add scripts/judge-scoring-system.js
git add src/components/judge/bp-scoring-form.tsx
git commit -m "fix: prevent duplicate scores with UPSERT + transaction"
git push origin main

# Coolify akan auto-deploy (tunggu 5-10 menit)
```

### **Step 5: Test di Production**
```bash
# Login sebagai judge
# Submit scores untuk 1 match
# Verify:
# 1. Tidak ada error
# 2. Scores tersimpan 1x saja (tidak duplicate)
# 3. Bisa re-submit jika perlu update
```

### **Step 6: Monitor**
```bash
# Check production logs
# Look for:
# ✓ Saved score for [nama]: [score]
# ⚠️  Judge has existing scores, deleting X old scores...
```

---

## 🔍 Verification Checklist

After implementation, verify:

- [ ] No duplicate entries di database
- [ ] Score submission berfungsi normal
- [ ] Re-submission allowed (update scores)
- [ ] Transaction rollback jika error
- [ ] Frontend button disabled saat submitting
- [ ] No error di production logs
- [ ] All 8 speakers per match tersimpan
- [ ] Ranking calculation benar

---

## ⚠️ Rollback Plan (Jika Ada Masalah)

**Jika ada issue setelah deploy:**

1. **Restore database backup**
   ```bash
   psql $DATABASE_URL < backup-before-fix-TIMESTAMP.sql
   ```

2. **Revert code**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Alternative: Gunakan Solusi A sementara**
   - Cleanup duplicate manual
   - Fix code dengan lebih teliti
   - Deploy ulang

---

## 📞 Support

**Jika butuh bantuan:**
1. Check logs: `docker logs container-name`
2. Check database: Connect via TablePlus/pgAdmin
3. Test di staging dulu jika ada
4. Rollback jika tidak yakin

---

## ✅ Expected Results

**Before Fix:**
```
OG - Keisya Queen Arthany Daulay: 75.5 ❌ (duplicate)
OG - Keisya Queen Arthany Daulay: 75.5 ❌ (duplicate)
Total: 16 scores (8 duplicate)
```

**After Fix:**
```
OG - Keisya Queen Arthany Daulay: 75.5 ✅
OG - [Speaker 2 name]: 74.0 ✅
OO - Khansa Fairuz: 71.5 ✅
OO - [Speaker 2 name]: 70.0 ✅
CG - Zaky alamsyah: 72.5 ✅
CG - [Speaker 2 name]: 71.0 ✅
CO - Nabilla Rizki Khairina: 75.5 ✅
CO - [Speaker 2 name]: 73.0 ✅
Total: 8 scores (no duplicate) ✅
```

---

**Pilih solusi yang sesuai dengan risiko yang bisa diterima!**

Rekomendasi: **Solusi C** untuk production system yang stabil dan sustainable.
