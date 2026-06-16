

import { readFileSync } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const envFile = readFileSync('.env.local', 'utf-8');
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const raw = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = raw.replace(/^"(.*)"$/, '$1');
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, '');

function slugify(name) {
  return name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function toDirectDownloadUrl(url) {
  url = url.trim();
  if (url.includes('uc?export=download') || url.includes('uc?id=')) return url;

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&confirm=t&id=${fileMatch[1]}`;

  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=download&confirm=t&id=${openMatch[1]}`;

  throw new Error(`Cannot parse Google Drive URL: ${url}`);
}

async function downloadImage(url) {
  const directUrl = toDirectDownloadUrl(url);
  const idMatch = directUrl.match(/id=([a-zA-Z0-9_-]+)/);

  // Try usercontent domain first — works better for Drive files
  if (idMatch) {
    const usercontent = `https://drive.usercontent.google.com/download?id=${idMatch[1]}&export=download&confirm=t`;
    const r1 = await fetch(usercontent, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (r1.ok) {
      const ct = r1.headers.get('content-type') || '';
      if (!ct.includes('text/html')) return Buffer.from(await r1.arrayBuffer());
    }
  }

  // Fallback: standard download URL
  const res = await fetch(directUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${directUrl}`);

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const html = await res.text();
    // Extract confirm form URL
    const formMatch = html.match(/action="(https:\/\/drive\.usercontent\.google\.com\/download[^"]+)"/);
    if (formMatch) {
      const params = new URLSearchParams();
      for (const m of html.matchAll(/<input[^>]+name="([^"]+)"[^>]+value="([^"]*)"[^>]*>/g)) {
        params.set(m[1], m[2]);
      }
      const confirmUrl = `${formMatch[1]}?${params.toString()}`;
      const r2res = await fetch(confirmUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
      if (!r2res.ok) throw new Error(`Confirm download failed (${r2res.status})`);
      return Buffer.from(await r2res.arrayBuffer());
    }
    throw new Error('Google Drive returned HTML — make sure the file is shared as "Anyone with the link"');
  }

  return Buffer.from(await res.arrayBuffer());
}

async function toAvif(buffer) {
  return sharp(buffer).avif({ quality: 72 }).toBuffer();
}

async function uploadToR2(key, buffer) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/avif',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${PUBLIC_DOMAIN}/${key}`;
}

const EXCEL_FILE = 'C:\\Users\\tanma\\OneDrive\\Desktop\\IEEE CS CC photos.xlsx';
const workbook = XLSX.readFile(EXCEL_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Col 1 = Name, Col 7 = Portrait photo URL
const entries = rows
  .slice(1)
  .filter(row => row[1] && row[7])
  .map(row => ({
    name: String(row[1]).trim(),
    url: String(row[7]).trim(),
  }));

if (entries.length === 0) {
  console.log('No data rows found in the Excel file.');
  process.exit(0);
}

console.log(`\nFound ${entries.length} entries in ${EXCEL_FILE}\n`);

const results = [];

for (const { name, url } of entries) {
  const slug = slugify(name);
  const key = `team-photos/${slug}.avif`;
  process.stdout.write(`  ${name} ? ${key} ... `);
  try {
    const rawBuffer = await downloadImage(url);
    const avifBuffer = await toAvif(rawBuffer);
    const publicUrl = await uploadToR2(key, avifBuffer);
    results.push({ name, url: publicUrl, status: 'ok' });
    console.log(`?`);
  } catch (e) {
    results.push({ name, url: null, status: 'error', error: e.message });
    console.log(`? ${e.message}`);
  }
}

console.log('\n----------------------------------------------------');
const ok = results.filter(r => r.status === 'ok');
const fail = results.filter(r => r.status === 'error');
console.log(`Done: ${ok.length} uploaded, ${fail.length} failed\n`);

if (ok.length > 0) {
  console.log('R2 URLs:');
  ok.forEach(r => console.log(`  ${r.name}: ${r.url}`));
}

if (fail.length > 0) {
  console.log('\nFailed:');
  fail.forEach(r => console.log(`  ${r.name}: ${r.error}`));
}
