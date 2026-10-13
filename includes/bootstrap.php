<?php
declare(strict_types=1);

/**
 * Fungsi bersama untuk endpoint API SuratKu.
 *
 * Catatan keamanan: "owner" adalah token acak per-browser, BUKAN sistem login.
 * Cukup untuk memisahkan surat antar pengunjung, tetapi jika situs ini dipakai
 * publik sebaiknya tambahkan autentikasi sungguhan.
 */

const MAX_BODY_BYTES = 200_000;   // batas ukuran request
const MAX_LETTERS    = 100;       // batas surat per pemilik
const ALLOWED_TEMPLATES = ['lamaran', 'izin', 'resign', 'resmi'];

function json_out(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): never
{
    json_out(['error' => $message], $status);
}

/** Tolak POST lintas-origin (perlindungan CSRF dasar). */
function require_same_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }
    $host = parse_url($origin, PHP_URL_HOST) ?: '';
    $port = parse_url($origin, PHP_URL_PORT);
    $originHost = $port ? "$host:$port" : $host;
    if (!hash_equals(strtolower((string) ($_SERVER['HTTP_HOST'] ?? '')), strtolower($originHost))) {
        fail('Origin tidak diizinkan.', 403);
    }
}

function require_owner(): string
{
    $owner = $_SERVER['HTTP_X_OWNER'] ?? '';
    if (!preg_match('/^[a-f0-9]{32}$/', $owner)) {
        fail('Identitas browser tidak valid.', 401);
    }
    return $owner;
}

function json_in(): array
{
    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    if ($raw === false || $raw === '') {
        fail('Permintaan kosong.');
    }
    if (strlen($raw) > MAX_BODY_BYTES) {
        fail('Data terlalu besar.', 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('Format JSON tidak valid.');
    }
    return $data;
}

function storage_dir(): string
{
    // Disarankan: atur SURATKU_DATA ke folder DI LUAR web root.
    $dir = getenv('SURATKU_DATA') ?: dirname(__DIR__) . '/data/letters';
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Folder penyimpanan tidak dapat dibuat.', 500);
    }
    // Lapisan pengaman jika folder berada di dalam web root.
    $ht = $dir . '/.htaccess';
    if (!is_file($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    $idx = $dir . '/index.html';
    if (!is_file($idx)) {
        @file_put_contents($idx, '');
    }
    return $dir;
}

function clean_id(mixed $id): string
{
    $id = is_string($id) ? $id : '';
    if (!preg_match('/^[a-f0-9]{16}$/', $id)) {
        fail('ID surat tidak valid.');
    }
    return $id;
}

function letter_path(string $id): string
{
    return storage_dir() . '/' . $id . '.json';
}

function read_letter(string $id, string $owner): array
{
    $path = letter_path($id);
    if (!is_file($path)) {
        fail('Surat tidak ditemukan.', 404);
    }
    $rec = json_decode((string) file_get_contents($path), true);
    if (!is_array($rec) || !hash_equals((string) ($rec['owner'] ?? ''), $owner)) {
        // Pesan sama dengan "tidak ditemukan" agar ID tidak bisa ditebak.
        fail('Surat tidak ditemukan.', 404);
    }
    return $rec;
}

function write_letter(array $rec): void
{
    $path = letter_path($rec['id']);
    $tmp  = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $path)) {
        @unlink($tmp);
        fail('Gagal menyimpan surat.', 500);
    }
}

function list_letters(string $owner): array
{
    $items = [];
    foreach (glob(storage_dir() . '/*.json') ?: [] as $file) {
        $rec = json_decode((string) file_get_contents($file), true);
        if (is_array($rec) && hash_equals((string) ($rec['owner'] ?? ''), $owner)) {
            $items[] = [
                'id'      => $rec['id'],
                'title'   => $rec['title'] ?? 'Surat',
                'updated' => $rec['updated'] ?? 0,
            ];
        }
    }
    usort($items, fn ($a, $b) => $b['updated'] <=> $a['updated']);
    return $items;
}
