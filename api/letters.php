<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';

$owner  = require_owner();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ---------- Baca: daftar atau satu surat ----------
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $rec = read_letter(clean_id($_GET['id']), $owner);
        json_out([
            'id'    => $rec['id'],
            'title' => $rec['title'],
            'dirty' => (bool) ($rec['dirty'] ?? false),
            'data'  => $rec['data'],
        ]);
    }
    json_out(['items' => list_letters($owner)]);
}

if ($method !== 'POST') {
    fail('Metode tidak didukung.', 405);
}

require_same_origin();
$in = json_in();

// ---------- Hapus ----------
if (($in['action'] ?? '') === 'delete') {
    $id = clean_id($in['id'] ?? null);
    read_letter($id, $owner); // memastikan kepemilikan
    @unlink(letter_path($id));
    json_out(['ok' => true]);
}

// ---------- Simpan (baru atau perbarui) ----------
$data = $in['data'] ?? null;
if (!is_array($data)) {
    fail('Data surat tidak valid.');
}
if (!in_array($data['template'] ?? '', ALLOWED_TEMPLATES, true)) {
    fail('Jenis surat tidak dikenal.');
}

// Hanya simpan nilai skalar (string/bool); buang struktur bersarang.
$clean = [];
foreach ($data as $k => $v) {
    if (!is_string($k) || !preg_match('/^[a-z_]{1,40}$/', $k)) {
        continue;
    }
    if (is_bool($v)) {
        $clean[$k] = $v;
    } elseif (is_string($v)) {
        $clean[$k] = mb_substr($v, 0, 10_000);
    }
}

$title = trim((string) ($in['title'] ?? 'Surat'));
$title = mb_substr($title !== '' ? $title : 'Surat', 0, 120);

$id = null;
if (!empty($in['id'])) {
    $id  = clean_id($in['id']);
    $old = read_letter($id, $owner); // memastikan kepemilikan
    $createdAt = $old['created'] ?? time();
} else {
    if (count(list_letters($owner)) >= MAX_LETTERS) {
        fail('Batas ' . MAX_LETTERS . ' surat tercapai. Hapus beberapa surat lama.', 409);
    }
    $id = bin2hex(random_bytes(8));
    $createdAt = time();
}

write_letter([
    'id'      => $id,
    'owner'   => $owner,
    'title'   => $title,
    'dirty'   => (bool) ($in['dirty'] ?? false),
    'data'    => $clean,
    'created' => $createdAt,
    'updated' => time(),
]);

json_out(['ok' => true, 'id' => $id]);
