// Builds the site into _site/ from apps/<Slug>/ folders and the shared templates in site/.
// Usage: node scripts/build.mjs [--out _site]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { indexPage, appPage, subPage, redirectPage, notFoundPage, googleTag } from '../site/templates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const out = path.resolve(root, outArg > -1 ? process.argv[outArg + 1] : '_site');

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const site = { ...readJSON(path.join(root, 'site/site.json')), year: new Date().getFullYear() };
const requirements = readJSON(path.join(root, 'site/requirements.json'));

// Headings get ids so pages can link to a section, e.g. guide/#bring-in-your-past-listening.
marked.use({
  renderer: {
    heading({ tokens, depth, text }) {
      const id = text.toLowerCase().replace(/<[^>]+>|&\w+;/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
  },
});

const STATUSES =['available', 'beta', 'coming-soon', 'showcase'];
// Standard pages: their default titles and order in the sub-navigation. Other Markdown files in pages/ come after.
const STANDARD_PAGES = { guide: 'Guide', changelog: 'Changelog', privacy: 'Privacy policy', support: 'Support' };

/** Splits `---` front matter (simple `key: value` lines) from a Markdown body. */
function parseMarkdown(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { data, body: text.slice(m[0].length) };
}

/** Replaces {{key}} with values from app.json, so shared pages can name the app and its contact. */
const fill = (text, app) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => app[k] ?? `{{${k}}}`);

/** The shared default for a page, if one applies to this app. */
function defaultFor(name, app) {
  const file = name === 'privacy' ? (app.privacy === 'no-data' ? 'privacy-no-data.md' : null) : `${name}.md`;
  const p = file && path.join(root, 'site/defaults', file);
  return p && fs.existsSync(p) ? p : null;
}

function loadApp(slug) {
  const dir = path.join(root, 'apps', slug);
  const app = { ...readJSON(path.join(dir, 'app.json')), slug, dir };
  const pagesDir = path.join(dir, 'pages');
  const own = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];

  const names = new Set(own.filter((n) => n !== 'index'));
  for (const name of Object.keys(STANDARD_PAGES)) if (!names.has(name) && defaultFor(name, app)) names.add(name);

  const pages = [...names].map((name) => {
    const file = own.includes(name) ? path.join(pagesDir, `${name}.md`) : defaultFor(name, app);
    const { data, body } = parseMarkdown(fill(fs.readFileSync(file, 'utf8'), app));
    return { name, file, body, ...data, title: data.title || STANDARD_PAGES[name] || name };
  });
  const rank = (p) => (p.order !== undefined ? Number(p.order) : Object.keys(STANDARD_PAGES).indexOf(p.name) + 1 || 100);
  pages.sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title));

  const index = own.includes('index') ? parseMarkdown(fill(fs.readFileSync(path.join(pagesDir, 'index.md'), 'utf8'), app)) : null;
  return { app, pages, index };
}

/** Checks app.json and the store requirements. Returns a list of problems. */
function validate({ app, pages }) {
  const problems = [];
  const has = (k) => app[k] !== undefined && app[k] !== null && app[k] !== '';
  for (const k of ['name', 'tagline', 'status']) if (!has(k)) problems.push(`app.json is missing "${k}"`);
  if (has('status') && !STATUSES.includes(app.status)) problems.push(`"status" must be one of ${STATUSES.join(', ')}`);
  if (app.status === 'available' && !app.links?.appStore) problems.push('status "available" needs links.appStore');
  if (app.status === 'beta' && !app.links?.testFlight) problems.push('status "beta" needs links.testFlight');
  if (!fs.existsSync(path.join(app.dir, 'icon.png'))) problems.push('icon.png is missing');
  if (app.source && !(app.source.repo && /^[0-9a-f]{7,40}$/.test(app.source.syncedCommit || ''))) {
    problems.push('"source" needs "repo" and a "syncedCommit" SHA (see .claude/skills/sync-app/SKILL.md)');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(app.slug)) problems.push('folder name may only use letters, numbers and hyphens');

  for (const store of app.stores || []) {
    const req = requirements[store];
    if (!req) { problems.push(`unknown store "${store}" (see site/requirements.json)`); continue; }
    for (const p of req.pages || []) {
      if (!pages.some((x) => x.name === p)) {
        const hint = p === 'privacy' ? ' (write pages/privacy.md, or set "privacy": "no-data" to use the shared policy)' : '';
        problems.push(`${req.label} requires a ${p} page${hint}`);
      }
    }
    for (const f of req.fields || []) if (!has(f)) problems.push(`${req.label} requires "${f}" in app.json`);
  }
  return problems;
}

