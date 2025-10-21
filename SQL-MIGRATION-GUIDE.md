# 🗃️ SQL Migration Guide - SPC Semifinal Multiple Judges

## 📋 Overview

Panduan ini untuk menjalankan migrasi database menggunakan **SQL query manual** tanpa menumpuk Prisma migration files.

---

## 🚀 Cara Menjalankan Migration

### **Opsi 1: Menggunakan Script Node.js (RECOMMENDED)**

```bash
# Jalankan migration script
node scripts/run-spc-semifinal-migration.js
```

Script ini akan:
- ✅ Membaca file SQL
- ✅ Execute ke database
- ✅ Verifikasi hasil migrasi
- ✅ Tampilkan sample data

### **Opsi 2: Menggunakan psql CLI**

```bash
# Connect ke database dan jalankan SQL file
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f add-spc-semifinal-score-table.sql
```

### **Opsi 3: Menggunakan Database GUI (DBeaver, pgAdmin, etc)**

1. Buka file `add-spc-semifinal-score-table.sql`
2. Copy semua isi file
3. Paste ke SQL editor di GUI
4. Execute query

---

## 📁 File SQL yang Tersedia

### 1. `add-spc-semifinal-score-table.sql`
**Fungsi:** Membuat tabel baru dan migrasi data

**Isi:**
- Create table `SPCSemifinalScore`
- Create indexes dan constraints
- Migrate data existing dari `SPCSubmission`
- Idempotent (aman dijalankan berkali-kali)

### 2. `rollback-spc-semifinal-score-table.sql`
**Fungsi:** Rollback jika ada masalah

**Isi:**
- Drop table `SPCSemifinalScore`
- Drop indexes dan constraints
- Data lama di `SPCSubmission` tetap aman

### 3. `scripts/run-spc-semifinal-migration.js`
**Fungsi:** Helper script untuk execute SQL via Node.js

**Fitur:**
- Auto-read SQL file
- Execute ke database
- Verifikasi hasil
- Error handling

---

## 🔍 Verifikasi Hasil Migration

### Check 1: Tabel sudah dibuat

```sql
-- Cek apakah tabel ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'SPCSemifinalScore';
```

### Check 2: Indexes sudah dibuat

```sql
-- Cek indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'SPCSemifinalScore';
```

Expected output:
- `SPCSemifinalScore_pkey`
- `SPCSemifinalScore_submissionId_judgeId_key`
- `SPCSemifinalScore_submissionId_idx`
- `SPCSemifinalScore_judgeId_idx`

### Check 3: Data sudah dimigrasi

```sql
-- Bandingkan jumlah data
SELECT 
    'SPCSubmission' as source,
    COUNT(*) as count
FROM "SPCSubmission"
WHERE "penilaianKaryaTulisIlmiah" IS NOT NULL
UNION ALL
SELECT 
    'SPCSemifinalScore' as source,
    COUNT(*) as count
FROM "SPCSemifinalScore";
```

Jumlah harus sama!

### Check 4: Sample data

```sql
-- Lihat sample data yang dimigrasi
SELECT 
    ss.*,
    s."judulKarya"
FROM "SPCSemifinalScore" ss
JOIN "SPCSubmission" s ON ss."submissionId" = s."id"
LIMIT 5;
```

---

## 🔄 Setelah Migration

### 1. Generate Prisma Client

```bash
npx prisma generate
```

Ini akan update Prisma client dengan model baru.

### 2. Restart Application

```bash
# Tergantung deployment method:
# Coolify: Deploy ulang
# PM2: pm2 restart all
# Docker: docker-compose restart
```

### 3. Test Functionality

1. Login sebagai judge
2. Buka SPC Semifinal
3. Test dengan 3 juri berbeda
4. Verify UI menampilkan jumlah juri dengan benar

---

## 🚨 Troubleshooting

### Problem: "relation SPCSemifinalScore does not exist"

**Cause:** Migration belum dijalankan

**Solution:**
```bash
node scripts/run-spc-semifinal-migration.js
```

### Problem: "duplicate key value violates unique constraint"

**Cause:** Data sudah ada di tabel (ini OK, migration idempotent)

**Solution:** Tidak perlu action, migration akan skip data yang sudah ada

### Problem: TypeScript errors setelah migration

**Cause:** Prisma client belum di-regenerate

**Solution:**
```bash
npx prisma generate
npm run build  # jika perlu
```

### Problem: Data tidak muncul setelah migration

**Solution:**
```sql
-- Check apakah ada data di SPCSubmission yang perlu dimigrasi
SELECT COUNT(*) 
FROM "SPCSubmission" 
WHERE "penilaianKaryaTulisIlmiah" IS NOT NULL;

-- Check apakah data sudah ada di SPCSemifinalScore
SELECT COUNT(*) FROM "SPCSemifinalScore";
```

---

## 🔙 Rollback (Jika Diperlukan)

### Opsi 1: Via psql

```bash
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f rollback-spc-semifinal-score-table.sql
```

### Opsi 2: Manual SQL

```sql
-- Drop table dan semua dependencies
DROP TABLE IF EXISTS "SPCSemifinalScore" CASCADE;
```

**CATATAN:** Data lama di `SPCSubmission` tetap aman!

---

## 📊 SQL Query Details

### Create Table

```sql
CREATE TABLE "SPCSemifinalScore" (
    "id" TEXT PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "penilaianKaryaTulisIlmiah" INTEGER NOT NULL,
    "substansiKaryaTulisIlmiah" INTEGER NOT NULL,
    "kualitasKaryaTulisIlmiah" INTEGER NOT NULL,
    "catatanPenilaian" TEXT,
    "catatanSubstansi" TEXT,
    "catatanKualitas" TEXT,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### Unique Constraint

```sql
-- Setiap juri hanya bisa nilai 1x per submission
CREATE UNIQUE INDEX "SPCSemifinalScore_submissionId_judgeId_key" 
ON "SPCSemifinalScore"("submissionId", "judgeId");
```

### Data Migration

```sql
-- Copy data dari SPCSubmission ke SPCSemifinalScore
INSERT INTO "SPCSemifinalScore" (...)
SELECT ...
FROM "SPCSubmission" s
LEFT JOIN "users" u ON s."evaluatedBy" = u."id"
WHERE s."penilaianKaryaTulisIlmiah" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "SPCSemifinalScore" ss
    WHERE ss."submissionId" = s."id"
  );
```

---

## ✅ Checklist

- [ ] Backup database sebelum migration
- [ ] Review SQL file: `add-spc-semifinal-score-table.sql`
- [ ] Run migration: `node scripts/run-spc-semifinal-migration.js`
- [ ] Verify table created
- [ ] Verify indexes created
- [ ] Verify data migrated
- [ ] Run: `npx prisma generate`
- [ ] Restart application
- [ ] Test dengan multiple judges
- [ ] Monitor for errors

---

## 🎯 Keuntungan SQL Migration Manual

✅ **Tidak menumpuk migration files**
✅ **Lebih kontrol terhadap SQL yang dijalankan**
✅ **Idempotent - aman dijalankan berkali-kali**
✅ **Mudah di-review sebelum execute**
✅ **Bisa dijalankan di production tanpa Prisma CLI**

---

## 📞 Support

Jika ada masalah:
1. Check logs aplikasi
2. Verify dengan SQL queries di atas
3. Rollback jika critical
4. Restore dari backup jika perlu

**Data lama tetap aman!** Field di `SPCSubmission` tidak dihapus.
