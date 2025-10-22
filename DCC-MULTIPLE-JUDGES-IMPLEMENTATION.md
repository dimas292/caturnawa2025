# 🎨 DCC Multiple Judges Implementation Guide

## 📋 Overview

Implementasi sistem 3 juri untuk DCC (Infografis & Short Video) mengikuti pola yang sama dengan SPC Semifinal.

---

## ✅ Status Implementasi

### **Schema Database** ✅ SUDAH ADA
- `DCCSemifinalScore` - Support multiple judges dengan unique constraint `[submissionId, judgeId]`
- `DCCShortVideoScore` - Support multiple judges dengan unique constraint `[submissionId, judgeId]`

### **API Routes** ✅ SUDAH DIUPDATE
1. `/api/judge/dcc/submissions` - Tambah `judgesCount`, `canBeScored`, `allJudges`
2. `/api/judge/dcc/semifinal-score` - Validasi max 3 juri
3. `/api/judge/dcc/short-video-score` - Validasi max 3 juri

### **Frontend Components** ⏳ PERLU UPDATE
- `dcc-semifinal-scoring.tsx` - Perlu tambah badge juri
- `dcc-short-video-semifinal.tsx` - Perlu tambah badge juri

### **Admin Pages** ⏳ PERLU DIBUAT
- `/dashboard/admin/dcc-infografis-scores` - Tabel hasil nilai Infografis
- `/dashboard/admin/dcc-short-video-scores` - Tabel hasil nilai Short Video

---

## 🗃️ Database Schema

### **DCCSemifinalScore (Infografis)**
```prisma
model DCCSemifinalScore {
  id           String        @id @default(cuid())
  submissionId String
  judgeId      String
  judgeName    String
  desainVisual Int           // Weighted: Kerapian (50%), Komposisi (25%), Editing (25%)
  isiPesan     Int           // Weighted: Tema (30%), Bahasa (40%), Daya Tarik (30%)
  orisinalitas Int           // Direct score
  total        Int           // Sum of above (max 300)
  feedback     String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  submission   DCCSubmission @relation(...)

  @@unique([submissionId, judgeId])  // Max 3 judges per submission
}
```

### **DCCShortVideoScore**
```prisma
model DCCShortVideoScore {
  id                String        @id @default(cuid())
  submissionId      String
  judgeId           String
  judgeName         String
  // Sinematografi (100 poin)
  angleShot         Int
  komposisiGambar   Int
  kualitasGambar    Int
  sinematografi     Int           // Weighted total
  // Visual dan Bentuk (100 poin)
  pilihanWarna      Int
  tataKostum        Int
  propertiLatar     Int
  kesesuaianSetting Int
  visualBentuk      Int           // Weighted total
  // Visual dan Editing (100 poin)
  kerapianTransisi  Int
  ritmePemotongan   Int
  sinkronisasiAudio Int
  kreativitasEfek   Int
  visualEditing     Int           // Weighted total
  // Isi/Pesan (100 poin)
  kesesuaianTema    Int
  kedalamanIsi      Int
  dayaTarik         Int
  isiPesan          Int           // Weighted total
  total             Int           // Sum (max 400)
  feedback          String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  submission        DCCSubmission @relation(...)

  @@unique([submissionId, judgeId])  // Max 3 judges per submission
}
```

---

## 🔧 API Changes

### **1. GET `/api/judge/dcc/submissions`**

**Response (Updated):**
```json
{
  "submissions": [
    {
      "id": "xxx",
      "participantName": "John Doe",
      "institution": "Universitas ABC",
      "submissionTitle": "Infografis Lingkungan",
      "judgesCount": 2,
      "currentJudgeHasScored": true,
      "canBeScored": true,
      "allJudges": [
        {
          "judgeId": "judge1",
          "judgeName": "Dr. Andi"
        },
        {
          "judgeId": "judge2",
          "judgeName": "Dr. Budi"
        }
      ]
    }
  ]
}
```

### **2. POST `/api/judge/dcc/semifinal-score`**

**Validasi Baru:**
- ✅ Check jika sudah ada 3 juri
- ✅ Jika sudah 3 juri DAN current judge bukan salah satunya → Error 400
- ✅ Jika current judge sudah menilai → Allow edit (UPSERT)

**Error Response:**
```json
{
  "error": "Maksimal 3 juri dapat menilai submission ini. Submission sudah dinilai oleh 3 juri."
}
```

### **3. POST `/api/judge/dcc/short-video-score`**

**Validasi Sama** dengan semifinal-score.

---

## 🎨 Frontend Updates Needed

### **Component: `dcc-semifinal-scoring.tsx`**

Tambahkan interface dan badge seperti SPC:

```tsx
interface DCCSubmission {
  id: string
  participantName: string
  institution: string
  submissionTitle: string
  // ... existing fields
  judgesCount?: number
  currentJudgeHasScored?: boolean
  canBeScored?: boolean
  allJudges?: Array<{
    judgeId: string
    judgeName: string
  }>
}

// Update badge status
const getStatusBadge = (status: string, judgesCount?: number) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">Menunggu Review</Badge>
    case 'reviewed':
      const count = judgesCount || 0
      return (
        <Badge variant="outline" className="bg-blue-50">
          Sudah Direview ({count}/3 Juri)
        </Badge>
      )
    // ... other cases
  }
}

// Show judges info
{submission.judgesCount && submission.judgesCount > 0 && (
  <div className="mb-3 p-2 bg-gray-50 rounded border">
    <div className="text-xs font-semibold mb-1">
      Juri yang sudah menilai ({submission.judgesCount}/3):
    </div>
    <div className="flex flex-wrap gap-2">
      {submission.allJudges?.map((judge, idx) => (
        <Badge key={idx} variant="outline" className="text-xs">
          {judge.judgeName}
        </Badge>
      ))}
    </div>
  </div>
)}

// Update button logic
{submission.canBeScored ? (
  <Button
    onClick={() => handleEvaluate(submission)}
    variant={submission.currentJudgeHasScored ? "outline" : "default"}
  >
    {submission.currentJudgeHasScored ? "Edit Nilai" : "Nilai"}
  </Button>
) : (
  <Button disabled variant="outline">
    Maksimal 3 Juri
  </Button>
)}
```

