# 🔄 Migration Guide: SPC Semifinal Multiple Judges Support

## 📋 Overview

Migrasi ini mengubah sistem penilaian SPC Semifinal dari **single judge** menjadi **multiple judges (maksimal 3 juri)**.

### Perubahan Utama:
- ✅ Tabel baru `SPCSemifinalScore` untuk menyimpan nilai dari multiple judges
- ✅ Setiap juri dapat memberi nilai secara independen
- ✅ Maksimal 3 juri per submission
- ✅ Juri yang sudah menilai dapat edit nilai mereka
- ✅ UI menampilkan jumlah juri yang sudah menilai
- ✅ Data lama tetap aman (backward compatible)

---

## 🚀 Deployment Steps (PRODUCTION)

### **Step 1: Backup Database** ⚠️ WAJIB

```bash
# Backup database sebelum migrasi
pg_dump -h YOUR_HOST -U YOUR_USER -d YOUR_DB > backup_before_spc_migration_$(date +%Y%m%d_%H%M%S).sql
```

### **Step 2: Update Code**

```bash
# Pull latest code
git pull origin main

# Install dependencies (jika ada perubahan)
npm install
```

### **Step 3: Generate Prisma Client**

```bash
# Generate Prisma client dengan schema baru
npx prisma generate
```

### **Step 4: Run Database Migration**

```bash
# Push schema changes ke database
npx prisma db push

# ATAU jika menggunakan migrations:
npx prisma migrate deploy
```

### **Step 5: Analisis Data Existing**

```bash
# Jalankan script analisis untuk melihat data yang akan dimigrasi
node scripts/analyze-spc-semifinal-data.js
```

Output akan menampilkan:
- Total submissions
- Submissions yang sudah dinilai
- Detail setiap submission yang perlu dimigrasi

### **Step 6: Migrasi Data (DRY RUN)**

```bash
# Preview migrasi tanpa mengubah data
node scripts/migrate-spc-semifinal-to-new-table.js --dry-run
```

Review output dengan teliti. Pastikan:
- ✅ Jumlah data yang akan dimigrasi sesuai
- ✅ Tidak ada error
- ✅ Judge ID dan Judge Name terdeteksi dengan benar

### **Step 7: Migrasi Data (EXECUTE)**

```bash
# Jalankan migrasi sebenarnya
node scripts/migrate-spc-semifinal-to-new-table.js --execute
```

Script ini akan:
- ✅ Copy data dari `SPCSubmission` ke `SPCSemifinalScore`
- ✅ Skip data yang sudah ada (idempotent)
- ✅ Tidak menghapus data lama (safety)

### **Step 8: Verifikasi**

```bash
# Cek data di tabel baru
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -c "SELECT COUNT(*) FROM \"SPCSemifinalScore\";"

# Bandingkan dengan data lama
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -c "SELECT COUNT(*) FROM \"SPCSubmission\" WHERE \"penilaianKaryaTulisIlmiah\" IS NOT NULL;"
```

Jumlah harus sama!

### **Step 9: Restart Application**

```bash
# Restart aplikasi (tergantung deployment method)
# Untuk Coolify: Deploy ulang atau restart container
# Untuk PM2: pm2 restart all
```

### **Step 10: Testing**

1. **Login sebagai Judge**
2. **Buka SPC Semifinal**
3. **Cek submission yang sudah dinilai:**
   - ✅ Harus muncul badge "Sudah Direview (1/3 Juri)"
   - ✅ Harus ada info juri yang sudah menilai
   - ✅ Tombol "Edit Nilai" harus muncul untuk juri yang sudah menilai
   - ✅ Tombol "Nilai" harus muncul untuk juri yang belum menilai
4. **Test dengan 3 juri berbeda:**
   - ✅ Juri 1 menilai → berhasil
   - ✅ Juri 2 menilai → berhasil
   - ✅ Juri 3 menilai → berhasil
   - ✅ Juri 4 mencoba menilai → harus ditolak dengan error "Maksimal 3 juri"
5. **Test edit nilai:**
   - ✅ Juri yang sudah menilai bisa edit nilai mereka
   - ✅ Nilai juri lain tidak berubah

---

## 🔍 Troubleshooting

### Problem: TypeScript errors setelah update schema

**Solution:**
```bash
npx prisma generate
npm run build
```

### Problem: Migration script gagal dengan "Can't reach database"

**Solution:**
- Pastikan DATABASE_URL di `.env` benar
- Pastikan database accessible dari server
- Cek firewall rules

### Problem: Data tidak muncul setelah migrasi

**Solution:**
```bash
# Cek apakah data ada di tabel baru
node scripts/analyze-spc-semifinal-data.js

# Jika perlu, jalankan ulang migrasi
node scripts/migrate-spc-semifinal-to-new-table.js --execute
```

