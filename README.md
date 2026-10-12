# Gym Program

Inti dari chat program latihan. Data harian (set, rep, beban) ada di aplikasi tracker, bukan di sini.

| File | Isi | Seberapa sering berubah |
|---|---|---|
| [program.md](program.md) | Status sekarang, e1RM, jadwal & beban Versi A/B, rencana siklus, aturan progresi | Tiap akhir siklus / saat beban dihitung ulang |
| [decisions.md](decisions.md) | Keputusan yang sudah diambil beserta alasannya | Saat ada keputusan baru |
| body.md | Komposisi tubuh, target bulk, kalori & protein | Tiap scan / evaluasi kalori |
| index.html | Halaman web yang merender file-file di atas | Jarang |

## Cara pakai di chat baru

1. Kirim link repo ini dan minta Claude membaca `program.md` dan `decisions.md` dulu.
2. Untuk review, sertakan log dari aplikasi tracker (lift utama + rasanya per set: *enteng*, *berat tapi aman*, atau *mentok*).
3. Hasil review (beban baru, keputusan baru) di-commit balik ke sini.

## Halaman web

`index.html` membaca file `.md` langsung, jadi cukup edit `.md` lalu push. Bisa di-deploy sebagai situs statis (misalnya Cloudflare Pages, tanpa build command, output directory `/`).
