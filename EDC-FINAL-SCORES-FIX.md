# Cara fix error skor EDC final

1. Jalankan script untuk memeriksa masalah:
```bash
node scripts/fix-edc-final-scores.js
```

2. Jika ditemukan masalah, jalankan fix dengan flag --confirm:
```bash
node scripts/fix-edc-final-scores.js --confirm
```

3. Verifikasi bahwa fix telah berhasil:
```bash
node scripts/fix-edc-final-scores.js
```

4. Setelah fix selesai, restart server development untuk memuat perubahan API.

## Masalah yang Diperbaiki

1. Duplikasi Team Member:
   - Script menghapus anggota tim duplikat
   - Hanya menyimpan satu entri per speaker
   - Position 1 = Speaker 1, Position 2 = Speaker 2

2. Duplikasi Skor:
   - Menghapus skor ganda dari juri yang sama
   - Menggunakan bpPosition untuk membedakan Speaker 1 & 2
   - Format bpPosition: TeamX_SpeakerY 
   (contoh: Team1_Speaker1, Team1_Speaker2)

3. Missing Scores:
   - Mengidentifikasi tim tanpa skor
   - Memastikan setiap speaker memiliki skor dari setiap juri

## Next Steps

1. Untuk tim yang kehilangan speaker 2:
   - Minta tim mendaftar ulang speaker 2
   - Atau tambahkan manual via admin dashboard

2. Untuk skor yang hilang:
   - Minta juri memasukkan skor ulang
   - Atau masukkan manual via admin dashboard

3. Periksa ulang semua skor final:
   - Pastikan setiap tim memiliki 2 speaker
   - Pastikan setiap speaker memiliki skor yang benar
   - Pastikan tidak ada lagi skor duplikat