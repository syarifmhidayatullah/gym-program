# CLAUDE.md

Repo ini bukan kode: isinya program gym Syarif dalam markdown, plus `index.html` yang merender file-file itu. Peran, aturan pelatihan, dan gaya jawaban ada di [project-instructions.md](project-instructions.md) (bagian di bawah garis) — ikuti itu juga saat bekerja di sini.

## File

- `program.md` — status, beban per minggu, Versi A/B/C, aturan progresi. Versi B yang dijalankan.
- `decisions.md` — keputusan + alasan. Jangan usulkan ulang tanpa alasan baru; keputusan baru = satu poin di bagian yang sesuai.
- `body.md` — komposisi tubuh, scan, kalori, aturan penyesuaian.
- `log-template.md`, `project-instructions.md` — jarang berubah.

## Format yang dibaca `index.html` (jangan diubah)

- Baris status: `Siklus N mulai Senin, DD Bulan YYYY` (nama bulan Indonesia).
- Tabel beban mingguan: kolom pertama header `Minggu`; header kolom lift memuat hari dalam kurung, mis. `Squat 5×5 (Sen)`.
- Satu baris `Estimasi 1RM` berisi `Squat ±X kg · Bench ±X kg · Deadlift ±X kg`.
- Heading `### Minggu N: …` untuk minggu khusus (deload), `### Aksesori siklus N …`, `## Versi X — …`, `### Hari: Nama sesi`.
- Tabel latihan memakai kolom `Rest` dan `Beban …`.
- `body.md`: `**Sekarang: N kkal/hari …**`, `**Protein N–N g**`, `**Rem: lingkar perut N cm.**`, tabel riwayat scan dengan baris baseline ditebalkan.

## Konvensi

- Angka desimal pakai koma (`72,5 kg`), dumbbell per tangan, barbell kelipatan 2,5 kg.
- e1RM = beban × (1 + rep ÷ 30).
- Commit: pesan singkat bahasa Indonesia, langsung ke `main`.

## Cek tampilan lokal

`index.html` mengambil `.md` lewat `fetch`, jadi harus lewat server (bukan `file://`):

```
python3 -m http.server 8000   # lalu buka http://localhost:8000
```
