<?php
declare(strict_types=1);

// Cache-busting sederhana: versi aset mengikuti waktu modifikasi file.
function asset(string $path): string
{
    $full = __DIR__ . '/' . $path;
    $v = is_file($full) ? (string) filemtime($full) : '1';
    return htmlspecialchars($path . '?v=' . $v, ENT_QUOTES);
}
?><!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SuratMobile</title>
  <meta name="description" content="Isi formulir, lihat pratinjau surat secara langsung, lalu cetak PDF atau unduh sebagai Word.">
  <link rel="stylesheet" href="<?= asset('assets/style.css') ?>">
</head>
<body>

<header class="topbar">
  <div class="brand">
    <span class="brand-mark" aria-hidden="true">S</span>
    <div>
      <h1>SuratMobile</h1>
      <p>Pembuat surat otomatis</p>
    </div>
  </div>
  <div class="topbar-actions">
    <button type="button" class="btn ghost" id="btn-new">Surat baru</button>
    <button type="button" class="btn ghost" id="btn-open">Surat tersimpan</button>
    <button type="button" class="btn ghost" id="btn-save">Simpan</button>
    <button type="button" class="btn ghost" id="btn-word">Unduh Word</button>
    <button type="button" class="btn primary" id="btn-print">Cetak / PDF</button>
  </div>
</header>

<nav class="tabs" aria-label="Tampilan">
  <button type="button" class="tab is-active" data-pane="form">Isi data</button>
  <button type="button" class="tab" data-pane="preview">Pratinjau</button>
</nav>

<main class="layout">
  <section class="panel pane-form is-active" id="pane-form" aria-label="Formulir surat">

    <fieldset>
      <legend>1. Jenis surat</legend>
      <label class="field">
        <span>Pilih template</span>
        <select id="template" data-k="template"></select>
      </label>
    </fieldset>

    <fieldset>
      <legend>2. Data pengirim</legend>
      <label class="field"><span>Nama lengkap</span>
        <input type="text" data-k="pengirim_nama" placeholder="Nama Lengkap" autocomplete="name"></label>
      <label class="field"><span>Alamat</span>
        <textarea data-k="pengirim_alamat" rows="2" placeholder="Alamat Pengirim"></textarea></label>
      <label class="field"><span>Telepon / email</span>
        <input type="text" data-k="pengirim_kontak" placeholder="0812-0000-0000 · example@email.com"></label>
    </fieldset>

    <fieldset>
      <legend>3. Data surat</legend>
      <div class="row">
        <label class="field"><span>Kota</span>
          <input type="text" data-k="kota" placeholder="Kota"></label>
        <label class="field"><span>Tanggal</span>
          <input type="date" data-k="tanggal"></label>
      </div>
      <div class="row">
        <label class="field"><span>Nomor <em>(opsional)</em></span>
          <input type="text" data-k="nomor" placeholder="012/HRD/X/2026"></label>
        <label class="field"><span>Lampiran <em>(opsional)</em></span>
          <input type="text" data-k="lampiran" placeholder="1 (satu) berkas"></label>
      </div>
      <label class="field"><span>Perihal <em>(kosongkan untuk otomatis)</em></span>
        <input type="text" data-k="perihal" id="perihal"></label>
    </fieldset>

    <fieldset>
      <legend>4. Penerima</legend>
      <label class="field"><span>Jabatan / nama penerima</span>
        <input type="text" data-k="penerima_jabatan" placeholder="Bapak/Ibu Pimpinan"></label>
      <label class="field"><span>Instansi / perusahaan</span>
        <input type="text" data-k="penerima_instansi" placeholder="PT Maju Bersama"></label>
      <label class="field"><span>Alamat <em>(opsional)</em></span>
        <textarea data-k="penerima_alamat" rows="2" placeholder="Jl. Sudirman No. 1, Jakarta"></textarea></label>
    </fieldset>

    <fieldset>
      <legend>5. Detail khusus</legend>
      <div id="extra"></div>
    </fieldset>

    <fieldset>
      <legend>6. Isi surat</legend>
      <p class="hint">Isi dibuat otomatis dari data di atas. Anda bebas mengubahnya; pisahkan paragraf dengan baris kosong.</p>
      <label class="field"><span>Teks isi</span>
        <textarea id="isi" data-k="isi" rows="12"></textarea></label>
      <button type="button" class="btn small" id="btn-auto">Isi ulang otomatis</button>
      <div class="row top-gap">
        <label class="field"><span>Salam pembuka</span>
          <input type="text" data-k="pembuka" value="Dengan hormat,"></label>
        <label class="field"><span>Salam penutup</span>
          <input type="text" data-k="penutup" value="Hormat saya,"></label>
      </div>
    </fieldset>

    <fieldset>
      <legend>7. Tampilan</legend>
      <div class="row">
        <label class="field"><span>Huruf</span>
          <select data-k="font">
            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Georgia">Georgia</option>
          </select></label>
        <label class="field"><span>Ukuran</span>
          <select data-k="size">
            <option value="11">11 pt</option>
            <option value="12" selected>12 pt</option>
            <option value="13">13 pt</option>
          </select></label>
      </div>
      <label class="check"><input type="checkbox" data-k="kop" id="kop"> <span>Pakai kop surat</span></label>
      <div id="kop-fields" hidden>
        <label class="field"><span>Nama instansi (kop)</span>
          <input type="text" data-k="kop_nama" placeholder="PT MAJU BERSAMA"></label>
        <label class="field"><span>Alamat &amp; kontak (kop)</span>
          <textarea data-k="kop_alamat" rows="2" placeholder="Jl. Sudirman No. 1, Jakarta · Telp. (021) 000000"></textarea></label>
      </div>
    </fieldset>

    <p class="foot-note">Draf tersimpan otomatis di browser ini. Tombol <strong>Simpan</strong> menyimpannya ke server.</p>
  </section>

  <section class="panel pane-preview" id="pane-preview" aria-label="Pratinjau surat">
    <div class="preview-bar">
      <span>Pratinjau langsung · A4</span>
    </div>
    <div class="stage" id="stage">
      <div class="scaler" id="scaler">
        <article class="sheet" id="sheet"></article>
      </div>
    </div>
  </section>
</main>

<dialog id="dlg-list">
  <form method="dialog" class="dlg-head">
    <h2>Surat tersimpan</h2>
    <button class="btn ghost small" value="close">Tutup</button>
  </form>
  <ul id="list" class="saved-list"></ul>
  <p id="list-empty" class="hint" hidden>Belum ada surat yang disimpan.</p>
</dialog>

<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>

<script src="<?= asset('assets/app.js') ?>"></script>
</body>
</html>