---

## 📊 Admin Pages to Create

### **1. `/dashboard/admin/dcc-infografis-scores/page.tsx`**

**Tabel Kolom:**
- No
- Nama Peserta
- Universitas
- Judul Karya
- Juri (X/3 badge)
- Desain Visual (rata-rata)
- Isi/Pesan (rata-rata)
- Orisinalitas (rata-rata)
- Total Score (rata-rata)
- Detail (expand per juri)

**Detail Per Juri (Expandable):**
- Nama Juri
- Desain Visual: X poin
- Isi/Pesan: X poin
- Orisinalitas: X poin
- Total: X poin
- Feedback (jika ada)

### **2. `/dashboard/admin/dcc-short-video-scores/page.tsx`**

**Tabel Kolom:**
- No
- Nama Peserta
- Universitas
- Judul Video
- Juri (X/3 badge)
- Sinematografi (rata-rata)
- Visual & Bentuk (rata-rata)
- Visual & Editing (rata-rata)
- Isi/Pesan (rata-rata)
- Total Score (rata-rata)
- Detail (expand per juri)

**Detail Per Juri (Expandable):**
- Nama Juri
- Sinematografi: X poin
- Visual & Bentuk: X poin
- Visual & Editing: X poin
- Isi/Pesan: X poin
- Total: X poin
- Feedback (jika ada)

---

## 🚀 Implementation Steps

### **Step 1: Update Frontend Components** ✅ API READY

```bash
# Edit files:
src/components/judge/dcc-semifinal-scoring.tsx
src/components/judge/dcc-short-video-semifinal.tsx
```

Copy pattern dari `spc-semifinal-evaluation.tsx`:
- Interface dengan `judgesCount`, `canBeScored`, `allJudges`
- Badge "Sudah Direview (X/3 Juri)"
- Info panel juri yang sudah menilai
- Button logic (Nilai / Edit Nilai / Disabled)

### **Step 2: Create Admin API Routes**

```bash
# Create:
src/app/api/admin/dcc-infografis-scores/route.ts
src/app/api/admin/dcc-short-video-scores/route.ts
```

Copy pattern dari `spc-semifinal-scores/route.ts`:
- Fetch submissions dengan scores
- Hitung rata-rata dari multiple judges
- Include detail per juri

### **Step 3: Create Admin Pages**

```bash
# Create:
src/app/dashboard/admin/dcc-infografis-scores/page.tsx
src/app/dashboard/admin/dcc-short-video-scores/page.tsx
```

Copy pattern dari `spc-semifinal-scores/page.tsx`:
- Stats cards
- Search/filter
- Export CSV
- Expandable rows untuk detail per juri

### **Step 4: Update Admin Navigation**

```tsx
// In: src/app/dashboard/admin/page.tsx
const adminSidebarNavItems = [
  // ... existing items
  {
    title: "DCC Infografis Scores",
    href: "/dashboard/admin/dcc-infografis-scores",
    icon: Image,
    badge: null
  },
  {
    title: "DCC Short Video Scores",
    href: "/dashboard/admin/dcc-short-video-scores",
    icon: Video,
    badge: null
  },
]
```

---

## ✅ Testing Checklist

- [ ] Login sebagai Judge 1, nilai submission Infografis
- [ ] Login sebagai Judge 2, nilai submission yang sama
- [ ] Login sebagai Judge 3, nilai submission yang sama
- [ ] Login sebagai Judge 4, coba nilai → harus error "Maksimal 3 juri"
- [ ] Judge 1 edit nilai mereka → berhasil
- [ ] Cek admin page Infografis → tampil 3 juri dengan nilai rata-rata
- [ ] Expand detail → tampil nilai per juri
- [ ] Export CSV → data lengkap
- [ ] Ulangi untuk Short Video

---

## 📝 Notes

1. **Tidak perlu SQL migration** karena schema sudah ada
2. **API sudah support UPSERT** dengan unique constraint
3. **Validasi 3 juri** sudah ditambahkan di API
4. **Frontend pattern** sama persis dengan SPC
5. **Admin pages** copy-paste dari SPC dengan adjust kolom

---

## 🎯 Key Differences: Infografis vs Short Video

### **Infografis (3 kriteria, max 300)**
- Desain Visual (100)
- Isi/Pesan (100)
- Orisinalitas (100)

### **Short Video (4 kriteria, max 400)**
- Sinematografi (100)
- Visual & Bentuk (100)
- Visual & Editing (100)
- Isi/Pesan (100)

---

## 🔗 Reference Files

Gunakan sebagai template:
- API: `src/app/api/judge/spc/submissions/route.ts`
- API: `src/app/api/admin/spc-semifinal-scores/route.ts`
- Component: `src/components/judge/spc-semifinal-evaluation.tsx`
- Page: `src/app/dashboard/admin/spc-semifinal-scores/page.tsx`

Semua sudah implement pattern yang sama! 🎉
