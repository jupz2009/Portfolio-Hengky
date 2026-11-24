# Panduan aktivasi backend portfolio

Frontend berada di GitHub Pages (`index.html`). File backend yang dipakai adalah `backend/Code.gs`. Cloudflare Worker tetap menjadi penghubung antara frontend dan Google Apps Script.

## 1. Pasang Apps Script
1. Buka https://script.google.com/ dan buat project baru.
2. Salin seluruh isi `backend/Code.gs` ke file `Code.gs` pada project Apps Script.
3. Buka Project Settings → Script Properties.
4. Pastikan properti `OWNER_PASSWORD` sudah tersedia. Pertahankan nilai yang saat ini kamu gunakan; jangan menuliskan password ke GitHub atau file kode.
5. Simpan project.

Database Google Sheets dan folder Drive akan dibuat otomatis saat pertama kali API dipanggil. Akun Google yang menjalankan Apps Script akan menjadi pemilik file-file tersebut.

## 2. Deploy sebagai Web App
1. Klik Deploy → New deployment.
2. Pilih Web app.
3. Set Execute as menjadi akun pemilik script.
4. Set akses sesuai kebutuhan API publik portfolio (umumnya Anyone). Endpoint dapat dipanggil publik; tindakan pemilik tetap memerlukan token login.
5. Deploy, lalu salin URL Web App yang berakhiran /exec.

## 3. Sambungkan Cloudflare Worker
Di pengaturan Worker hengky-portfolio-api, buat atau perbarui environment variable:
- `GAS_URL` = URL Web App /exec dari langkah sebelumnya.

Pastikan Worker meneruskan request POST ke GAS_URL dan mengembalikan respons JSON. Setelah mengganti versi Apps Script, deploy ulang versi Web App jika diminta.

## 4. Tes setelah aktivasi
- Buka website GitHub Pages dan pastikan profil serta karya termuat.
- Login sebagai pemilik.
- Kirim komentar percobaan dari jendela privat; komentar harus masuk antrean Menunggu.
- Setujui komentar dari dashboard; komentar baru muncul di area publik.
- Tolak komentar lain; komentar tersebut tidak tampil untuk pengunjung.
- Uji edit profil, upload file kecil, dan hapus karya percobaan.

## Catatan batas dan privasi
- Jalur upload yang ada saat ini masih memakai Base64 melalui Apps Script dan dibatasi 20 MB per file. Upload besar/resumable belum diaktifkan; jangan menganggap penyimpanan tanpa batas.
- Penyimpanan Google Drive mengikuti kapasitas akun dan kuota layanan Google. Akun gratis umumnya berbagi kapasitas 15 GB antara Drive, Gmail, dan Photos; kapasitas aktual akun perlu diperiksa di Google.
- File karya dan foto profil saat ini dibuat Anyone with the link – Viewer agar dapat dilihat publik pada portfolio. Jangan unggah dokumen pribadi atau file sensitif.
- Pembatasan komentar berbasis nama hanya perlindungan dasar, bukan anti-spam kuat. API publik masih memerlukan pengujian dan penguatan tambahan sebelum dipakai secara luas.
- Jangan menghapus atau mengganti spreadsheet/folder yang sudah terhubung melalui Script Properties tanpa membuat cadangan.

## Status implementasi
- [x] Frontend editorial, filter, pencarian, tema, galeri, detail proyek, dashboard statistik.
- [x] Kode backend Apps Script terpisah dari frontend.
- [x] Password pemilik dibaca dari Script Properties, bukan ditanam di source.
- [x] Moderasi komentar: komentar baru Pending, pemilik dapat menyetujui/menolak.
- [ ] Salin dan deploy Apps Script pada akun pemilik.
- [ ] Isi GAS_URL di Cloudflare Worker.
- [ ] Uji integrasi live di website.
- [ ] Upload resumable untuk file besar.
- [x] Visitor counter persisten berbasis sesi browser.
- [x] Formulir inquiry dan kotak pesan masuk khusus pemilik.
- [x] Ulasan/testimonial dengan moderasi persetujuan.
- [x] Tautan Download CV yang diatur dari Edit Profil.
- [x] Pengeditan judul dan deskripsi karya tanpa unggah ulang media.
- [x] Creative Journey, metadata SEO dasar, dan drag-and-drop upload.
- [ ] Salin backend terbaru ke Apps Script, deploy ulang, lalu uji integrasi live.
- [ ] Upload resumable untuk file besar dan penguatan anti-spam lanjutan.