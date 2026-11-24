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
4. Set akses menjadi Anyone agar website publik dapat memanggil API. Endpoint ini memang dapat dipanggil publik; operasi pemilik tetap memerlukan token login.
5. Klik Deploy dan izinkan akses yang diminta Google.
6. Salin URL Web App yang berakhiran `/exec`. Simpan URL ini, karena akan dipasang pada Cloudflare Worker.

### Jika Apps Script sudah pernah di-deploy
1. Buka Deploy → Manage deployments.
2. Pilih deployment Web App yang sedang dipakai, lalu klik Edit.
3. Pada Version, pilih New version.
4. Klik Deploy. Biasanya URL `/exec` tetap sama untuk deployment yang diedit; gunakan URL yang ditampilkan di halaman deployment.

## 3. Sambungkan Cloudflare Worker
1. Buka Cloudflare Dashboard → Workers & Pages → Worker `hengky-portfolio-api`.
2. Buka Settings → Variables (atau Variables and Secrets).
3. Tambahkan atau perbarui variable `GAS_URL` dengan URL Web App `/exec` dari langkah sebelumnya.
4. Simpan perubahan dan lakukan Deploy bila diminta.
5. Pastikan Worker meneruskan request POST ke `GAS_URL` dan mengembalikan respons JSON. Frontend sudah memakai alamat Worker `https://hengky-portfolio-api.fotografihengky.workers.dev`.

Jangan memasukkan password pemilik ke Cloudflare, GitHub, atau kode frontend. Password hanya disimpan di Script Properties Apps Script.

## 4. Tes setelah aktivasi
Lakukan berurutan, dan jangan hapus karya asli saat uji coba.
1. Buka website GitHub Pages; pastikan profil, karya, dan foto termuat.
2. Buka dashboard pemilik dan login menggunakan password yang tersimpan pada Script Properties.
3. Uji Edit Profil dengan perubahan kecil, lalu kembalikan jika perlu.
4. Buat satu karya percobaan dengan file kecil; pastikan tampil di portfolio.
5. Ubah judul/deskripsi karya percobaan; pastikan media tetap sama.
6. Hapus hanya karya percobaan tersebut.
7. Kirim komentar dari jendela privat; pastikan statusnya menunggu persetujuan. Setujui komentar uji dan pastikan muncul di publik.
8. Kirim satu inquiry dari formulir; pastikan pesan terlihat di dashboard pemilik.
9. Periksa angka visitor counter di footer dan dashboard.
10. Tempel link PDF CV pada Edit Profil dan pastikan tombol Download CV muncul.
11. Ganti tema, warna customizer, lalu muat ulang untuk memastikan preferensi tersimpan.

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
- [ ] Salin versi terbaru `backend/Code.gs` ke Apps Script.
- [ ] Deploy versi terbaru Web App Apps Script.
- [ ] Perbarui `GAS_URL` di Cloudflare Worker.
- [ ] Jalankan seluruh pengujian integrasi live.
- [ ] Upload resumable untuk file besar.
- [x] Visitor counter persisten berbasis sesi browser.
- [x] Formulir inquiry dan kotak pesan masuk khusus pemilik.
- [x] Ulasan/testimonial dengan moderasi persetujuan.
- [x] Tautan Download CV yang diatur dari Edit Profil.
- [x] Pengeditan judul dan deskripsi karya tanpa unggah ulang media.
- [x] Creative Journey, metadata SEO dasar, dan drag-and-drop upload.
- [ ] Salin backend terbaru ke Apps Script, deploy ulang, lalu uji integrasi live.
- [ ] Upload resumable untuk file besar dan penguatan anti-spam lanjutan.
- [ ] Catatan: Pengujian deployment preview untuk branch redesign.
