import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const ok = (msg) => console.log('OK  ', msg);
const fail = (msg) => { console.error('FAIL', msg); process.exitCode = 1; };

const requiredFields = ['url', 'sourceClass', 'topic', 'status', 'parses', 'last_post', 'freq_per_day'];
const validClasses = new Set(['preprint', 'community', 'blog', 'press', 'mainstream']);
const classes = ['preprint', 'community', 'blog', 'press', 'mainstream'];
const sources = ['arXiv', 'bioRxiv', 'Hacker News', 'Reddit', 'OpenAlex', 'EurekAlert'];

// 1. sources-core.md covers all six sources
const corePath = path.join(ROOT, 'sources-core.md');
if (!fs.existsSync(corePath)) { fail('sources-core.md missing'); }
else {
  const txt = fs.readFileSync(corePath, 'utf8');
  const missing = sources.filter(s => !txt.includes(s));
  if (missing.length) fail('sources-core.md missing sources: ' + missing.join(', '));
  else ok('sources-core.md covers all 6 sources');
}

// 2. sources.json
const sourcesPath = path.join(ROOT, 'sources.json');
if (!fs.existsSync(sourcesPath)) { fail('sources.json missing'); }
else {
  let data;
  try { data = JSON.parse(fs.readFileSync(sourcesPath, 'utf8')); }
  catch (e) { fail('sources.json invalid JSON: ' + e.message); data = null; }
  if (data) {
    if (!Array.isArray(data)) { fail('sources.json not an array'); }
    else {
      let bad = 0;
      const now = new Date('2026-11-27T00:00:00Z');
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      for (const e of data) {
        for (const f of requiredFields) {
          if (e[f] === undefined || e[f] === null || e[f] === '') { bad++; console.error('  missing field', f, 'in', e.url); break; }
        }
        if (!validClasses.has(e.sourceClass)) { bad++; console.error('  bad sourceClass', e.sourceClass, e.url); }
        if (e.status !== 200) { bad++; console.error('  bad status', e.status, e.url); }
        if (e.parses !== true) { bad++; console.error('  parses not true', e.url); }
        const lp = new Date(e.last_post + 'T00:00:00Z');
        if (isNaN(lp.getTime()) || (now - lp) > ninetyDays) { bad++; console.error('  last_post not within 90 days', e.last_post, e.url); }
      }
      if (bad === 0) ok(`sources.json: ${data.length} entries, all valid`);
      else fail(`sources.json: ${bad} invalid entries`);
      const niche = data.filter(e => e.layer === 'niche').length;
      if (niche >= 30) ok(`niche feeds: ${niche} (>=30)`);
      else fail(`niche feeds: ${niche} (<30)`);
      const mainstream = data.filter(e => e.layer === 'mainstream').length;
      if (mainstream >= 10) ok(`mainstream feeds: ${mainstream} (>=10)`);
      else fail(`mainstream feeds: ${mainstream} (<10)`);
      const isLarge = (e) => e.large_outlet === true || (e.url || '').includes('arxiv.org') || (e.url || '').includes('ycombinator.com') || (e.url || '').includes('hnrss.org');
      const strangeSmall = data.filter(e => e.strange === true && !isLarge(e)).length;
      if (strangeSmall >= 25) ok(`strange feeds (non-large, non-arxiv, non-HN): ${strangeSmall} (>=25)`);
      else fail(`strange feeds (non-large, non-arxiv, non-HN): ${strangeSmall} (<25)`);

      const targetTopics = new Set(['materials','chemistry','geology','zoology','engineering','history']);
      const strangeTarget = data.filter(e => e.strange === true && !isLarge(e) && targetTopics.has(e.topic)).length;
      if (strangeTarget >= 15) ok(`strange feeds in target topics (materials/chemistry/geology/zoology/engineering/history, no math): ${strangeTarget} (>=15)`);
      else fail(`strange feeds in target topics (materials/chemistry/geology/zoology/engineering/history, no math): ${strangeTarget} (<15)`);
    }
  }
}

// 3. baselines.json
const baselinesPath = path.join(ROOT, 'baselines.json');
if (!fs.existsSync(baselinesPath)) { fail('baselines.json missing'); }
else {
  let b;
  try { b = JSON.parse(fs.readFileSync(baselinesPath, 'utf8')); }
  catch (e) { fail('baselines.json invalid JSON: ' + e.message); b = null; }
  if (b) {
    const missingClasses = classes.filter(c => !b[c]);
    if (missingClasses.length) fail('baselines missing classes: ' + missingClasses.join(', '));
    else {
      let bad = 0;
      for (const c of classes) {
        const am = b[c].attention_metric;
        const p = b[c].percentiles;
        const isUnavailable = (am === 'unavailable');
        if (isUnavailable) {
          if (p !== null) { bad++; console.error('  null-attention class carries percentiles:', c); }
        } else {
          const pp = p || {};
          for (const k of ['p10','p50','p90','p99']) {
            if (typeof pp[k] !== 'number') { bad++; console.error('  missing', k, 'in', c); }
          }
        }
        if (typeof b[c].sample_count !== 'number' || b[c].sample_count < 1) { bad++; console.error('  bad sample_count in', c); }
      }
      if (bad === 0) ok('baselines.json: all classes present with percentiles');
      else fail(`baselines.json: ${bad} issues`);
    }
  }
}

// 4. fixtures parse
const fixturesDir = path.join(ROOT, 'fixtures');
if (!fs.existsSync(fixturesDir)) { fail('fixtures/ missing'); }
else {
  const sources = fs.readdirSync(fixturesDir, { withFileTypes: true }).filter(d => d.isDirectory());
  let totalFiles = 0, badFiles = 0, srcCount = 0;
  for (const s of sources) {
    const dir = path.join(fixturesDir, s.name);
    const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    if (files.length < 3) { badFiles++; console.error('  fewer than 3 fixtures in', s.name, '(', files.length, ')'); }
    else srcCount++;
    for (const f of files) {
      totalFiles++;
      const fp = path.join(dir, f);
      const buf = fs.readFileSync(fp);
      if (buf.length === 0) { badFiles++; console.error('  empty fixture', fp); continue; }
      const ext = path.extname(f).toLowerCase();
      if (ext === '.json') {
        try { JSON.parse(buf.toString('utf8')); }
        catch (e) { badFiles++; console.error('  invalid JSON', fp, e.message); }
      } else {
        // xml/html/text: basic non-empty + tag check for xml/html
        const txt = buf.toString('utf8', 'replace');
        if (ext === '.xml' || ext === '.html') {
          if (!txt.includes('<') || !txt.includes('>')) { badFiles++; console.error('  no tags in', fp); }
        }
      }
    }
  }
  if (badFiles === 0) ok(`fixtures: ${srcCount} source dirs, ${totalFiles} files, all parse`);
  else fail(`fixtures: ${badFiles} issues`);
  if (srcCount < 6) fail(`fixtures: only ${srcCount} source dirs (need 6)`);
}

if (process.exitCode === 1) {
  console.error('\nDATA GOAL NOT MET');
  process.exit(1);
} else {
  console.log('\nDATA GOAL MET');
}