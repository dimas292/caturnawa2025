# SPC Semifinal Ranking System

## Perubahan Sistem Penilaian

### Sebelumnya ❌
- Juri memberikan penilaian → Langsung lolos/tidak lolos ke final
- Field: `strukturOrganisasi`, `kualitasArgumen`, `gayaBahasaTulis`
- Keputusan final ditentukan langsung oleh juri

### Sekarang ✅
- Juri memberikan penilaian → Status "REVIEWED" → Admin menghitung ranking → Admin menentukan 6 finalis
- Field baru: `penilaianKaryaTulisIlmiah`, `substansiKaryaTulisIlmiah`, `kualitasKaryaTulisIlmiah`
- Sistem ranking otomatis berdasarkan total nilai
- Admin yang menentukan finalis

## Database Schema Changes

Kolom baru di tabel `SPCSubmission`:

```prisma
penilaianKaryaTulisIlmiah  Int?      // Nilai 0-100
substansiKaryaTulisIlmiah  Int?      // Nilai 0-100
kualitasKaryaTulisIlmiah   Int?      // Nilai 0-100
catatanPenilaian           String?   // Feedback kualitatif
catatanSubstansi           String?   // Feedback kualitatif
catatanKualitas            String?   // Feedback kualitatif
totalSemifinalScore        Int?      // Total dari 3 kriteria
semifinalRank              Int?      // Ranking peserta
```

## API Endpoints

### 1. Juri - Penilaian Semifinal
**POST** `/api/judge/spc/evaluate-semifinal`

Request body:
```json
{
  "submissionId": "xxx",
  "penilaianKaryaTulisIlmiah": 85,
  "substansiKaryaTulisIlmiah": 90,
  "kualitasKaryaTulisIlmiah": 88,
  "catatanPenilaian": "Format dan sistematika baik...",
  "catatanSubstansi": "Analisis mendalam...",
  "catatanKualitas": "Originalitas tinggi..."
}
```

Response:
```json
{
  "success": true,
  "submission": {...},
  "message": "Penilaian semifinal berhasil disimpan. Status kelulusan akan ditentukan berdasarkan ranking."
}
```

**Catatan:** Status berubah menjadi `REVIEWED`, BUKAN `QUALIFIED`. Field `qualifiedToFinal` tetap `false`.

### 2. Admin - Lihat Ranking
**GET** `/api/admin/spc/calculate-ranking`

Response:
```json
{
  "success": true,
  "rankings": [
    {
      "rank": 1,
      "id": "xxx",
      "participantName": "John Doe",
      "institution": "Universitas ABC",
      "judulKarya": "Judul Karya",
      "penilaianKaryaTulisIlmiah": 85,
      "substansiKaryaTulisIlmiah": 90,
      "kualitasKaryaTulisIlmiah": 88,
      "totalScore": 263,
      "currentRank": 1,
      "qualifiedToFinal": true,
      "status": "QUALIFIED"
    }
  ],
  "totalEvaluated": 10,
  "finalistsCount": 6
}
```

### 3. Admin - Hitung Ranking & Tentukan Finalis
**POST** `/api/admin/spc/calculate-ranking`

Response:
```json
{
  "success": true,
  "message": "Ranking berhasil dihitung. 6 peserta lolos ke final.",
  "finalists": [
    {
      "rank": 1,
      "participantName": "John Doe",
      "judulKarya": "Judul Karya",
      "totalScore": 263
    }
  ],
  "notQualified": [...],
  "totalEvaluated": 10
}
```

**Catatan:** Endpoint ini akan:
- Mengurutkan semua submission berdasarkan `totalSemifinalScore` (DESC)
- Set `semifinalRank` untuk semua submission
- Set `qualifiedToFinal = true` untuk 6 teratas
- Set `status = QUALIFIED` untuk 6 teratas
- Set `qualifiedToFinal = false` dan `status = NOT_QUALIFIED` untuk sisanya

## Workflow

### Untuk Juri:
1. Login ke dashboard juri
2. Pilih menu "SPC - Scientific Paper Competition"
3. Pilih tab "Semifinal (Karya Tertulis)"
4. Klik tombol "Nilai" pada submission yang ingin dinilai
5. Isi 3 kriteria penilaian (masing-masing 0-100):
   - **Penilaian Karya Tulis Ilmiah**: Format, sistematika, kaidah penulisan
   - **Substansi Karya Tulis Ilmiah**: Kedalaman analisis, relevansi, argumen
   - **Kualitas Karya Tulis Ilmiah**: Originalitas, inovasi, metodologi
6. Isi feedback kualitatif untuk setiap kriteria (opsional)
7. Klik "Simpan Penilaian"
8. Status submission berubah menjadi "Sudah Direview"

### Untuk Admin:
1. Tunggu sampai semua juri selesai menilai
2. Akses endpoint untuk melihat ranking sementara:
   ```
   GET /api/admin/spc/calculate-ranking
   ```
3. Setelah yakin, jalankan perhitungan final:
   ```
   POST /api/admin/spc/calculate-ranking
   ```
4. Sistem otomatis menentukan 6 finalis berdasarkan total nilai tertinggi

## Migration

Jalankan script SQL untuk menambahkan kolom baru:

```bash
# Jika menggunakan PostgreSQL langsung
psql -d your_database -f add-spc-semifinal-fields.sql

# Atau generate migration dengan Prisma
npx prisma migrate dev --name add_spc_semifinal_scoring_fields
```

## Files Modified

1. `prisma/schema.prisma` - Tambah kolom penilaian baru
2. `src/app/api/judge/spc/evaluate-semifinal/route.ts` - API baru untuk juri (TIDAK auto-qualify)
3. `src/app/api/admin/spc/calculate-ranking/route.ts` - API untuk admin hitung ranking
4. `src/app/dashboard/judge/spc/page.tsx` - Update handler ke endpoint baru
5. `src/app/api/judge/spc/submissions/route.ts` - Tambah field baru di response
6. `add-spc-semifinal-fields.sql` - Script migrasi database

## Important Notes

⚠️ **API lama `/api/judge/spc/evaluate` masih ada** untuk backward compatibility, tapi sebaiknya tidak digunakan lagi karena langsung set `qualifiedToFinal`.

✅ **Gunakan API baru `/api/judge/spc/evaluate-semifinal`** yang hanya set status `REVIEWED` dan biarkan admin yang tentukan finalis.

🎯 **Jumlah finalis fixed 6 peserta** - Jika ingin ubah jumlah, edit logic di `calculate-ranking/route.ts` baris `const qualifiedToFinal = rank <= 6`
