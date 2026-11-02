# SuratKu — Pembuat Surat Otomatis (versi HTML)

Website pembuat surat berbahasa Indonesia. Isi formulir, lihat pratinjau A4 secara
langsung, lalu cetak ke PDF atau unduh sebagai Word. **Tanpa PHP, tanpa server, tanpa database.**

## Cara menjalankan

Buka `index.html` langsung di browser (klik dua kali), atau unggah seluruh folder
ke hosting statis (GitHub Pages, Netlify, Vercel, Cloudflare Pages, atau hosting biasa).

## Struktur

```
index.html        halaman utama
assets/style.css  tampilan + gaya cetak
assets/app.js     template, formulir, pratinjau, simpan, ekspor Word
```

## Perubahan dari versi PHP

- Surat tersimpan sekarang disimpan di **localStorage browser** (bukan di server),
  jadi hanya terlihat di browser dan perangkat yang sama.
- Unduh Word (.doc) kini dibuat langsung di browser.
- Folder `api/`, `includes/`, dan `data/` dihapus karena tidak diperlukan lagi.
