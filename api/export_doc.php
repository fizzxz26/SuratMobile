<?php
declare(strict_types=1);

/**
 * Mengubah HTML pratinjau surat menjadi berkas .doc yang dapat dibuka di
 * Microsoft Word / LibreOffice / Google Docs. HTML disaring dengan daftar
 * tag dan atribut yang diizinkan sebelum dibungkus.
 */

require __DIR__ . '/../includes/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Gunakan metode POST.', 405);
}
require_same_origin();

$html = (string) ($_POST['html'] ?? '');
if ($html === '' || strlen($html) > MAX_BODY_BYTES) {
    fail('Isi surat kosong atau terlalu besar.', 413);
}

$fonts = ['Times New Roman', 'Arial', 'Calibri', 'Georgia'];
$font  = in_array($_POST['font'] ?? '', $fonts, true) ? $_POST['font'] : 'Times New Roman';
$size  = in_array((string) ($_POST['size'] ?? ''), ['11', '12', '13'], true) ? $_POST['size'] : '12';

$allowedTags = ['div', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'table', 'tbody', 'tr', 'td'];
$allowedAttrs = ['class'];

function sanitize_node(DOMNode $node, array $tags, array $attrs): void
{
    for ($i = $node->childNodes->length - 1; $i >= 0; $i--) {
        $child = $node->childNodes->item($i);
        if (!$child instanceof DOMElement) {
            continue;
        }
        $name = strtolower($child->tagName);
        if (!in_array($name, $tags, true)) {
            // Tag tidak diizinkan: buang seluruhnya (termasuk script/style).
            $node->removeChild($child);
            continue;
        }
        foreach (iterator_to_array($child->attributes) as $attr) {
            $keep = in_array($attr->name, $attrs, true)
                && preg_match('/^[\w\- ]{0,80}$/', $attr->value);
            if (!$keep) {
                $child->removeAttribute($attr->name);
            }
        }
        sanitize_node($child, $tags, $attrs);
    }
}

$dom = new DOMDocument('1.0', 'UTF-8');
libxml_use_internal_errors(true);
$dom->loadHTML(
    '<?xml encoding="UTF-8"><body>' . $html . '</body>',
    LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
);
libxml_clear_errors();

$body = $dom->getElementsByTagName('body')->item(0);
if (!$body) {
    fail('HTML tidak dapat diproses.');
}
sanitize_node($body, $allowedTags, $allowedAttrs);

$inner = '';
foreach ($body->childNodes as $child) {
    $inner .= $dom->saveHTML($child);
}

$css = <<<CSS
@page { size: 21cm 29.7cm; margin: 2.5cm 2.5cm 2.2cm 2.5cm; }
body { font-family: "{$font}", serif; font-size: {$size}pt; line-height: 150%; }
.l-kop { text-align: center; border-bottom: 3px double #000000; padding-bottom: 6pt; margin-bottom: 14pt; }
.l-kop strong { font-size: 14pt; }
.l-right { text-align: right; margin-bottom: 10pt; }
.l-meta td { padding-right: 6pt; vertical-align: top; }
.l-to { margin-bottom: 10pt; }
.l-open { margin-bottom: 6pt; }
.l-body p { margin: 0 0 8pt 0; text-align: justify; }
.l-sign { margin-left: 50%; margin-top: 18pt; }
.l-space { height: 56pt; }
.l-name { font-weight: bold; text-decoration: underline; }
.l-sender { margin-top: 14pt; font-size: 10pt; }
.ph { color: #000000; }
CSS;

$doc = "<!DOCTYPE html>\n"
    . '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
    . 'xmlns:w="urn:schemas-microsoft-com:office:word" '
    . 'xmlns="http://www.w3.org/TR/REC-html40">'
    . '<head><meta charset="utf-8"><title>Surat</title>'
    . '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->'
    . "<style>{$css}</style></head><body>{$inner}</body></html>";

// Nama berkas aman: huruf, angka, spasi, strip.
$name = (string) ($_POST['filename'] ?? 'Surat');
$name = preg_replace('/[^\p{L}\p{N} \-_]+/u', '', $name) ?? 'Surat';
$name = trim(mb_substr($name, 0, 80)) ?: 'Surat';
$ascii = preg_replace('/[^A-Za-z0-9_\-]+/', '_', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name) ?: 'Surat');
$ascii = trim((string) $ascii, '_') ?: 'Surat';

header('Content-Type: application/msword; charset=utf-8');
header("Content-Disposition: attachment; filename=\"{$ascii}.doc\"; filename*=UTF-8''" . rawurlencode($name) . '.doc');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
echo "\xEF\xBB\xBF" . $doc;
