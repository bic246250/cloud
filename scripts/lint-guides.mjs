#!/usr/bin/env node
// AI-ism + safety-claim linter for guide prose.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/pages/guides';
const RULES = [
  // --- AI tells (humanizer patterns) ---
  [/\bdelve/i, 'delve'],
  [/\bcrucial\b/i, 'crucial'],
  [/\bpivotal\b/i, 'pivotal'],
  [/\btestament\b/i, 'testament'],
  [/\btapestry\b/i, 'tapestry'],
  [/\bunderscor(e|es|ing)\b/i, 'underscore'],
  [/\bshowcas(e|es|ing)\b/i, 'showcase'],
  [/\bvibrant\b/i, 'vibrant'],
  [/\brobust\b/i, 'robust'],
  [/—/, 'em dash (use comma / period / parentheses)'],
  [/[“”‘’]/, 'curly quote'],
  [/[\u{1F300}-\u{1FAFF}]/u, 'emoji'],
  [/\bnot only\b[^.]{0,80}\bbut\b/i, 'not only...but'],
  [/\bin conclusion\b/i, 'in conclusion'],
  [/\bit(?:'| i)s important to note\b/i, 'important to note'],
  [/\bgame[- ]changer\b/i, 'game-changer'],
  [/\bleverag(e|es|ing)\b/i, 'leverage'],
  [/\bnavigat(e|ing)\s+(the|challenges)\b/i, 'navigate challenges'],
  [/\bwhen it comes to\b/i, 'when it comes to'],
  [/\bat the end of the day\b/i, 'at the end of the day'],
  [/\b(boasts|nestled|renowned|breathtaking)\b/i, 'promotional filler'],
  // --- safety / claim language ---
  [/\bcures?\b/i, 'cure claim'],
  [/\bheals?\b/i, 'heal claim'],
  [/\bguarantee(d|s)?\b/i, 'guarantee'],
  [/\bwill (prevent|diagnose)\b/i, 'prevent/diagnose claim'],
  [/\bControl System\b/, 'flagged product name (see compliance brief §4)'],
];

const files = readdirSync(DIR).filter(f => f.endsWith('.astro') && f !== 'index.astro').sort();
let hits = 0;
for (const f of files) {
  const src = readFileSync(join(DIR, f), 'utf8');
  const body = src.replace(/^---[\s\S]*?---/, '');
  for (const [re, label] of RULES) {
    const m = body.match(re);
    if (m) {
      const at = body.indexOf(m[0]);
      console.log(`${f}: ${label} -> ${JSON.stringify(m[0])} ...${body.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, ' ')}...`);
      hits++;
    }
  }
}
console.log(`\n${hits} lint hits across ${files.length} guides`);
process.exit(hits ? 1 : 0);
