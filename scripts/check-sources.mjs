#!/usr/bin/env node
// Guards the anti-fabrication rule: every guide needs a source manifest.
// Usage: node scripts/check-sources.mjs [--online]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const GUIDE_DIR = 'src/pages/guides';
const SRC_DIR = 'docs/guide-sources';
const online = process.argv.includes('--online');

const slugs = readdirSync(GUIDE_DIR)
  .filter(f => f.endsWith('.astro') && f !== 'index.astro')
  .map(f => f.replace(/\.astro$/, ''))
  .sort();

let fail = 0;
const allUrls = new Set();
for (const slug of slugs) {
  const p = join(SRC_DIR, `${slug}.md`);
  if (!existsSync(p)) { console.log(`MISSING manifest: ${p}`); fail++; continue; }
  const md = readFileSync(p, 'utf8');
  // Only treat URLs as live citations. Lines that explicitly record a dead or
  // rejected candidate are provenance, not citations, so skip them.
  const urls = [];
  for (const line of md.split('\n')) {
    // The mandated format is: - <claim> — <URL> — fetched <date>.
    // Only lines carrying that marker are live citations. Notes and
    // dead-candidate lists are provenance and are not link-checked.
    if (!/\bfetched\b/i.test(line)) continue;
    for (const m of line.matchAll(/https?:\/\/[^\s)>"']+/g)) urls.push(m[0]);
  }
  urls.forEach(u => allUrls.add(u));
  const ok = urls.length >= 5;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FEW '} ${slug.padEnd(30)} ${urls.length} sources`);
}
console.log(`\n${allUrls.size} unique URLs across ${slugs.length} guides`);

if (online) {
  let bad = 0;
  for (const u of [...allUrls].sort()) {
    let s = 'ERR';
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; BumpCompassSourceCheck/1.0)' } });
      s = r.status;
    } catch { s = 'ERR'; }
    if (s !== 200) { bad++; console.log(`  ${s}  ${u}`); }
  }
  console.log(`\n${bad} URLs not returning 200`);
  if (bad) fail++;
}
process.exit(fail ? 1 : 0);
