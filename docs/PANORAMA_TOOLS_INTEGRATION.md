# GOD EYE VIEW — Panorama Tools Integration

## Shortcut utama

- Di dalam aplikasi GOD EYE VIEW: tombol **360°** pada toolbar globe membuka `/panorama-tools/`.
- Halaman pengelola: `/panorama-tools/`.
- Modul panorama internal: `/virtual-tour/`.

## Fitur yang sudah tersedia pada modul internal

| Fitur | Implementasi |
|---|---|
| Unggah banyak foto panorama | Pannellum viewer dan penyimpanan IndexedDB |
| Walkthrough antar-ruangan | Hotspot scene-to-scene |
| Navigasi denah | Upload denah dan marker ruangan |
| Geolokasi gedung | Metadata latitude/longitude dan marker Cesium |
| Perbandingan 360° | Dua panorama dengan arah pandang dan zoom tersinkronisasi |
| Cadangan proyek | ZIP lokal berisi foto, denah, metadata, hotspot, dan manifest JSON |

Cadangan ZIP dibuat pada browser pengguna. Fitur impor/pemulihan ZIP belum tersedia. Penyimpanan IndexedDB bersifat lokal per browser/perangkat dan belum tersinkron ke VPS atau antarperangkat.

## Audit tiga repositori sumber

### 1. In360TourBuilder

Repositori: https://github.com/inqiu/in360TourBuilder

- Struktur yang ditemukan adalah aplikasi Java desktop, dengan kelas GUI, koleksi panorama, pembentuk XML tur, pemroses gambar, dan FTP uploader.
- README dan berkas LICENSE tidak ditemukan pada pohon repositori yang diperiksa.
- Tidak digabung ke aplikasi web GOD EYE VIEW karena lisensi tidak terverifikasi dan arsitektur Java desktop tidak dapat dipasang sebagai modul Vue/Vite secara langsung.
- Integrasi lanjutan memerlukan izin/lisensi yang jelas dan spesifikasi format proyek/ekspor.

### 2. Panorama Site Builder

Repositori: https://github.com/Berengow/panorama-site-builder

- README menyatakan MIT dan menjelaskan builder HTML/CSS/JS berbasis Pannellum, hotspot, tema, dan ekspor ZIP.
- Berkas LICENSE terpisah tidak ditemukan pada root yang diperiksa.
- `js/app.js` yang tersedia hanya sekitar 2,2 KB dan berisi placeholder bahwa logika aplikasi lengkap belum disertakan. Karena itu, repositori tidak dapat diperlakukan sebagai aplikasi siap pakai untuk digabung.
- Fitur yang kompatibel (pengelolaan panorama, hotspot, dan cadangan ZIP) dibuat sebagai implementasi native GOD EYE VIEW; bukan salinan kode upstream.

### 3. PanoLoop

Repositori: https://github.com/arminmstfv/PanoLoop

- Lisensi MIT tersedia dan telah diperiksa.
- README menjelaskan panorama walkthrough, hotspot, navigasi denah, dan mode perbandingan dua panorama.
- File aplikasi tunggal upstream berukuran besar; kode upstream tidak disalin langsung ke modul GEV.
- Fitur perbandingan dua panorama dengan sinkronisasi arah pandang/zoom diimplementasikan secara native pada GEV.

## Batasan dan status

- Ini adalah integrasi fitur yang kompatibel ke satu modul GOD EYE VIEW, bukan penggabungan mentah seluruh source code dari tiga repositori.
- In360TourBuilder tetap menjadi referensi eksternal sampai lisensi dan jalur integrasinya jelas.
- Tema builder lanjutan, ekspor situs statis siap-hosting, impor/pemulihan ZIP, stitching panorama, akun, backend, dan sinkronisasi multi-perangkat belum tersedia.
- Foto dan metadata tetap berada di IndexedDB browser; jangan menyimpan materi sensitif pada perangkat atau server yang tidak disetujui.
- Perubahan berada di branch `feature/virtual-tour-360` dan PR #1. Belum digabung ke `main` dan belum dipublikasikan ke hosting produksi.

## Verifikasi

File baru/diubah pada tahap ini:
- `public/virtual-tour/compare.js`
- `public/virtual-tour/backup.js`
- `public/virtual-tour/index.html`
- `public/virtual-tour/style.css`
- `public/panorama-tools/index.html`

Build produksi dan pengujian browser end-to-end belum dijalankan pada tahap ini.
