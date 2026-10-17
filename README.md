# Gym Program

Inti dari chat program latihan. Data harian (set, rep, beban) ada di aplikasi tracker, bukan di sini.

| File | Isi | Seberapa sering berubah |
|---|---|---|
| [program.md](program.md) | Status sekarang, e1RM, jadwal & beban Versi B (dijalankan), A dan C, rencana siklus, aturan progresi | Tiap akhir siklus / saat beban dihitung ulang |
| [decisions.md](decisions.md) | Keputusan yang sudah diambil beserta alasannya | Saat ada keputusan baru |
| [body.md](body.md) | Komposisi tubuh, riwayat scan, target bulk, kalori & protein | Tiap scan / evaluasi kalori |
| [log-template.md](log-template.md) | Format log mingguan, nutrisi, dan scan untuk review | Jarang |
| [project-instructions.md](project-instructions.md) | Instruksi Claude Project "Progress Gym" | Saat cara kerja project diubah |
| index.html | Halaman web yang merender file-file di atas | Jarang |

## Cara pakai di Claude Project

1. Di project **Progress Gym**, tempel isi `project-instructions.md` (bagian di bawah garis) ke instruksi project.
2. Tidak perlu upload file. Tiap sesi meng-clone repo ini, membaca `program.md`, `decisions.md`, `body.md`, `log-template.md`, lalu commit perubahannya langsung.
3. Review: kirim log sesuai `log-template.md` (lift utama + rasa per set: *enteng*, *berat tapi aman*, *mentok*).

## Halaman web

`index.html` membaca file `.md` langsung, jadi cukup edit `.md` lalu push. Bisa di-deploy sebagai situs statis (misalnya Cloudflare Pages, tanpa build command, output directory `/`).
