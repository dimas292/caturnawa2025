# Leaderboard Per-Stage System

## Overview
Leaderboard sekarang dihitung **per-stage** (bukan kumulatif):
- **PRELIMINARY**: Leaderboard dari 8 matches preliminary saja
- **SEMIFINAL**: Leaderboard dari matches semifinal saja  
- **FINAL**: Leaderboard dari matches final saja

## Changes Made

### 1. API Leaderboard (`/api/public/leaderboard`)
- **Sebelumnya**: Mengambil data dari `TeamStanding` table (kumulatif)
- **Sekarang**: Menghitung real-time dari `DebateMatch` berdasarkan stage yang dipilih

### 2. Score Submission (`/api/judge/score`)
- **Sebelumnya**: Update `TeamStanding` table setiap kali match selesai
- **Sekarang**: Hanya menyimpan scores dan mark match as completed
- Leaderboard dihitung on-demand saat user memilih stage

### 3. Benefits
- ✅ Setiap stage punya leaderboard independen
- ✅ Tidak ada data kumulatif yang membingungkan
- ✅ Preliminary: 8 matches
- ✅ Semifinal: 1-2 matches (tergantung format)
- ✅ Final: 1-3 matches (tergantung format)
- ✅ Real-time calculation, selalu akurat

## Usage

### Frontend
```typescript
// Pilih stage di dropdown
<Select value={stage} onValueChange={setStage}>
  <SelectItem value="PRELIMINARY">Preliminary</SelectItem>
  <SelectItem value="SEMIFINAL">Semifinal</SelectItem>
  <SelectItem value="FINAL">Final</SelectItem>
</Select>

// API akan menghitung leaderboard untuk stage tersebut
fetch(`/api/public/leaderboard?competition=KDBI&stage=PRELIMINARY`)
```

### Expected Match Counts
- **PRELIMINARY**: 8 matches (Round 1-4, Sesi 1-2)
- **SEMIFINAL**: 1-2 matches (Round 1, Sesi 1-2)
- **FINAL**: 1-3 matches (tergantung format final)

## Migration Notes
- ❌ Script `recalculate-kdbi-standings-from-semifinal.js` **tidak perlu dijalankan lagi**
- ❌ `TeamStanding` table tidak lagi digunakan untuk leaderboard (bisa dihapus di masa depan)
- ✅ Leaderboard langsung berfungsi setelah code di-deploy
- ✅ Tidak perlu reset data apapun
