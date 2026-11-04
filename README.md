# MeNotch — Landing page

Halaman promosi MeNotch. HTML + CSS + JavaScript biasa: tanpa framework, tanpa build, tanpa `npm install`.

## Menjalankan

Cukup buka `index.html` di browser (klik dua kali), atau jalankan server lokal:

```sh
cd ~/Documents/Project_Rezky/MeNotch-Landing
python3 -m http.server 8000   # lalu buka http://localhost:8000
```

Untuk online: unggah seluruh folder ini apa adanya ke hosting statis mana pun (Cloudflare Pages, Netlify, GitHub Pages).

## Isi folder

| Path | Isi |
|---|---|
| `index.html` | Seluruh halaman (10 bab) |
| `css/style.css` | Semua gaya, warna = 6 preset tema aplikasi |
| `js/app.js` | Notch interaktif, mata yang mengikuti kursor, tab, baris momen tanpa ujung |
| `assets/` | Ikon aplikasi, foto notch (lisensi CC BY-SA 4.0, kredit di footer), `credits.json` |
| `download/MeNotch.dmg` | Salinan build QA terakhir — ganti dengan build rilis sebelum online |
| `.taste-skill/` | File kerja desain (arah desain, screenshot pengecekan). Boleh dihapus. |

## Yang interaktif

- **Notch di atas layar** menempel seperti notch asli. Arahkan kursor (atau ketuk di HP) → terbuka jadi tab Beranda dengan jam asli dan kalender bulan ini. Klik matanya untuk "mencolek".
- Setiap bab punya warna preset sendiri; notch ikut berganti warna dan isi (lagu, timer, ngecas, ngantuk…). Di bab hitam, warnanya ikut pilihan pengunjung.
- **Salin teks apa saja** di halaman → muncul baris "Disalin" seperti di aplikasi. Seret file ke halaman → "Lepaskan untuk menambahkan".
- **Bab Mata**: ganti suasana hati & 6 tema warna (tersimpan di browser).
- **Bab Lima tab**: bagian ini menempel saat di-scroll. Scroll turun → Beranda, Fokus, Naskah, Rak, Klip bergantian; scroll naik → mundur lagi. Klik nama tab (atau tombol panah) untuk loncat. Notch di atas ikut berganti isi per tab.
- **Bab Momen**: dua baris tanpa ujung; kecepatan & arah ikut scroll, bisa digeser (drag).
- Diam 45 detik → maskot mengantuk (sama seperti aplikasi).
- Semua animasi mati otomatis bila sistem meminta *Reduce motion*.

## Tipografi & gaya tulisan

- Huruf: **Noto Sans** (dasar dari font IKEA) — 800 untuk judul, 400/700 untuk teks. Tampilan app di dalam notch tetap pakai font sistem macOS supaya mirip aslinya.
- Gaya tulisan ala IKEA: kalimat pendek, poin utama dulu (ditebalkan), lalu detail sederhana. Sapaan "kamu", sedikit humor, tanpa istilah teknis.

## Ganti sebelum online

- Konten contoh: acara kalender (Standup tim, dll.), lagu "Sore di Teras — Nada Kopi", tugas, nama file, isi clipboard.
- Tautan unduh `download/MeNotch.dmg` → build rilis (Developer ID + notarisasi).
- Belum ada harga, kontak, atau kebijakan privasi — tambahkan bila diperlukan.
