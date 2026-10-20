# CLAUDE.md

Repo ini bukan aplikasi: isinya program gym Syarif. Angka ada di `data/*.json`, aturan dan alasan di `.md`, dan `index.html` + `app.js` merender keduanya sebagai situs statis. Peran, aturan pelatihan, dan gaya jawaban ada di [project-instructions.md](project-instructions.md) (bagian di bawah garis) — ikuti itu juga saat bekerja di sini, termasuk bagian "Memperbarui repo".

## Data

- `data/cycles.json` — `cycles[]`: `start` (Senin, `YYYY-MM-DD`), `version`, `weeks[]` (`type` build/deload/test, `loads` per id latihan `{kg, sets?, result?, note?}`, `note`, `acc`, `skip`), `loads` (beban aksesori tetap per siklus `{load, target, as?}`), `notes`. `e1rm[]`: riwayat estimasi 1RM.
- `data/program.json` — `versions[]` → `days[]` → `ex[]` dengan `id`. Id lift utama (`squat-heavy`, `bench-heavy`, `dead-heavy`, `squat-light`, `bench-volume`, `squat-volume`) sengaja sama antarversi; id lain unik per versi.
- `data/body.json` — `nutrition`, `phase`, `waist_brake`, `next_scan`, `scans[]`.
- Nomor siklus, nomor minggu global, dan minggu sekarang **dihitung**, jangan ditulis manual.

## Konvensi

- `kg` di JSON berupa angka (`72.5`); teks bebas di `.md` dan field `load` pakai koma (`72,5 kg`). Dumbbell per tangan, barbell kelipatan 2,5 kg.
- e1RM = beban × (1 + rep ÷ 30).
- Sebelum commit: `python3 tools/check_data.py` harus `OK`.
- Commit: pesan singkat bahasa Indonesia, langsung ke `main`.

## Cek tampilan lokal

`app.js` mengambil file lewat `fetch`, jadi harus lewat server (bukan `file://`):

```
python3 -m http.server 8000   # http://localhost:8000
                              # http://localhost:8000/?today=2026-11-25 untuk tanggal lain
```
