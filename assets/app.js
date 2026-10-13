(() => {
  'use strict';

  /* ---------- Util ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const nl = (s) => esc(s).replace(/\n/g, '<br>');
  const val = (v, fallback = '……………') => (v && String(v).trim() ? String(v).trim() : fallback);

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const todayISO = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  /* ---------- Template ---------- */
  const TEMPLATES = {
    lamaran: {
      label: 'Surat Lamaran Kerja',
      perihal: (d) => `Lamaran Pekerjaan sebagai ${val(d.x_posisi, '……')}`,
      extra: [
        { id: 'posisi', label: 'Posisi yang dilamar', ph: 'Staf Administrasi' },
        { id: 'sumber', label: 'Sumber informasi lowongan', ph: 'situs karier perusahaan' },
        { id: 'pendidikan', label: 'Pendidikan terakhir', ph: 'S1 Manajemen, Universitas Contoh' },
        { id: 'keahlian', label: 'Keahlian utama', ph: 'Microsoft Office, komunikasi, pelayanan pelanggan' },
      ],
      defaults: { pembuka: 'Dengan hormat,', penutup: 'Hormat saya,' },
      body: (d) => [
        `Berdasarkan informasi yang saya peroleh dari ${val(d.x_sumber)}, saya mengetahui bahwa ${val(d.penerima_instansi, 'perusahaan Bapak/Ibu')} sedang membuka lowongan untuk posisi ${val(d.x_posisi)}. Sehubungan dengan hal tersebut, saya bermaksud mengajukan lamaran untuk bergabung dengan perusahaan yang Bapak/Ibu pimpin.`,
        `Saya merupakan lulusan ${val(d.x_pendidikan)} dengan keahlian dalam ${val(d.x_keahlian)}. Saya memiliki ketertarikan besar pada bidang ini, mampu bekerja secara mandiri maupun dalam tim, serta siap belajar dan beradaptasi dengan cepat.`,
        'Sebagai bahan pertimbangan, bersama surat ini saya lampirkan daftar riwayat hidup (CV) beserta dokumen pendukung lainnya.',
        'Besar harapan saya untuk diberi kesempatan wawancara agar dapat menjelaskan kemampuan saya lebih lanjut. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.',
      ].join('\n\n'),
    },

    izin: {
      label: 'Surat Izin Tidak Masuk',
      perihal: () => 'Permohonan Izin',
      extra: [
        { id: 'jabatan', label: 'Jabatan / kelas / NIM / NIP', ph: 'Staf Keuangan' },
        { id: 'mulai', label: 'Izin mulai tanggal', type: 'date' },
        { id: 'selesai', label: 'Sampai tanggal', type: 'date' },
        { id: 'alasan', label: 'Alasan izin', ph: 'keperluan keluarga yang tidak dapat ditinggalkan', area: true },
      ],
      defaults: { pembuka: 'Dengan hormat,', penutup: 'Hormat saya,' },
      body: (d) => {
        const m = fmtDate(d.x_mulai);
        const s = fmtDate(d.x_selesai);
        const waktu = m && s && m !== s ? `pada tanggal ${m} sampai dengan ${s}` : `pada tanggal ${val(m || s)}`;
        return [
          'Saya yang bertanda tangan di bawah ini:',
          `Nama : ${val(d.pengirim_nama)}\nJabatan/Kelas : ${val(d.x_jabatan)}`,
          `Dengan ini mengajukan permohonan izin tidak masuk ${waktu} dikarenakan ${val(d.x_alasan)}.`,
          'Demikian surat izin ini saya sampaikan. Atas pengertian dan kebijaksanaan Bapak/Ibu, saya ucapkan terima kasih.',
        ].join('\n\n');
      },
    },

    resign: {
      label: 'Surat Pengunduran Diri',
      perihal: () => 'Pengunduran Diri',
      extra: [
        { id: 'jabatan', label: 'Jabatan saat ini', ph: 'Staf Pemasaran' },
        { id: 'bergabung', label: 'Mulai bekerja sejak', type: 'date' },
        { id: 'efektif', label: 'Tanggal efektif berhenti', type: 'date' },
        { id: 'alasan', label: 'Alasan (singkat, opsional)', ph: 'ingin melanjutkan pendidikan', area: true },
      ],
      defaults: { pembuka: 'Dengan hormat,', penutup: 'Hormat saya,' },
      body: (d) => {
        const alasan = d.x_alasan && d.x_alasan.trim() ? `, dikarenakan ${d.x_alasan.trim()}` : '';
        const sejak = fmtDate(d.x_bergabung);
        return [
          `Saya yang bertanda tangan di bawah ini, ${val(d.pengirim_nama)}, yang saat ini menjabat sebagai ${val(d.x_jabatan)}${sejak ? ` dan telah bekerja sejak ${sejak}` : ''}, bermaksud mengajukan pengunduran diri dari ${val(d.penerima_instansi, 'perusahaan')}${alasan}.`,
          `Pengunduran diri ini akan berlaku efektif pada tanggal ${val(fmtDate(d.x_efektif))}. Selama masa peralihan, saya bersedia menyelesaikan seluruh tanggung jawab dan membantu proses serah terima pekerjaan.`,
          'Saya mengucapkan terima kasih atas kesempatan, bimbingan, dan pengalaman berharga yang telah saya peroleh selama bekerja di sini. Mohon maaf atas segala kekurangan dan kekhilafan selama saya bertugas.',
        ].join('\n\n');
      },
    },

    resmi: {
      label: 'Surat Resmi Umum',
      perihal: (d) => val(d.x_perihal_pokok, 'Pemberitahuan'),
      extra: [
        { id: 'perihal_pokok', label: 'Pokok surat (untuk perihal)', ph: 'Permohonan Kunjungan' },
        { id: 'pokok', label: 'Isi pokok yang ingin disampaikan', ph: 'kami bermaksud mengadakan kunjungan ke instansi Bapak/Ibu pada waktu yang disepakati bersama', area: true },
        { id: 'waktu', label: 'Hari / tanggal / tempat (opsional)', ph: 'Senin, 20 Oktober 2026, di Aula Utama' },
      ],
      defaults: { pembuka: 'Dengan hormat,', penutup: 'Hormat kami,' },
      body: (d) => [
        `Sehubungan dengan keperluan kami, melalui surat ini kami sampaikan bahwa ${val(d.x_pokok)}.`,
        d.x_waktu && d.x_waktu.trim() ? `Adapun pelaksanaannya direncanakan pada ${d.x_waktu.trim()}.` : '',
        'Demikian surat ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.',
      ].filter(Boolean).join('\n\n'),
    },
  };

  /* ---------- State ---------- */
  const DRAFT_KEY = 'suratku_draft_v1';
  const OWNER_KEY = 'suratku_owner';
  const state = {
    id: null,         // id surat di server (jika sudah disimpan)
    bodyDirty: false, // true jika pengguna mengedit isi secara manual
    extraStore: {},   // nilai kolom khusus, dipertahankan saat ganti template
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* abaikan */ } },
    del(k) { try { localStorage.removeItem(k); } catch (_) { /* abaikan */ } },
  };

  const owner = (() => {
    let o = store.get(OWNER_KEY);
    if (!o || !/^[a-f0-9]{32}$/.test(o)) {
      const a = new Uint8Array(16);
      crypto.getRandomValues(a);
      o = Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
      store.set(OWNER_KEY, o);
    }
    return o;
  })();

  /* ---------- Form <-> data ---------- */
  const collect = () => {
    const d = {};
    $$('[data-k]').forEach((el) => {
      d[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
    });
    Object.keys(state.extraStore).forEach((k) => { d['x_' + k] = state.extraStore[k]; });
    return d;
  };

  const applyData = (d) => {
    Object.keys(d).forEach((k) => {
      if (k.startsWith('x_')) state.extraStore[k.slice(2)] = d[k];
    });
    if (d.template && TEMPLATES[d.template]) $('#template').value = d.template;
    buildExtras();
    $$('[data-k]').forEach((el) => {
      const v = d[el.dataset.k];
      if (v === undefined) return;
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = v;
    });
    $('#kop-fields').hidden = !$('#kop').checked;
  };

  function buildExtras() {
    const box = $('#extra');
    const t = TEMPLATES[$('#template').value];
    box.textContent = '';
    t.extra.forEach((f) => {
      const label = document.createElement('label');
      label.className = 'field';
      const span = document.createElement('span');
      span.textContent = f.label;
      const input = document.createElement(f.area ? 'textarea' : 'input');
      if (f.area) input.rows = 3; else input.type = f.type || 'text';
      if (f.ph) input.placeholder = f.ph;
      input.value = state.extraStore[f.id] ?? '';
      input.addEventListener('input', () => {
        state.extraStore[f.id] = input.value;
        refresh();
      });
      label.append(span, input);
      box.append(label);
    });
  }

  /* ---------- Preview ---------- */
  const row = (a, b) => `<tr><td>${a}</td><td>:</td><td>${b}</td></tr>`;

  function renderLetter(d) {
    const t = TEMPLATES[d.template] || TEMPLATES.lamaran;
    const ph = (s) => `<span class="ph">${esc(s)}</span>`;
    const or = (v, f) => (v && String(v).trim() ? esc(v.trim()) : ph(f));

    const kop = d.kop
      ? `<div class="l-kop"><strong>${or(d.kop_nama, 'NAMA INSTANSI')}</strong><div>${d.kop_alamat ? nl(d.kop_alamat) : ph('Alamat & kontak instansi')}</div></div>`
      : '';

    const tgl = fmtDate(d.tanggal);
    const right = `<div class="l-right">${or(d.kota, 'Kota')}, ${tgl ? esc(tgl) : ph('tanggal')}</div>`;

    const metaRows = [];
    if (d.nomor && d.nomor.trim()) metaRows.push(row('Nomor', esc(d.nomor.trim())));
    if (d.lampiran && d.lampiran.trim()) metaRows.push(row('Lampiran', esc(d.lampiran.trim())));
    metaRows.push(row('Perihal', `<strong>${esc((d.perihal && d.perihal.trim()) || t.perihal(d))}</strong>`));
    const meta = `<table class="l-meta">${metaRows.join('')}</table>`;

    const to = [
      '<div>Kepada Yth.</div>',
      `<div><strong>${or(d.penerima_jabatan, 'Bapak/Ibu Pimpinan')}</strong></div>`,
      d.penerima_instansi && d.penerima_instansi.trim() ? `<div>${esc(d.penerima_instansi.trim())}</div>` : '',
      d.penerima_alamat && d.penerima_alamat.trim() ? `<div>${nl(d.penerima_alamat.trim())}</div>` : '',
      '<div>di Tempat</div>',
    ].join('');

    const paras = (d.isi || '')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${nl(p)}</p>`)
      .join('');

    const sender = [d.pengirim_alamat, d.pengirim_kontak]
      .filter((x) => x && x.trim())
      .map((x) => nl(x.trim()))
      .join('<br>');

    return `
      ${kop}
      ${right}
      ${meta}
      <div class="l-to">${to}</div>
      <div class="l-open">${esc(d.pembuka || '')}</div>
      <div class="l-body">${paras || `<p>${ph('Isi surat akan tampil di sini.')}</p>`}</div>
      <div class="l-sign">
        <div>${esc(d.penutup || '')}</div>
        <div class="l-space"></div>
        <div class="l-name">${or(d.pengirim_nama, 'Nama Lengkap')}</div>
      </div>
      ${sender ? `<div class="l-sender">${sender}</div>` : ''}
    `;
  }

  const sheet = $('#sheet');
  const scaler = $('#scaler');
  const stage = $('#stage');

  function fit() {
    if (window.matchMedia('print').matches) return;
    const avail = stage.clientWidth - 40;
    const scale = Math.min(1, avail / 794);
    scaler.style.transform = scale < 1 ? `scale(${scale})` : '';
    scaler.style.height = scale < 1 ? `${sheet.offsetHeight * scale}px` : '';
  }

  let draftTimer = null;
  function refresh() {
    const d = collect();
    if (!state.bodyDirty) {
      const t = TEMPLATES[d.template];
      $('#isi').value = t.body(d);
      d.isi = $('#isi').value;
    }
    sheet.innerHTML = renderLetter(d);
    sheet.style.fontFamily = `"${d.font}", "Times New Roman", serif`;
    sheet.style.fontSize = `${d.size}pt`;
    fit();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 400);
  }

  function saveDraft() {
    clearTimeout(draftTimer);
    store.set(DRAFT_KEY, JSON.stringify({ id: state.id, dirty: state.bodyDirty, data: collect() }));
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg, isErr = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (isErr ? ' err' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* ---------- API ---------- */
  async function api(url, opts = {}) {
    let res;
    try {
      res = await fetch(url, {
        ...opts,
        headers: { 'Content-Type': 'application/json', 'X-Owner': owner, ...(opts.headers || {}) },
      });
    } catch (_) {
      throw new Error('Server PHP tidak dapat dihubungi. Jalankan lewat server PHP (lihat README).');
    }
    let json = null;
    try { json = await res.json(); } catch (_) { /* bukan JSON */ }
    if (!res.ok || !json) throw new Error((json && json.error) || `Permintaan gagal (HTTP ${res.status}).`);
    return json;
  }

  const titleOf = (d) => {
    const t = TEMPLATES[d.template];
    const who = d.pengirim_nama && d.pengirim_nama.trim() ? ` — ${d.pengirim_nama.trim()}` : '';
    return `${t ? t.label : 'Surat'}${who}`.slice(0, 120);
  };

  async function save() {
    const d = collect();
    d.isi = $('#isi').value;
    try {
      const r = await api('api/letters.php', {
        method: 'POST',
        body: JSON.stringify({ id: state.id, title: titleOf(d), data: d, dirty: state.bodyDirty }),
      });
      state.id = r.id;
      refresh();
      toast('Surat tersimpan di server.');
    } catch (e) {
      toast(e.message, true);
    }
  }

  async function openList() {
    const dlg = $('#dlg-list');
    const ul = $('#list');
    ul.textContent = '';
    $('#list-empty').hidden = true;
    try {
      const r = await api('api/letters.php');
      if (!r.items.length) $('#list-empty').hidden = false;
      r.items.forEach((it) => {
        const li = document.createElement('li');
        const info = document.createElement('div');
        const t = document.createElement('div');
        t.className = 't';
        t.textContent = it.title;
        const dt = document.createElement('div');
        dt.className = 'd';
        dt.textContent = 'Diubah ' + new Date(it.updated * 1000).toLocaleString('id-ID');
        info.append(t, dt);

        const acts = document.createElement('div');
        acts.className = 'acts';
        const bOpen = document.createElement('button');
        bOpen.className = 'btn small';
        bOpen.type = 'button';
        bOpen.textContent = 'Buka';
        bOpen.addEventListener('click', () => loadLetter(it.id, dlg));
        const bDel = document.createElement('button');
        bDel.className = 'btn small danger';
        bDel.type = 'button';
        bDel.textContent = 'Hapus';
        bDel.addEventListener('click', async () => {
          if (!confirm('Hapus surat ini dari server?')) return;
          try {
            await api('api/letters.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id: it.id }) });
            if (state.id === it.id) state.id = null;
            li.remove();
            if (!ul.children.length) $('#list-empty').hidden = false;
          } catch (e) { toast(e.message, true); }
        });
        acts.append(bOpen, bDel);
        li.append(info, acts);
        ul.append(li);
      });
      dlg.showModal();
    } catch (e) {
      toast(e.message, true);
    }
  }

  async function loadLetter(id, dlg) {
    try {
      const r = await api('api/letters.php?id=' + encodeURIComponent(id));
      state.id = r.id;
      state.extraStore = {};
      state.bodyDirty = !!r.dirty;
      applyData(r.data);
      refresh();
      if (dlg) dlg.close();
      toast('Surat dibuka.');
    } catch (e) {
      toast(e.message, true);
    }
  }

  /* ---------- Unduh Word (diproses PHP) ---------- */
  function downloadWord() {
    const d = collect();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'api/export_doc.php';
    const add = (n, v) => {
      const i = document.createElement('input');
      i.type = 'hidden'; i.name = n; i.value = v;
      form.append(i);
    };
    add('html', sheet.innerHTML);
    add('filename', titleOf(d));
    add('font', d.font);
    add('size', d.size);
    document.body.append(form);
    form.submit();
    form.remove();
  }

  /* ---------- Surat baru ---------- */
  function resetAll() {
    if (!confirm('Mulai surat baru? Isian saat ini akan dikosongkan.')) return;
    state.id = null;
    state.bodyDirty = false;
    state.extraStore = {};
    $$('[data-k]').forEach((el) => {
      if (el.type === 'checkbox') el.checked = false;
      else if (el.tagName === 'SELECT') el.selectedIndex = el.id === 'template' ? 0 : (el.dataset.k === 'size' ? 1 : 0);
      else el.value = '';
    });
    $('[data-k="pembuka"]').value = 'Dengan hormat,';
    $('[data-k="penutup"]').value = 'Hormat saya,';
    $('[data-k="tanggal"]').value = todayISO();
    $('#kop-fields').hidden = true;
    buildExtras();
    refresh();
  }

  /* ---------- Init ---------- */
  function init() {
    const sel = $('#template');
    Object.entries(TEMPLATES).forEach(([k, t]) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = t.label;
      sel.append(o);
    });

    // Pulihkan draf, jika ada.
    let restored = false;
    const raw = store.get(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft && draft.data) {
          state.id = draft.id || null;
          state.bodyDirty = !!draft.dirty;
          applyData(draft.data);
          restored = true;
        }
      } catch (_) { /* draf rusak, abaikan */ }
    }
    if (!restored) {
      $('[data-k="tanggal"]').value = todayISO();
      buildExtras();
    }

    // Event: semua input biasa
    $$('[data-k]').forEach((el) => {
      if (el.id === 'isi') return;
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', refresh);
    });

    sel.addEventListener('change', () => {
      const t = TEMPLATES[sel.value];
      $('[data-k="pembuka"]').value = t.defaults.pembuka;
      $('[data-k="penutup"]').value = t.defaults.penutup;
      buildExtras();
      refresh();
    });

    $('#isi').addEventListener('input', () => { state.bodyDirty = true; refresh(); });
    $('#btn-auto').addEventListener('click', () => { state.bodyDirty = false; refresh(); toast('Isi surat dibuat ulang dari data.'); });
    $('#kop').addEventListener('change', () => { $('#kop-fields').hidden = !$('#kop').checked; });

    $('#btn-save').addEventListener('click', save);
    $('#btn-open').addEventListener('click', openList);
    $('#btn-word').addEventListener('click', downloadWord);
    $('#btn-new').addEventListener('click', resetAll);
    $('#btn-print').addEventListener('click', () => { refresh(); window.print(); });

    // Tab mobile
    $$('.tab').forEach((tab) => tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => t.classList.toggle('is-active', t === tab));
      $('#pane-form').classList.toggle('is-active', tab.dataset.pane === 'form');
      $('#pane-preview').classList.toggle('is-active', tab.dataset.pane === 'preview');
      fit();
    }));

    // Pastikan draf terakhir tersimpan walau halaman ditutup/dimuat ulang cepat.
    window.addEventListener('pagehide', saveDraft);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveDraft(); });

    window.addEventListener('resize', fit);
    window.addEventListener('beforeprint', () => { scaler.style.transform = ''; scaler.style.height = ''; });
    window.addEventListener('afterprint', fit);

    refresh();
  }

  init();
})();
