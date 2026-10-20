# Program Powerbuilding 5 Hari

Prioritas: kekuatan squat, bench, deadlift dulu, lalu ukuran otot.

## Data program

Angka program ada di folder `data/`, bukan di file ini:

- [`data/cycles.json`](data/cycles.json): siklus (tanggal mulai, versi, beban dan hasil per minggu, beban aksesori), riwayat estimasi 1RM. Minggu sekarang dihitung dari tanggal mulai siklus.
- [`data/program.json`](data/program.json): template Versi A, B, C (hari, latihan, set × rep, intensitas, rest, beban awal). Versi yang dijalankan = versi siklus yang sedang berjalan.

File ini berisi aturan yang dipakai untuk menyusun angka-angka itu.

- **Jadwal harian:** tidur 22.00–04.30 (±6,5 jam), latihan 06.00–07.30.
- **Siklus:** 5 minggu, minggu 1–4 membangun, minggu 5 deload. Siklus berikutnya mundur satu langkah dari minggu 4 lalu naik melewatinya (lihat [decisions.md](decisions.md)).
- **Nutrisi:** lihat [body.md](body.md).

## Aturan progresi

- **Hari berat lift utama:** kalau semua set selesai di *berat tapi aman* (≈RPE 8) atau lebih ringan, naikkan minggu berikutnya: squat & deadlift +2,5 kg, bench +1–2,5 kg (bench boleh naik tiap 2 minggu). Ada set *mentok* → tahan beban. Gagal dua minggu berturut-turut → turunkan 5–10% lalu bangun lagi.
- **Bench 5×3–5:** mulai 5×3, tambah rep tiap sesi sampai 5×5, lalu naikkan beban dan kembali ke 5×3.
- **Hari volume & aksesori:** double progression. Kalau semua set mencapai rep teratas, naikkan beban sesi berikutnya. Set terakhir aksesori boleh sampai gagal hanya untuk gerakan aman (mesin, curl, lateral raise, pushdown), bukan barbell compound.
- **Hemat waktu (opsional):** aksesori mesin/isolasi (leg extension, leg curl, lateral raise, fly, curl, pushdown) boleh diganti dari 3 set RPE 8 jadi **2 set sampai gagal**. Lift utama dan compound berat tetap RPE 7–8.
- **Deload:** tiap siklus 5 minggu: minggu 1–4 membangun, minggu 5 deload (set dipotong setengah, beban ±60–70%). Minggu pertama siklus berikutnya: hitung ulang e1RM dari log minggu ke-4 siklus sebelumnya. Kalau di minggu 4 badan terasa lelah terus, majukan deload.
- **Estimasi 1RM:** beban × (1 + rep ÷ 30). Contoh 90 kg × 3 ≈ 99 kg.
- **Kurang tidur / kerja berat:** tahan beban minggu itu, jangan paksa naik.

## Skala effort (pengganti RPE)

| Kategori | Rasanya | ≈ RPE |
|---|---|---|
| **Enteng** | Rep terakhir masih cepat, yakin bisa tambah banyak | 6–7 |
| **Berat tapi aman** | Rep terakhir mulai melambat, yakin masih 1–2 rep lagi | 8–9 |
| **Mentok** | Rep terakhir sangat lambat, atau gagal | 10 |

Tanda paling gampang: kecepatan bar. Target lift utama selalu *berat tapi aman*; sesi ringan & pemanasan *enteng*.

**Target effort berlaku untuk set terakhir (set terberat), bukan set pertama.** Dengan beban sama di semua set, set awal wajar terasa *enteng* dan makin berat ke belakang. Contoh 5×5 squat: set 1–2 enteng, set 3–4 mulai berat, set 5 berat tapi aman. Kalau set terakhir *mentok* → tahan beban minggu depan. Kalau set pertama sudah *berat tapi aman* → beban terlalu berat untuk hari itu, turunkan 2,5–5 kg. Untuk aksesori, rep boleh turun sedikit di set akhir (misalnya 12, 11, 10); itu normal dalam double progression.

Format log untuk review: `Squat 72,5 kg × 5, berat tapi aman` · `Bench 65 kg × 3, enteng` · `Deadlift 102,5 kg × 3, mentok di set 4`.

## Pemanasan

- **Makan sebelum latihan:** karbohidrat cepat 30–45 menit sebelumnya (pisang, roti, oat) plus sedikit protein. Kalau perut belum siap makanan padat, minuman saja cukup. Jangan latihan dengan perut kosong total.
- 5–10 menit gerakan ringan dulu (sepeda statis, hip mobility, band pull-apart), apalagi karena latihan jam 6 pagi; jam segitu beban wajar terasa 3–5% lebih berat.
- **Hari berat tambah satu tangga pemanasan**, misalnya squat 20 → 40 → 50 → 60 → set kerja 65.
- **Deadlift pagi:** tambahkan back extension ringan atau hip hinge tanpa beban sebelum set pertama.
- Lalu bar kosong ×8–10, naik bertahap sambil menurunkan rep. Contoh deadlift set kerja 90 kg: 60×5 → 70×3 → 80×2 → 85×1 → 90 set kerja.

## Tambahan di luar sesi gym

- **Pull-up 3×8 & push-up 3×22** (±60–70% dari max: pull-up 13, push-up 35). Versi B: malam Rabu, Sabtu, atau Minggu (hindari malam Senin & Kamis karena besoknya Upper A/B). Kalau pindah ke Versi A: malam Kamis–Minggu (hindari Senin, Selasa, Rabu), selesai paling lambat 20.00–20.30. Berhenti saat sisa 3–4 rep. Semua set enteng selama seminggu → +1 rep per set. Tes ulang max tiap 4 minggu. Push-up sudah 25+ per set → buat lebih berat (kaki ditinggikan, ransel berbeban), kembali ke 12–20 rep.
- **Kardio setelah gym:** jalan cepat / sepeda santai 15–20 menit, intensitas rendah. Bukan HIIT, terutama di hari squat & deadlift.
- **Boxing:** lihat [decisions.md](decisions.md).
