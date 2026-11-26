# GOD EYE VIEW — Virtual Tour 360°

## Tujuan

Modul Virtual Tour 360° merupakan modul terpisah di dalam GOD EYE VIEW. Modul ini menambahkan visualisasi panorama interior gedung yang terhubung ke globe Cesium melalui marker lokasi, tanpa mengganti sistem layer pemantauan yang sudah ada.

## Membuka modul

Jalankan GOD EYE VIEW seperti biasa, lalu buka:

`/virtual-tour/`

Contoh lokal: `http://localhost:4173/virtual-tour/`

## Fitur MVP

- Memuat satu atau beberapa foto panorama equirectangular melalui browser.
- Menampilkan panorama menggunakan Pannellum 2.5.6.
- Membuat hotspot perpindahan antar-ruangan.
- Mengunggah gambar denah dan menempatkan penanda ruangan.
- Menyimpan panorama, denah, hotspot, dan metadata gedung di IndexedDB browser.
- Menyimpan latitude/longitude gedung sebagai metadata bersama pada IndexedDB browser.
- Menampilkan marker gedung pada globe Cesium utama jika koordinat valid telah disimpan.
- Klik marker gedung pada globe untuk membuka Virtual Tour pada tab baru.
- Tombol Street View pada action bar globe membuka halaman pengelolaan Virtual Tour.

## Format foto

Gunakan foto panorama equirectangular 360°, idealnya rasio 2:1. Foto biasa tetap dapat dimuat, tetapi hasil pandang 360° tidak akan benar jika sumber bukan panorama penuh.

## Penyimpanan dan privasi

Data MVP disimpan di IndexedDB pada browser/perangkat yang digunakan. Data belum otomatis tersinkron ke VPS, GitHub, atau perangkat lain. Jangan memasukkan foto area terbatas, informasi sensitif, atau koordinat fasilitas yang tidak boleh dipublikasikan ke repository GitHub. Foto yang diunggah tidak dikirim ke GitHub oleh modul ini.

## Ketergantungan

Penampil Pannellum dimuat dari jsDelivr CDN. Koneksi internet diperlukan untuk memuat library tersebut. File panorama tetap disimpan lokal di browser.

## Tahap integrasi berikutnya

1. Tambahkan API backend dan autentikasi untuk sinkronisasi antarperangkat.
4. Tambahkan tautan berbagi dan QR code setelah penyimpanan server tersedia.
5. Integrasikan AI untuk menyusun deskripsi ruangan dari informasi yang telah disetujui pengguna.
6. Tambahkan proses stitching panorama dan pemeriksaan kualitas gambar bila diperlukan.

## Batasan MVP

Modul ini belum menyediakan stitching foto mentah, rekonstruksi mesh 3D, pemetaan otomatis, analitik pengunjung, akun pengguna, atau sinkronisasi server. Fitur-fitur tersebut memerlukan layanan dan pengujian tersendiri.