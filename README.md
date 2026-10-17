# Gym Program

Inti dari chat program latihan. Data harian (set, rep, beban) ada di aplikasi tracker, bukan di sini.

| File | Isi | Seberapa sering berubah |
|---|---|---|
| [program.md](program.md) | Status sekarang, e1RM, jadwal & beban Versi B (dijalankan), A dan C, rencana siklus, aturan progresi | Tiap akhir siklus / saat beban dihitung ulang |
| [decisions.md](decisions.md) | Keputusan yang sudah diambil beserta alasannya | Saat ada keputusan baru |
| [body.md](body.md) | Komposisi tubuh, riwayat scan, target bulk, kalori & protein | Tiap scan / evaluasi kalori |
| [log-template.md](log-template.md) | Format log mingguan, nutrisi, dan scan untuk review | Jarang |
| [project-instructions.md](project-instructions.md) | Instruksi Claude Project "Progress Gym" | Saat cara kerja project diubah |
| index.html | Halaman web: tab Ringkas (minggu sekarang, beban minggu ini, e1RM, jadwal, tubuh) dihitung dari program.md & body.md, plus tab per file | Jarang |

## Cara pakai di Claude Project

1. Di project **Progress Gym**, tempel isi `project-instructions.md` (bagian di bawah garis) ke instruksi project.
2. Tidak perlu upload file. Tiap sesi meng-clone repo ini, membaca `program.md`, `decisions.md`, `body.md`, `log-template.md`, lalu commit perubahannya langsung.
3. Review: kirim log sesuai `log-template.md` (lift utama + rasa per set: *enteng*, *berat tapi aman*, *mentok*).

## Halaman web

`index.html` membaca file `.md` langsung, jadi cukup edit `.md` lalu push. Bisa di-deploy sebagai situs statis (misalnya Cloudflare Pages, tanpa build command, output directory `/`).

Tab **Ringkas** membaca minggu sekarang dari baris status `Siklus N mulai Senin, DD Bulan YYYY` di program.md, beban dari tabel yang kolom pertamanya `Minggu`, dan e1RM dari baris `Estimasi 1RM`. Pertahankan format itu saat memperbarui program.
