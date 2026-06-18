import { readFileSync } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import postgres from 'postgres';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Load environment variables from .env.local
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

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

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

const seenSlugs = new Set();
function getUniqueSlug(title) {
  let base = slugify(title);
  let slug = base;
  let counter = 1;
  while (seenSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  seenSlugs.add(slug);
  return slug;
}

function extractImageUrl(url) {
  url = url.trim();
  if (url.includes('_next/image') && url.includes('url=')) {
    try {
      const urlObj = new URL(url);
      const rawUrl = urlObj.searchParams.get('url');
      if (rawUrl) return rawUrl;
    } catch (e) {
      // Fallback if URL parsing fails
    }
  }
  return url;
}

function toDirectDownloadUrl(url) {
  url = url.trim();
  if (url.includes('uc?export=download') || url.includes('uc?id=')) return url;

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&confirm=t&id=${fileMatch[1]}`;

  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=download&confirm=t&id=${openMatch[1]}`;

  return url;
}

async function downloadImage(url) {
  const rawUrl = extractImageUrl(url);
  const directUrl = toDirectDownloadUrl(rawUrl);

  if (directUrl.includes('drive.google.com')) {
    const idMatch = directUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      const usercontent = `https://drive.usercontent.google.com/download?id=${idMatch[1]}&export=download&confirm=t`;
      const r1 = await fetch(usercontent, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
      if (r1.ok) {
        const ct = r1.headers.get('content-type') || '';
        if (!ct.includes('text/html')) return Buffer.from(await r1.arrayBuffer());
      }
    }
  }

  const res = await fetch(directUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${directUrl}`);

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const html = await res.text();
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

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  let cleanStr = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
  
  const yearMatch = cleanStr.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  let monthIdx = -1;
  const lowerStr = cleanStr.toLowerCase();
  for (let i = 0; i < 12; i++) {
    if (lowerStr.includes(months[i]) || lowerStr.includes(monthsShort[i])) {
      monthIdx = i;
      break;
    }
  }
  if (monthIdx === -1) monthIdx = 0;
  
  const dayMatch = cleanStr.match(/\b(\d{1,2})\b/);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
  
  let hours = 0;
  let minutes = 0;
  
  const timeMatch = cleanStr.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  } else {
    const hrsMatch = cleanStr.match(/\b(\d{2})(\d{2})\s*Hrs\b/i);
    if (hrsMatch) {
      hours = parseInt(hrsMatch[1], 10);
      minutes = parseInt(hrsMatch[2], 10);
    }
  }
  
  const dateObj = new Date(year, monthIdx, day, hours, minutes);
  return isNaN(dateObj.getTime()) ? new Date() : dateObj;
}

function mapTag(title, description) {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('datathon')) return 'Datathon';
  if (combined.includes('hackathon')) return 'Hackathon';
  if (combined.includes('designathon')) return 'Designathon';
  if (combined.includes('ideathon')) return 'Ideathon';
  if (combined.includes('workshop')) return 'Workshop';
  if (combined.includes('seminar') || combined.includes('talk') || combined.includes('guest lecture')) return 'Seminar';
  if (combined.includes('quiz')) return 'Quiz';
  if (combined.includes('coding') || combined.includes('programming') || combined.includes('ctf')) return 'Coding';
  if (combined.includes('competition') || combined.includes('contest')) return 'Competition';
  return 'Workshop';
}

const EXCEL_FILE = 'C:\\Users\\tanma\\OneDrive\\Desktop\\IEEE CS EVENTS LIST.xlsx';

async function main() {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const entries = rows.slice(1)
      .filter(r => r[0] && r[3])
      .map((r, i) => ({
        title: String(r[0]).trim(),
        description: String(r[1] || '').trim(),
        dateStr: String(r[2] || '').trim(),
        imageUrl: String(r[3]).trim(),
        displayOrder: i
      }));

    console.log(`Found ${entries.length} events in Excel. Starting import...`);

    let ok = 0;
    let fail = 0;

    for (const e of entries) {
      const slug = getUniqueSlug(e.title);
      const key = `events/${slug}.avif`;
      const tag = mapTag(e.title, e.description);
      const parsedDate = parseDate(e.dateStr);

      process.stdout.write(`Importing "${e.title}" ... `);

      try {
        const rawBuffer = await downloadImage(e.imageUrl);
        const avifBuffer = await toAvif(rawBuffer);
        const publicUrl = await uploadToR2(key, avifBuffer);

        await sql`
          INSERT INTO events (title, slug, description, cover_image, event_date, display_order, featured, status, tag)
          VALUES (
            ${e.title}, ${slug}, ${e.description}, ${publicUrl},
            ${parsedDate}, ${e.displayOrder},
            false, 'published', ${tag}
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            cover_image = EXCLUDED.cover_image,
            event_date = EXCLUDED.event_date,
            display_order = EXCLUDED.display_order,
            tag = EXCLUDED.tag,
            updated_at = NOW()
        `;

        console.log(`✓ (R2: ${publicUrl}, Tag: ${tag})`);
        ok++;
      } catch (err) {
        console.log(`✗ Fail: ${err.message}`);
        fail++;
      }
    }

    console.log(`\nImport complete: ${ok} succeeded, ${fail} failed.`);
  } catch (err) {
    console.error('Fatal error during import:', err);
  } finally {
    await sql.end();
  }
}

main();
