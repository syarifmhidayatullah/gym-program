# Gym Program

Inti dari chat program latihan. Data harian (set, rep, beban) ada di aplikasi tracker, bukan di sini.

| File | Isi | Seberapa sering berubah |
|---|---|---|
| [data/cycles.json](data/cycles.json) | Siklus: tanggal mulai, versi, beban & hasil per minggu, beban aksesori; riwayat e1RM | Tiap review mingguan / akhir siklus |
| [data/program.json](data/program.json) | Template Versi A, B, C: hari, latihan, set × rep, intensitas, rest, beban awal | Saat latihan diganti |
| [data/body.json](data/body.json) | Kalori sekarang, riwayat scan Evolt | Tiap scan / evaluasi kalori |
| [program.md](program.md) | Aturan progresi, skala effort, pemanasan, tambahan di luar gym | Jarang |
| [decisions.md](decisions.md) | Keputusan yang sudah diambil beserta alasannya | Saat ada keputusan baru |
| [body.md](body.md) | Target bulk, penjelasan kalori & makro, aturan penyesuaian, cara mengukur | Saat aturan nutrisi berubah |
| [log-template.md](log-template.md) | Format log mingguan, nutrisi, dan scan untuk review | Jarang |
| [project-instructions.md](project-instructions.md) | Instruksi Claude Project "Progress Gym" | Saat cara kerja project diubah |
| index.html + app.js | Halaman web, membaca `data/*.json` dan `.md` | Jarang |
| [tools/check_data.py](tools/check_data.py) | Cek `data/*.json` sebelum commit | Jarang |
| vendor/marked.min.js | Library marked v12.0.2 (Markdown → HTML), disimpan lokal supaya halaman tidak bergantung ke CDN | Hampir tidak pernah |

## Cara pakai di Claude Project

1. Di project **Progress Gym**, tempel isi `project-instructions.md` (bagian di bawah garis) ke instruksi project.
2. Tidak perlu upload file. Tiap sesi meng-clone repo ini, membaca `data/*.json`, `program.md`, `decisions.md`, `body.md`, `log-template.md`, lalu commit perubahannya langsung.
3. Review: kirim log sesuai `log-template.md` (lift utama + rasa per set: *enteng*, *berat tapi aman*, *mentok*).

## Halaman web

`index.html` membaca `data/*.json` dan file `.md` langsung, jadi cukup edit lalu push. Bisa di-deploy sebagai situs statis (misalnya Cloudflare Pages, tanpa build command, output directory `/`). Di lokal: `python3 -m http.server 8000` lalu buka http://localhost:8000.

Minggu sekarang dihitung dari tanggal `start` tiap siklus di `data/cycles.json`, jadi tidak ada baris status yang perlu diganti tiap minggu. Siklus baru = tambah satu entri di `cycles`; siklus lama otomatis pindah ke riwayat. Tambahkan `?today=YYYY-MM-DD` di URL untuk melihat tampilan di tanggal lain.

Sebelum commit, jalankan `python3 tools/check_data.py`.