### Problem: "Maksimal 3 juri" muncul padahal baru 2 juri

**Solution:**
```sql
-- Cek jumlah scores di database
SELECT "submissionId", COUNT(*) as judge_count 
FROM "SPCSemifinalScore" 
GROUP BY "submissionId";
```

---

## 📊 Database Schema Changes

### New Table: `SPCSemifinalScore`

```prisma
model SPCSemifinalScore {
  id                        String        @id @default(cuid())
  submissionId              String
  judgeId                   String
  judgeName                 String
  penilaianKaryaTulisIlmiah Int
  substansiKaryaTulisIlmiah Int
  kualitasKaryaTulisIlmiah  Int
  catatanPenilaian          String?
  catatanSubstansi          String?
  catatanKualitas           String?
  total                     Int
  createdAt                 DateTime      @default(now())
  updatedAt                 DateTime      @updatedAt
  submission                SPCSubmission @relation(...)

  @@unique([submissionId, judgeId])  // Setiap juri hanya bisa nilai 1x per submission
  @@index([submissionId])
  @@index([judgeId])
}
```

### Updated Table: `SPCSubmission`

```prisma
model SPCSubmission {
  // ... existing fields ...
  
  // DEPRECATED fields (kept for backward compatibility)
  penilaianKaryaTulisIlmiah  Int?
  substansiKaryaTulisIlmiah  Int?
  kualitasKaryaTulisIlmiah   Int?
  catatanPenilaian           String?
  catatanSubstansi           String?
  catatanKualitas            String?
  totalSemifinalScore        Int?
  
  // New relation
  semifinalScores            SPCSemifinalScore[]
}
```

---

## 🔐 Safety Features

### 1. **Data Preservation**
- Field lama di `SPCSubmission` TIDAK DIHAPUS
- Data lama tetap ada untuk fallback
- Migration script bisa dijalankan berkali-kali (idempotent)

### 2. **Validation**
- API memvalidasi maksimal 3 juri
- Frontend disable tombol jika sudah 3 juri
- Setiap juri hanya bisa edit nilai mereka sendiri

### 3. **Backward Compatibility**
- Field lama tetap di-update untuk compatibility
- Sistem lama masih bisa baca data

---

## 📝 API Changes

### POST `/api/judge/spc/evaluate`

**Before:**
```json
{
  "submissionId": "xxx",
  "penilaianKaryaTulisIlmiah": 85,
  "substansiKaryaTulisIlmiah": 90,
  "kualitasKaryaTulisIlmiah": 88
}
```

**After (sama, tapi response berbeda):**
```json
Response:
{
  "success": true,
  "score": { ... },
  "judgesCount": 2,
  "message": "Penilaian semifinal berhasil disimpan. 2/3 juri sudah menilai."
}
```

### GET `/api/judge/spc/submissions`

**New Response Fields:**
```json
{
  "submissions": [
    {
      "id": "xxx",
      "judgesCount": 2,
      "currentJudgeHasScored": true,
      "canBeScored": true,
      "allJudges": [
        {
          "judgeId": "judge1",
          "judgeName": "Dr. Andi",
          "total": 263
        },
        {
          "judgeId": "judge2",
          "judgeName": "Dr. Budi",
          "total": 270
        }
      ]
    }
  ]
}
```

---

## 🧹 Cleanup (Optional - Setelah 1-2 Minggu)

Setelah sistem berjalan stabil dan terverifikasi, field deprecated bisa dihapus:

```prisma
model SPCSubmission {
  // HAPUS field-field ini:
  // penilaianKaryaTulisIlmiah  Int?
  // substansiKaryaTulisIlmiah  Int?
  // kualitasKaryaTulisIlmiah   Int?
  // catatanPenilaian           String?
  // catatanSubstansi           String?
  // catatanKualitas            String?
  // totalSemifinalScore        Int?
}
```

Tapi **JANGAN TERBURU-BURU**. Tunggu sampai yakin sistem berjalan sempurna.

---

## ✅ Checklist Deployment

- [ ] Backup database
- [ ] Pull latest code
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` atau `npx prisma migrate deploy`
- [ ] Run analysis script
- [ ] Run migration script (dry-run)
- [ ] Run migration script (execute)
- [ ] Verify data migration
- [ ] Restart application
- [ ] Test dengan 3 juri berbeda
- [ ] Monitor for errors
- [ ] Verify in production

---

## 📞 Support

Jika ada masalah saat deployment:
1. Cek logs aplikasi
2. Cek database connection
3. Jalankan script analisis untuk debug
4. Restore dari backup jika critical

**IMPORTANT:** Jangan panik! Data lama tetap aman karena tidak dihapus.
