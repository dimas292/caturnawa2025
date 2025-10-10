# SPC (Speech Competition) Judging System

## 🎤 Overview

Sistem penilaian untuk Speech Competition (SPC) terdiri dari **dua babak** dengan metode penilaian yang berbeda:

- **Semifinal:** Penilaian karya tertulis (naskah pidato) penilaian dari 3 juri 
- **Final:** Penilaian presentasi langsung dengan 3 juri

Sistem dirancang agar sederhana dan fokus pada aspek-aspek utama dari kemampuan berbicara di depan umum.

---

## 🏁 Competition Stages

### Stage 1: Semifinal (Karya Tertulis)

**Format:** Pengumpulan naskah pidato tertulis  
**Penilaian:** Tim juri mengevaluasi karya tertulis  
**Output:** Seleksi peserta terbaik untuk maju ke final  

**Kriteria Semifinal:**
| No. | Kriteria Penilaian | Deskripsi | Fokus Penilaian |
|:---:|:---|:---|:---|
| 1 | **Struktur & Organisasi** | Kejelasan pembuka, isi, dan penutup | Alur logis, transisi yang baik |
| 2 | **Kualitas Argumen** | Kedalaman analisis dan kekuatan argumen | Relevansi data, bukti pendukung |
| 3 | **Gaya Bahasa Tulis** | Penggunaan bahasa yang efektif | Kosakata, tata bahasa, gaya penulisan |

### Stage 2: Final (Presentasi Langsung)

**Format:** Presentasi langsung di depan juri dan audiens  
**Penilaian:** 3 juri menilai dengan sistem scoring  
**Output:** Ranking final peserta  

**Kriteria Final:**
| No. | Kriteria Penilaian | Deskripsi Singkat | Skor (1-100) |
|:---:|:---|:---|:---:|
| 1 | **Materi (Content)** | Kedalaman analisis, struktur argumen, relevansi dengan tema, dan kejelasan pesan. | |
| 2 | **Penyampaian (Delivery)** | Penggunaan bahasa tubuh, intonasi suara, kontak mata, dan kepercayaan diri. | |
| 3 | **Bahasa (Language)** | Ketepatan tata bahasa, kekayaan kosakata, dan kejelasan artikulasi. | |
| | **TOTAL** | | |

---

## 📊 Final Stage Evaluation System

### Panduan Penilaian:
- **Skor** diberikan dalam rentang 1 hingga 100 untuk setiap kriteria.
- **Penilaian Kualitatif** (opsional) dapat ditambahkan oleh juri untuk memberikan feedback yang lebih mendetail.
- **Total Skor** adalah jumlah dari skor ketiga kriteria.
- **Rank** ditentukan berdasarkan total skor tertinggi.

---

## 🏆 Semifinal Selection Process

**Advancement Criteria:**
- Berdasarkan evaluasi tim juri terhadap karya tertulis
- Sejumlah peserta terbaik akan dipilih untuk maju ke final
- Keputusan berdasarkan kualitas keseluruhan naskah

---

## 🏆 Final Stage Scoring and Ranking

**Hanya berlaku untuk Final Stage (Presentasi Langsung)**

1.  **Perhitungan Skor per Juri**:
    Setiap juri memberikan skor untuk tiga kriteria, yang kemudian dijumlahkan.
    `Total Skor Juri = Skor Materi + Skor Penyampaian + Skor Bahasa`

2.  **Kalkulasi Nilai Akhir (dari 3 Juri)**:
    Nilai akhir seorang peserta dihitung dengan mengambil rata-rata skor dari ketiga juri untuk setiap kriteria, lalu menjumlahkannya.

    - **Skor Rata-rata Materi** = (Skor Materi Juri 1 + Skor Materi Juri 2 + Skor Materi Juri 3) / 3
    - **Skor Rata-rata Penyampaian** = (Skor Penyampaian Juri 1 + Skor Penyampaian Juri 2 + Skor Penyampaian Juri 3) / 3
    - **Skor Rata-rata Bahasa** = (Skor Bahasa Juri 1 + Skor Bahasa Juri 2 + Skor Bahasa Juri 3) / 3

    `Nilai Akhir = Skor Rata-rata Materi + Skor Rata-rata Penyampaian + Skor Rata-rata Bahasa`

3.  **Ranking**:
    Peserta diurutkan berdasarkan **Nilai Akhir** dari yang tertinggi ke terendah.

4.  **Tie-Breaking**:
    Jika terjadi **Nilai Akhir** yang sama, urutan prioritas untuk penentuan peringkat adalah:
    1.  **Skor Rata-rata Materi** tertinggi.
    2.  **Skor Rata-rata Penyampaian** tertinggi.
    3.  Jika masih sama, keputusan akhir ada pada dewan juri.

---

## 📝 Judging Form Examples

### Semifinal Judging Form (Karya Tertulis)

| No. | Nama Peserta | Struktur & Organisasi | Kualitas Argumen | Gaya Bahasa Tulis | Catatan | Status |
|:---:|:---|:---:|:---:|:---:|:---|:---:|
| 1 | [Nama Peserta] | | | | | □ Lolos □ Tidak |
| 2 | [Nama Peserta] | | | | | □ Lolos □ Tidak |

### Final Judging Form (Presentasi Langsung)

**Juri: [Nama Juri] | Tanggal: [Tanggal] | Sesi: [Sesi Final]**

| No. Peserta | Nama Peserta | Kriteria Penilaian | Skor | Penilaian Kualitatif | Total | Rank |
|:---:|:---|:---|:---:|:---|:---:|:---:|
| 1 | [Nama Peserta] | 1. Materi (Content) | | | | |
| | | 2. Penyampaian (Delivery) | | | |
| | | 3. Bahasa (Language) | | | |
| 2 | [Nama Peserta] | 1. Materi (Content) | | | | |
| | | 2. Penyampaian (Delivery) | | | |
| | | 3. Bahasa (Language) | | | |

---

## 📋 Implementation Notes

**Database Requirements:**
- Peserta SPC dengan stage indicator (SEMIFINAL/FINAL)
- File upload system untuk naskah semifinal
- Judge assignment untuk final stage
- Scoring system untuk 3 kriteria dengan 3 juri
- Advancement tracking dari semifinal ke final

**Competition Flow:**
1. Registrasi peserta SPC
2. Upload naskah pidato (semifinal)
3. Evaluasi & seleksi finalis
4. Pengumuman finalis
5. Presentasi final dengan live judging
6. Pengumuman pemenang