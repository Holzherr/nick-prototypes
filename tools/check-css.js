#!/usr/bin/env node
/*
 * check-css.js — guard against the "markup shipped without its CSS" bug.
 *
 * For each self-contained HTML prototype, collect every class that the markup
 * USES (in static class="..." attributes, inside JS template literals, and via
 * classList.add/toggle/remove/replace) and every class the <style> block
 * DEFINES, then report any used-but-undefined class.
 *
 * Static-analysis limits (by design — false negatives, never false positives):
 *  - Fully dynamic tokens like `s-${t.state}` are skipped (can't be resolved).
 *  - Classes added via computed strings (not literals) aren't seen.
 *  - External stylesheets are ignored; this only checks inline <style>.
 *
 * Usage:  node tools/check-css.js [file-or-glob ...]
 *         (defaults to echo/*.html)
 * Exit 1 if any used-but-undefined class is found.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const repoRoot = path.resolve(__dirname, '..');

function expand(patterns) {
  const out = [];
  for (const p of patterns) {
    if (p.includes('*')) {
      const dir = path.dirname(p);
      const re = new RegExp('^' + path.basename(p).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      const base = path.resolve(repoRoot, dir);
      if (fs.existsSync(base)) for (const f of fs.readdirSync(base)) if (re.test(f)) out.push(path.join(base, f));
    } else {
      out.push(path.resolve(repoRoot, p));
    }
  }
  return out;
}

const files = expand(args.length ? args : ['echo/*.html']).filter(f => f.endsWith('.html'));

// classes defined in <style> blocks: `.name` where name starts with a letter/_/-letter
function definedClasses(html) {
  const set = new Set();
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRe.exec(html))) {
    const css = m[1];
    let c;
    const clsRe = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g;
    while ((c = clsRe.exec(css))) set.add(c[1]);
  }
  return set;
}

// Replace `${...}` template interpolations with a NUL sentinel (preserving
// length + newlines). NUL keeps line numbers accurate, neutralises inner quotes
// that would corrupt attribute matching, and — crucially — poisons any token
// glued to an interpolation (e.g. the `s-` in `s-${t.state}`) so dynamic class
// names are skipped rather than flagged as their static prefix.
function stripInterp(s) {
  let prev;
  do {
    prev = s;
    s = s.replace(/\$\{[^{}]*\}/g, m => m.replace(/[^\n]/g, '\0'));
  } while (s !== prev);
  return s;
}

// a legal CSS class name — anything else is a parse artifact and is ignored
const VALID = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/;

// classes used: class="..."/'...' (incl. inside template literals) + classList calls
function usedClasses(html) {
  const scan = stripInterp(html); // same length as html → lineAt stays correct
  const uses = new Map(); // class -> first sample line (1-based)
  const lineAt = i => scan.slice(0, i).split('\n').length;
  const add = (tok, idx) => {
    tok = tok.trim();
    if (!VALID.test(tok)) return; // empty, dynamic remnant, or non-class garbage
    if (!uses.has(tok)) uses.set(tok, lineAt(idx));
  };
  let m;
  const attrRe = /class\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  while ((m = attrRe.exec(scan))) {
    const val = m[1] !== undefined ? m[1] : m[2];
    for (const t of val.split(/\s+/)) add(t, m.index);
  }
  // classList.add('a','b') / toggle / remove / replace, and className = "a b"
  const listRe = /classList\.(?:add|toggle|remove|replace)\(([^)]*)\)/g;
  while ((m = listRe.exec(scan))) {
    const strRe = /(?:"([^"]*)"|'([^']*)')/g;
    let s;
    while ((s = strRe.exec(m[1]))) for (const t of (s[1] ?? s[2]).split(/\s+/)) add(t, m.index);
  }
  const cnRe = /\.className\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  while ((m = cnRe.exec(scan))) for (const t of (m[1] ?? m[2]).split(/\s+/)) add(t, m.index);
  return uses;
}

let totalMissing = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<style[^>]*>/i.test(html)) continue; // no inline CSS — not our concern
  const defined = definedClasses(html);
  const used = usedClasses(html);
  const missing = [...used.entries()].filter(([c]) => !defined.has(c)).sort((a, b) => a[1] - b[1]);
  const rel = path.relative(repoRoot, file);
  if (missing.length) {
    totalMissing += missing.length;
    console.error(`\n✗ ${rel} — ${missing.length} class(es) used but not defined in <style>:`);
    for (const [c, ln] of missing) console.error(`    .${c}  (first used ~line ${ln})`);
  } else {
    console.log(`✓ ${rel}`);
  }
}

if (totalMissing) {
  console.error(`\n${totalMissing} undefined class(es) found. Add the CSS or fix the markup.`);
  process.exit(1);
}
console.log(`\nAll ${files.length} file(s) clean.`);
