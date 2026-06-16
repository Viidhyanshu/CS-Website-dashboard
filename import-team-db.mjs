import { readFileSync } from 'fs';
import { createRequire } from 'module';
import postgres from 'postgres';
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

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, '');

function slugify(name) {
  return name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapGroup(team) {
  if (!team) return 'core';
  const t = team.toLowerCase();
  if (t.includes('executive') || t === 'ec') return 'ec';
  if (t.includes('web') || t.includes('tech')) return 'web';
  return 'core';
}

// Columns: 0=Col1, 1=Name, 2=Primary Team, 3=Position, 4=LinkedIn, 5=GitHub, 6=Instagram, 7=Photo
const EXCEL_FILE = 'C:\\Users\\tanma\\OneDrive\\Desktop\\IEEE CS CC photos.xlsx';
const workbook = XLSX.readFile(EXCEL_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const entries = rows.slice(1).filter(r => r[1]).map((r, i) => ({
  name:         String(r[1] || '').trim(),
  team:         String(r[2] || '').trim(),
  position:     String(r[3] || '').trim(),
  linkedin:     String(r[4] || '').trim() || null,
  github:       String(r[5] || '').trim() || null,
  instagram:    r[6] ? `https://instagram.com/${String(r[6]).replace('@','').trim()}` : null,
  displayOrder: i,
}));

console.log(`\nInserting ${entries.length} team members...\n`);

let ok = 0, fail = 0;

for (const e of entries) {
  const slug = slugify(e.name);
  const imageUrl = `${PUBLIC_DOMAIN}/team-photos/${slug}.avif`;
  const role = e.position && e.team
    ? `${e.position} of ${e.team}`
    : (e.position || e.team || 'Member');
  const group = mapGroup(e.team);

  try {
    await sql`
      INSERT INTO team_members
        (name, role, image_url, "group", linkedin_url, instagram_url, github_url, display_order, is_active)
      VALUES (
        ${e.name}, ${role}, ${imageUrl}, ${group},
        ${e.linkedin}, ${e.instagram}, ${e.github},
        ${e.displayOrder}, true
      )
      ON CONFLICT DO NOTHING
    `;
    console.log(`  ✓ ${e.name} (${group}) — ${role}`);
    ok++;
  } catch (err) {
    console.log(`  ✗ ${e.name} — ${err.message}`);
    fail++;
  }
}

await sql.end();
console.log(`\nDone: ${ok} inserted, ${fail} failed`);
