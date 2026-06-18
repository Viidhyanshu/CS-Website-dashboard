
import { readFileSync, writeFileSync } from 'fs';

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
const { default: postgres } = await import('postgres');
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const members = await sql`
  SELECT name, role, image_url, "group", linkedin_url, github_url, instagram_url
  FROM team_members
  WHERE is_active = true
  ORDER BY display_order ASC, name ASC
`;

await sql.end();

console.log(`Fetched ${members.length} members from DB`);

const EC    = members.filter(m => m.group === 'ec');
const WEB   = members.filter(m => m.group === 'web');
const CORE  = members.filter(m => m.group === 'core');

console.log(`  ec=${EC.length}  web=${WEB.length}  core=${CORE.length}`);

function esc(str) {
  return (str ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function renderMember(m) {
  const lines = [
    `  {`,
    `    name: "${esc(m.name)}",`,
    `    role: "${esc(m.role)}",`,
    `    image: "${esc(m.image_url)}",`,
  ];
  if (m.linkedin_url) lines.push(`    linkedin: "${esc(m.linkedin_url)}",`);
  if (m.github_url)   lines.push(`    github: "${esc(m.github_url)}",`);
  if (m.instagram_url) lines.push(`    instagram: "${esc(m.instagram_url)}",`);
  lines.push(`  }`);
  return lines.join('\n');
}

function renderArray(name, members) {
  if (members.length === 0) {
    return `export const ${name}: TeamMember[] = [];\n`;
  }
  return `export const ${name}: TeamMember[] = [\n${members.map(renderMember).join(',\n')},\n];\n`;
}

const output = `export interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
}

${renderArray('EC_MEMBERS', EC)}
${renderArray('WEB_MEMBERS', WEB)}
${renderArray('CORE_MEMBERS', CORE)}`;

const outPath = '../CS-Website/src/data/teamData.ts';
writeFileSync(outPath, output, 'utf-8');
console.log(`\nWrote ${outPath}`);
console.log(`Total members written: ${members.length}`);
