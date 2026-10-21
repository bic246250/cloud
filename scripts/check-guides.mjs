#!/usr/bin/env node
// Structural + length checker for guide pages. Exits non-zero on any failure.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/pages/guides';
const MIN = 1000, MAX = 1400;
const SLOT_FIRST = '925728676', SLOT_SECOND = '2263226824';

export function visibleText(src) {
  let t = src;
  t = t.replace(/^---[\s\S]*?---/, '');                 // frontmatter
  t = t.replace(/<script[\s\S]*?<\/script>/gi, '');
  t = t.replace(/<style[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<!--[\s\S]*?-->/g, '');
  t = t.replace(/<[^>]*\/>/g, ' ');                     // self-closing (AdUnit)
  t = t.replace(/<[^>]+>/g, ' ');                       // remaining tags
  t = t.replace(/\{[^{}]*\}/g, ' ');                    // astro expressions
  t = t.replace(/&(amp|lt|gt|quot|#39|nbsp);/gi, ' ');
  return t.replace(/\s+/g, ' ').trim();
}
const words = (s) => (s ? s.split(' ').filter(Boolean).length : 0);

// Approximate fraction through the prose at which an ad sits.
function adPositions(src) {
  const total = words(visibleText(src));
  const out = [];
  const re = /<AdUnit\s+slot="(\d+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({ slot: m[1], frac: words(visibleText(src.slice(0, m.index))) / (total || 1) });
  }
  return out;
}

const files = readdirSync(DIR).filter(f => f.endsWith('.astro') && f !== 'index.astro').sort();
let fail = 0;
const rows = [];
for (const f of files) {
  const src = readFileSync(join(DIR, f), 'utf8');
  const wc = words(visibleText(src));
  const ads = adPositions(src);
  const desc = (src.match(/const description = '([^']*)'/) || [])[1] || '';
  const p = [];
  if (wc < MIN || wc > MAX) p.push(`words ${wc} (need ${MIN}-${MAX})`);
  if (ads.length !== 2) p.push(`AdUnit count ${ads.length} (need 2)`);
  if (ads[0] && ads[0].slot !== SLOT_FIRST) p.push(`first slot ${ads[0].slot} != ${SLOT_FIRST}`);
  if (ads[1] && ads[1].slot !== SLOT_SECOND) p.push(`second slot ${ads[1].slot} != ${SLOT_SECOND}`);
  if (ads[0] && (ads[0].frac < 0.15 || ads[0].frac > 0.45)) p.push(`ad1 at ${(ads[0].frac * 100).toFixed(0)}% (need 15-45%)`);
  if (ads[1] && (ads[1].frac < 0.60 || ads[1].frac > 0.80)) p.push(`ad2 at ${(ads[1].frac * 100).toFixed(0)}% (need 60-80%)`);
  if (!/class="disclosure-box"/.test(src)) p.push('missing disclosure-box');
  if (!/<h1>/.test(src)) p.push('missing <h1>');
  if (!desc) p.push('missing description');
  if (desc.length > 160) p.push(`description ${desc.length} chars (>160)`);
  if (p.length) fail++;
  rows.push([f, wc, ads.length, p.length ? p.join('; ') : 'OK']);
}
for (const r of rows) {
  console.log(`${String(r[1]).padStart(5)}w  ads:${r[2]}  ${r[0].padEnd(34)} ${r[3]}`);
}
console.log(`\n${files.length} guides checked, ${fail} failing`);
process.exit(fail ? 1 : 0);
