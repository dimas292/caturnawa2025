# Registration Components

Komponen-komponen untuk form pendaftaran lomba UNAS FEST 2025 yang sudah dimodularisasi.

## Struktur Komponen

### 1. CompetitionSelection
- **File**: `competition-selection.tsx`
- **Fungsi**: Menampilkan pilihan kompetisi yang tersedia
- **Props**: 
  - `competitions`: Array data kompetisi
  - `selectedCompetition`: Kompetisi yang dipilih
  - `onCompetitionSelect`: Callback saat kompetisi dipilih
  - `getCurrentPrice`: Function untuk mendapatkan harga
  - `getPhaseLabel`: Function untuk mendapatkan label fase

### 2. TeamDataForm
- **File**: `team-data-form.tsx`
- **Fungsi**: Form untuk input data tim dan anggota
- **Props**:
  - `selectedCompetition`: Kompetisi yang dipilih
  - `formData`: Data form tim
  - `errors`: Error validation
  - `onFormDataChange`: Callback saat data berubah

### 3. FileUploadForm
- **File**: `file-upload-form.tsx`
- **Fungsi**: Form untuk upload dokumen pendukung
- **Fitur**:
  - Drag & drop file
  - Validasi ukuran dan tipe file
  - Preview file yang sudah diupload
  - Support untuk berbagai tipe dokumen

### 4. PaymentForm
- **File**: `payment-form.tsx`
- **Fungsi**: Form untuk konfirmasi pembayaran
- **Props**:
  - `selectedCompetition`: Kompetisi yang dipilih
  - `formData`: Data form pembayaran
  - `errors`: Error validation
  - `getCurrentPrice`: Function untuk mendapatkan harga
  - `getPhaseLabel`: Function untuk mendapatkan label fase
  - `onFormDataChange`: Callback saat data berubah

### 5. PaymentProofUpload
- **File**: `payment-proof-upload.tsx`
- **Fungsi**: Komponen khusus untuk upload bukti pembayaran
- **Fitur**:
  - Drag & drop
  - Validasi file (max 5MB, format JPG/PNG/PDF)
  - Preview file

### 6. SuccessForm
- **File**: `success-form.tsx`
- **Fungsi**: Halaman sukses setelah pendaftaran
- **Props**:
  - `selectedCompetition`: Kompetisi yang dipilih
  - `getCurrentPrice`: Function untuk mendapatkan harga

### 7. StepIndicator
- **File**: `step-indicator.tsx`
- **Fungsi**: Indikator progress step pendaftaran
- **Props**:
  - `steps`: Array step pendaftaran
  - `currentStep`: Step yang sedang aktif

## Types

Semua interface dan type didefinisikan di `src/types/registration.ts`:

- `CompetitionData`: Data kompetisi
- `Member`: Data anggota tim
- `WorkSubmission`: Data submission karya
- `FormData`: Data form lengkap
- `Step`: Data step pendaftaran

## Utilities

Function helper untuk kompetisi ada di `src/lib/competitions.ts`:

- `competitions`: Data kompetisi
- `getCurrentPhase()`: Mendapatkan fase saat ini
- `getCurrentPrice()`: Mendapatkan harga berdasarkan fase
- `getPhaseLabel()`: Mendapatkan label fase

## Penggunaan

```tsx
import {
  CompetitionSelection,
  TeamDataForm,
  FileUploadForm,
  PaymentForm,
  SuccessForm,
  StepIndicator
} from "@/components/registration"

// Gunakan komponen sesuai step yang aktif
```

## Fitur File Upload

- **Drag & Drop**: Support drag & drop file
- **Validasi Ukuran**: Maksimal 10MB untuk dokumen, 5MB untuk bukti pembayaran
- **Validasi Format**: JPG, PNG, PDF
- **Preview File**: Menampilkan nama dan ukuran file
- **Remove File**: Bisa hapus file yang sudah diupload

## State Management

Form menggunakan local state dengan `useState` dan dikelola di parent component (`src/app/register/page.tsx`). Setiap komponen menerima callback untuk update data.