function write(rel, html) {
  const file = path.join(out, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/** Copies an app's files (icon, screenshots, images used in pages) next to its pages. */
function copyAssets(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyAssets(s, d);
    else if (!/\.(md|json)$/.test(entry.name) && entry.name !== 'index.html' && !entry.name.startsWith('.')) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

// Load and check every app before writing anything.
const slugs = fs.readdirSync(path.join(root, 'apps'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const loaded = slugs.map(loadApp);
const lower = new Map();
let failed = false;
for (const entry of loaded) {
  const problems = validate(entry);
  const key = entry.app.slug.toLowerCase();
  if (lower.has(key)) problems.push(`folder name clashes with "${lower.get(key)}" when letter case is ignored`);
  lower.set(key, entry.app.slug);
  for (const p of problems) console.error(`✗ ${entry.app.slug}: ${p}`);
  failed ||= problems.length > 0;
}
if (failed) process.exit(1);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'site/styles.css'), path.join(out, 'styles.css'));
fs.cpSync(path.join(root, 'site/assets'), path.join(out, 'assets'), { recursive: true });

const ORDER = { available: 0, beta: 1, 'coming-soon': 2, showcase: 3 };
const apps = loaded.map((e) => e.app).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name));
write('index.html', indexPage({ site, apps }));
write('404.html', notFoundPage({ site, apps }));

let count = 2;
for (const { app, pages, index } of loaded) {
  copyAssets(app.dir, path.join(out, app.slug));

  const custom = path.join(app.dir, 'index.html');
  if (fs.existsSync(custom)) {
    let html = fs.readFileSync(custom, 'utf8');
    // Hand-written pages get the Google tag too, unless they already have it.
    if (site.googleTagId && !html.includes(`gtag/js?id=${site.googleTagId}`)) {
      if (!/<head[^>]*>/i.test(html)) { console.error(`✗ ${app.slug}: index.html has no <head> to put the Google tag in`); process.exit(1); }
      html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${googleTag(site.googleTagId)}`);
    }
    write(`${app.slug}/index.html`, html);
  } else {
    const shotsDir = path.join(app.dir, 'screenshots');
    const screenshots = fs.existsSync(shotsDir)
      ? fs.readdirSync(shotsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => `${site.base}/${app.slug}/screenshots/${f}`)
      : [];
    write(`${app.slug}/index.html`, appPage({
      site, app, pages, screenshots,
      contentHtml: index ? marked.parse(index.body) : '',
      contentHeading: index?.data.eyebrow,
    }));
  }
  count++;

  for (const page of pages) {
    write(`${app.slug}/${page.name}/index.html`, subPage({ site, app, pages, page, html: marked.parse(page.body) }));
    count++;
  }

  // Lowercase addresses redirect to the real one. Skipped where the file system ignores letter case (macOS by default),
  // because there the redirect would overwrite the page itself; the 404 page still fixes the case in the browser.
  const lc = app.slug.toLowerCase();
  if (lc !== app.slug && !fs.existsSync(path.join(out, lc))) {
    write(`${lc}/index.html`, redirectPage(`${site.base}/${app.slug}/`, site.url));
    for (const page of pages) write(`${lc}/${page.name}/index.html`, redirectPage(`${site.base}/${app.slug}/${page.name}/`, site.url));
  }
}

// Every page except redirects must carry the Google tag.
if (site.googleTagId) {
  const missing = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        if (!html.includes('http-equiv="refresh"') && !html.includes(`gtag/js?id=${site.googleTagId}`)) missing.push(path.relative(out, p));
      }
    }
  };
  walk(out);
  if (missing.length) {
    for (const p of missing) console.error(`✗ ${p}: missing the Google tag (${site.googleTagId})`);
    process.exit(1);
  }
}

console.log(`Built ${count} pages for ${apps.length} app${apps.length === 1 ? '' : 's'} into ${path.relative(root, out)}/`);
