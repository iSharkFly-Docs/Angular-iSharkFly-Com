// Imports the Angular documentation (adev) from a checkout of the Angular repository
// into src/, converting adev-specific Markdown extensions to VitePress Markdown.
//
// Usage: node scripts/import-adev.mjs <path-to-angular-repo>
//
// - Pages are laid out by their angular.dev URL (not their content path), so the
//   root-relative links used inside the docs keep working.
// - The sidebar structure is written to scripts/nav.json and consumed by generate.mjs.
// - The upstream navigation file is parsed as text; no upstream code is executed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(SITE_DIR, 'src');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const UPSTREAM_SITE = 'https://angular.dev';

// Pages in src/ that are maintained by hand and must survive a re-import.
const KEEP = new Set(['index.md', 'api/index.md']);

const repoRoot = process.argv[2] && path.resolve(process.argv[2]);
if (!repoRoot || !fs.existsSync(path.join(repoRoot, 'adev', 'src', 'content')))
  throw new Error('Usage: node scripts/import-adev.mjs <path-to-angular-repo>');
const ADEV = path.join(repoRoot, 'adev', 'src');
const CONTENT = path.join(ADEV, 'content');
const NAV_SOURCE = path.join(ADEV, 'app', 'routing', 'navigation-entries', 'index.ts');

// ---------------------------------------------------------------------------
// Navigation parsing (a tolerant reader for the object literals in index.ts)
// ---------------------------------------------------------------------------

function stripComments(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '\'' || c === '"' || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1;
    } else {
      out += c;
    }
  }
  return out;
}

function parseArrayExport(src, name) {
  const start = src.indexOf(`export const ${name}`);
  if (start < 0)
    throw new Error(`${name} not found in ${NAV_SOURCE}`);
  const p = { s: src, i: src.indexOf('[', src.indexOf('=', start)) };
  return parseValue(p);
}

function ws(p) { while (/\s|,/.test(p.s[p.i] ?? '')) p.i++; }

function skipBalanced(p) {
  // Skips an expression up to the next top-level ',' / ']' / '}'.
  let depth = 0;
  for (; p.i < p.s.length; p.i++) {
    const c = p.s[p.i];
    if (c === '\'' || c === '"' || c === '`') { parseString(p); p.i--; continue; }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) { if (depth === 0) return; depth--; }
    else if (c === ',' && depth === 0) return;
  }
}

function parseString(p) {
  const q = p.s[p.i++];
  let out = '';
  while (p.s[p.i] !== q) {
    if (p.s[p.i] === '\\') { out += p.s[p.i + 1]; p.i += 2; } else out += p.s[p.i++];
  }
  p.i++;
  return out;
}

const SKIP = Symbol('skip');

function parseValue(p) {
  ws(p);
  const c = p.s[p.i];
  if (c === '[') {
    p.i++;
    const arr = [];
    for (ws(p); p.s[p.i] !== ']'; ws(p)) {
      const v = parseValue(p);
      if (v !== SKIP) arr.push(v);
    }
    p.i++;
    return arr;
  }
  if (c === '{') {
    p.i++;
    const obj = {};
    for (ws(p); p.s[p.i] !== '}'; ws(p)) {
      if (p.s.startsWith('...', p.i)) { p.i += 3; skipBalanced(p); continue; }
      const key = /['"]/.test(p.s[p.i]) ? parseString(p) : p.s.slice(p.i).match(/^[\w$]+/)[0];
      if (!/['"]/.test(p.s[p.i - 1])) p.i += key.length;
      ws(p);
      p.i++; // ':'
      const v = parseValue(p);
      if (v !== SKIP) obj[key] = v;
    }
    p.i++;
    return obj;
  }
  if (c === '\'' || c === '"' || c === '`')
    return parseString(p);
  // Spreads, identifiers, calls, conditionals: not representable, skip them.
  if (p.s.startsWith('...', p.i)) p.i += 3;
  const m = p.s.slice(p.i).match(/^(true|false|-?\d+(\.\d+)?)\b/);
  if (m) { p.i += m[0].length; return JSON.parse(m[0]); }
  skipBalanced(p);
  return SKIP;
}

// ---------------------------------------------------------------------------
// Page collection
// ---------------------------------------------------------------------------

const pages = new Map(); // url path (no leading slash) -> source file

function contentFile(contentPath) {
  for (const candidate of [`${contentPath}.md`, `${contentPath}/README.md`, `${contentPath}/index.md`]) {
    const file = path.join(CONTENT, candidate);
    if (fs.existsSync(file))
      return file;
  }
  return null;
}

function firstHeading(file) {
  const text = fs.readFileSync(file, 'utf8');
  const h1 = text.match(/^#\s+(.+?)\s*(\{#[^}]*\})?\s*$/m);
  if (h1) return h1[1].replace(/`/g, '');
  const header = text.match(/<docs-decorative-header[^>]*\btitle="([^"]+)"/);
  return header ? header[1] : null;
}

function toNavItem(item) {
  if (item.children) {
    const items = item.children.map(toNavItem).filter(Boolean);
    return items.length ? { text: item.label, items } : null;
  }
  if (!item.path && item.path !== '')
    return null;
  if (/^https?:/.test(item.path))
    return { text: item.label, link: item.path };
  if (item.contentPath) {
    const file = contentFile(item.contentPath);
    if (file) pages.set(item.path, file);
    else console.warn(`[import-adev] missing content for ${item.contentPath}`);
  }
  return { text: item.label, link: `/${item.path}` };
}

function listDir(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
}

function referenceSection(label, urlBase, dir) {
  const items = [{ text: 'Overview', link: `/${urlBase}` }];
  pages.set(urlBase, path.join(dir, 'overview.md'));
  for (const entry of listDir(dir)) {
    if (!entry.name.endsWith('.md') || entry.name === 'overview.md') continue;
    const name = entry.name.replace(/\.md$/, '');
    const file = path.join(dir, entry.name);
    pages.set(`${urlBase}/${name}`, file);
    items.push({ text: firstHeading(file) ?? name, link: `/${urlBase}/${name}` });
  }
  return { label, items };
}

function tutorialSection(name) {
  const dir = path.join(CONTENT, 'tutorials', name);
  const intro = path.join(dir, 'intro', 'README.md');
  if (!fs.existsSync(intro)) return null;
  pages.set(`tutorials/${name}`, intro);
  const items = [{ text: 'Introduction', link: `/tutorials/${name}` }];
  const steps = listDir(path.join(dir, 'steps'))
    .filter(e => e.isDirectory() && fs.existsSync(path.join(dir, 'steps', e.name, 'README.md')))
    .map(e => e.name)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b));
  for (const step of steps) {
    const file = path.join(dir, 'steps', step, 'README.md');
    pages.set(`tutorials/${name}/${step}`, file);
    items.push({ text: firstHeading(file) ?? step, link: `/tutorials/${name}/${step}` });
  }
  return { text: firstHeading(intro) ?? name, collapsed: true, items };
}

function collect() {
  const nav = stripComments(fs.readFileSync(NAV_SOURCE, 'utf8'));
  const docs = parseArrayExport(nav, 'DOCS_SUB_NAVIGATION_DATA');
  const reference = parseArrayExport(nav, 'REFERENCE_SUB_NAVIGATION_DATA');
  const footer = parseArrayExport(nav, 'FOOTER_NAVIGATION_DATA');

  // Sections generated at build time upstream.
  const errors = referenceSection('Error Encyclopedia', 'errors', path.join(CONTENT, 'reference', 'errors'));
  const diagnostics = referenceSection('Extended Diagnostics', 'extended-diagnostics',
    path.join(CONTENT, 'reference', 'extended-diagnostics'));
  for (const group of reference) {
    if (group.label === errors.label) group.children = [];
    if (group.label === diagnostics.label) group.children = [];
  }

  const sidebar = [];
  for (const item of docs) {
    const nav = toNavItem(item);
    if (nav) sidebar.push(nav);
  }

  const tutorials = listDir(path.join(CONTENT, 'tutorials'))
    .filter(e => e.isDirectory())
    .map(e => tutorialSection(e.name))
    .filter(Boolean);
  if (fs.existsSync(path.join(CONTENT, 'tutorials', 'home.md')))
    pages.set('tutorials', path.join(CONTENT, 'tutorials', 'home.md'));
  sidebar.push({ text: 'Tutorials', items: [{ text: 'Overview', link: '/tutorials' }, ...tutorials] });

  const referenceItems = reference.map(item => {
    if (item.label === errors.label) return { text: errors.label, items: errors.items };
    if (item.label === diagnostics.label) return { text: diagnostics.label, items: diagnostics.items };
    return toNavItem(item);
  }).filter(Boolean);
  sidebar.push({ text: 'Reference', items: [...referenceItems, ...footer.map(toNavItem).filter(Boolean)] });

  return sidebar;
}

// ---------------------------------------------------------------------------
// Markdown conversion
// ---------------------------------------------------------------------------

const LANGUAGES = { 'angular-ts': 'ts', 'angular-html': 'html', typescript: 'ts', file: 'txt', mermaid: 'txt' };
const EXT_LANGUAGES = { ts: 'ts', js: 'js', mjs: 'js', html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'md', yaml: 'yaml', yml: 'yaml', sh: 'shell' };

const assets = new Set();
let warnings = 0;

function attrs(source) {
  const out = {};
  for (const m of source.matchAll(/([\w-]+)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)')?/g))
    out[m[1]] = m[2] ?? m[3] ?? true;
  return out;
}

function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
}

function indentBlock(text, indent) {
  return text.split('\n').map(l => (l ? indent + l : l)).join('\n');
}

function fence(code, lang, title) {
  const ticks = '`'.repeat(Math.max(3, ...[...code.matchAll(/`{3,}/g)].map(m => m[0].length + 1)));
  return `${ticks}${lang}${title ? ` [${title}]` : ''}\n${code.replace(/\s+$/, '')}\n${ticks}`;
}

const REGION_MARKER = /^\s*(?:\/\/|<!--|\/\*|#)\s*#(end)?docregion\b\s*([^\n]*?)\s*(?:-->|\*\/)?\s*$/;

function extractRegion(code, region) {
  const lines = code.split('\n');
  if (!region)
    return lines.filter(l => !REGION_MARKER.test(l)).join('\n');
  const out = [];
  let inside = false;
  for (const line of lines) {
    const m = line.match(REGION_MARKER);
    if (m) {
      const names = m[2].split(',').map(s => s.trim()).filter(Boolean);
      if (names.includes(region) || (m[1] && !names.length && inside)) inside = !m[1];
      continue;
    }
    if (inside) out.push(line);
  }
  return dedent(out.join('\n'));
}

function readExample(a, page) {
  const file = path.join(repoRoot, a.path);
  if (!fs.existsSync(file)) {
    console.warn(`[import-adev] ${page}: example not found: ${a.path}`);
    warnings++;
    return null;
  }
  const code = extractRegion(fs.readFileSync(file, 'utf8'), a.region);
  const lang = LANGUAGES[a.language] ?? a.language ?? EXT_LANGUAGES[path.extname(file).slice(1)] ?? 'txt';
  return { code, lang };
}

function convertDocsCode(open, inner, page) {
  const a = attrs(open);
  if (a.path) {
    const example = readExample(a, page);
    if (!example) return `> Example: [${a.path}](https://github.com/angular/angular/blob/main/${a.path})`;
    return fence(example.code, example.lang, a.header ?? path.basename(a.path));
  }
  const lang = LANGUAGES[a.language] ?? a.language ?? 'txt';
  return fence(dedent(inner ?? ''), lang, a.header);
}

const DOCS_CODE = /^([ \t]*)<docs-code\b((?:[^>"]|"[^"]*")*?)(?:\/>|>([\s\S]*?)<\/docs-code>)/gm;

function convertBlocks(text, page) {
  // Multi-file code examples -> VitePress code groups.
  text = text.replace(/^([ \t]*)<docs-code-multifile\b([^>]*)>([\s\S]*?)<\/docs-code-multifile>/gm, (_, indent, open, inner) => {
    if (attrs(open).hideCode) {
      // Upstream shows only a live demo here; link to the example source instead.
      const files = [...inner.matchAll(DOCS_CODE)].map(m => attrs(m[2])).filter(a => a.path);
      const links = files.map(a => `[${a.header ?? path.basename(a.path)}](https://github.com/angular/angular/blob/main/${a.path})`);
      return indentBlock(links.length ? `Example source: ${links.join(' · ')}` : '', indent);
    }
    const blocks = [...inner.matchAll(DOCS_CODE)].map(m => convertDocsCode(m[2], m[3], page));
    return indentBlock(`::: code-group\n\n${blocks.join('\n\n')}\n\n:::`, indent);
  });
  // Remaining single code examples.
  text = text.replace(DOCS_CODE, (_, indent, open, inner) => indentBlock(convertDocsCode(open, inner, page), indent));

  // Tabs -> theme Tabs/TabItem components.
  text = text.replace(/^[ \t]*<docs-tab-group\b[^>]*>([\s\S]*?)^[ \t]*<\/docs-tab-group>/gm, (_, inner) => {
    const tabs = [...inner.matchAll(/<docs-tab\b([^>]*)>([\s\S]*?)<\/docs-tab>/g)];
    const list = tabs.map((t, i) => `{label:'${String(attrs(t[1]).label ?? `Tab ${i + 1}`).replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '&quot;')}',value:'t${i}'}`);
    const items = tabs.map((t, i) => `<TabItem value="t${i}">\n\n${dedent(t[2])}\n\n</TabItem>`);
    return `<Tabs :tabs="[${list.join(',')}]">\n\n${items.join('\n\n')}\n\n</Tabs>`;
  });

  // Workflows -> numbered steps.
  text = text.replace(/<docs-workflow>([\s\S]*?)<\/docs-workflow>/g, (_, inner) => {
    let n = 0;
    return inner.replace(/^[ \t]*<docs-step\b([^>]*)>([\s\S]*?)<\/docs-step>/gm,
      (__, open, body) => `### ${++n}. ${attrs(open).title ?? ''}\n\n${dedent(body)}\n`);
  });
  text = text.replace(/^[ \t]*<docs-step\b([^>]*)>([\s\S]*?)<\/docs-step>/gm,
    (_, open, body) => `### ${attrs(open).title ?? ''}\n\n${dedent(body)}\n`);

  // Cards -> list of links.
  text = text.replace(/^[ \t]*<docs-card-container\b([^>]*)>([\s\S]*?)<\/docs-card-container>/gm, (_, open, inner) => {
    const header = attrs(open).headerTitle ? `**${attrs(open).headerTitle}**\n\n` : '';
    const cards = [...inner.matchAll(/<docs-card\b([^>]*)>([\s\S]*?)<\/docs-card>/g)].map(m => {
      const a = attrs(m[1]);
      const body = dedent(m[2]).replace(/\n+/g, ' ').trim();
      const title = a.href ? `[**${a.title}**](${a.href})` : `**${a.title}**`;
      return `- ${title}${body ? `: ${body}` : ''}`;
    });
    return `${header}${cards.join('\n')}\n`;
  });
  text = text.replace(/^[ \t]*<docs-card\b([^>]*)>([\s\S]*?)<\/docs-card>/gm, (_, open, body) => {
    const a = attrs(open);
    return `- ${a.href ? `[**${a.title}**](${a.href})` : `**${a.title}**`}: ${dedent(body).replace(/\n+/g, ' ')}`;
  });

  // Pills -> inline link list.
  text = text.replace(/^[ \t]*<docs-pill-row\b[^>]*>([\s\S]*?)<\/docs-pill-row>/gm, (_, inner) => {
    const pills = [...inner.matchAll(/<docs-pill\b([^>]*?)\/?>/g)].map(m => `[${attrs(m[1]).title}](${attrs(m[1]).href})`);
    return pills.map(p => `- ${p}`).join('\n') + '\n';
  });
  text = text.replace(/<docs-pill\b([^>]*?)\/?>/g, (_, a) => `[${attrs(a).title}](${attrs(a).href})`);
  text = text.replace(/^[ \t]*<docs-nav-card\b([^>]*)>([\s\S]*?)<\/docs-nav-card>/gm, (_, open, inner) => {
    const links = [...inner.matchAll(/<docs-nav-link\b([^>]*)>([\s\S]*?)<\/docs-nav-link>/g)].map(m => {
      const body = dedent(m[2]).replace(/\n+/g, ' ').trim();
      return `- [**${attrs(m[1]).title}**](${attrs(m[1]).href})${body ? `: ${body}` : ''}`;
    });
    return `**${attrs(open).title ?? ''}**\n\n${links.join('\n')}\n`;
  });
  text = text.replace(/<docs-nav-(?:link|card)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/docs-nav-(?:link|card)>)/g,
    (_, a, body) => `[${attrs(a).title ?? attrs(a).label ?? (body ?? '').trim()}](${attrs(a).href ?? attrs(a).link})`);

  // Callouts -> custom containers.
  text = text.replace(/^[ \t]*<docs-callout\b([^>]*)>([\s\S]*?)<\/docs-callout>/gm, (_, open, body) => {
    const a = attrs(open);
    const kind = a.critical ? 'danger' : a.important ? 'warning' : 'tip';
    return `::: ${kind} ${a.title ?? ''}\n${dedent(body)}\n:::`;
  });

  // Videos.
  text = text.replace(/<docs-video\b([^>]*?)\/?>(\s*<\/docs-video>)?/g, (_, a) =>
    `<iframe src="${attrs(a).src}" title="${attrs(a).title ?? 'Video'}" style="width:100%;aspect-ratio:16/9;border:0" allowfullscreen></iframe>`);

  // Decorative headers -> page title.
  text = text.replace(/<docs-decorative-header\b([^>]*)>(?:[ \t]*<!--.*?-->)?([\s\S]*?)<\/docs-decorative-header>/g,
    (_, open, body) => `# ${attrs(open).title}\n\n${dedent(body)}\n`);

  return text;
}

const ADMONITIONS = {
  NOTE: 'info', TIP: 'tip', HELPFUL: 'tip', IMPORTANT: 'warning', CRITICAL: 'danger',
  QUESTION: 'info', SUMMARY: 'info', TLDR: 'info',
};

function convertLines(text) {
  const out = [];
  const lines = text.split('\n');
  let fenceMarker = null;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const f = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (f) {
      if (!fenceMarker) {
        fenceMarker = f[2];
        out.push(`${f[1]}${f[2]}${convertFenceInfo(f[3])}`);
      } else {
        if (f[2].startsWith(fenceMarker) && !f[3].trim()) fenceMarker = null;
        out.push(line);
      }
      continue;
    }
    if (fenceMarker) { out.push(line); continue; }

    const a = line.match(/^(\s*)(NOTE|TIP|HELPFUL|IMPORTANT|CRITICAL|QUESTION|SUMMARY|TLDR):\s*(.*)$/);
    if (a) {
      const body = [a[3]];
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^\s*(`{3,}|~{3,})/.test(lines[i + 1]))
        body.push(lines[++i].slice(a[1].length));
      // An HTML list glued to the end of the first line must start its own block.
      const content = body.join('\n').replace(/(\S)[ \t]*(<(?:ul|ol)\b)/, '$1\n\n$2').split('\n');
      out.push(`${a[1]}::: ${ADMONITIONS[a[2]]} ${a[2]}`, ...content.map(l => (l ? a[1] + l : l)), '', `${a[1]}:::`);
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

function convertFenceInfo(info) {
  const m = info.match(/^\s*([\w-]*)\s*(\{.*\})?\s*$/);
  if (!m) return info;
  const lang = LANGUAGES[m[1]] ?? m[1];
  const header = m[2]?.match(/header\s*:\s*["']([^"']+)["']/);
  return `${lang}${header ? ` [${header[1]}]` : ''}`;
}

function rewriteTarget(target, known) {
  if (/^(https?:|mailto:|#|\.\.?\/|data:)/.test(target)) return target;
  const asset = target.match(/^\/?(?:adev\/src\/)?assets\/(.+?)(?=[?#]|$)/);
  if (asset) {
    if (fs.existsSync(path.join(ADEV, 'assets', asset[1]))) {
      assets.add(asset[1]);
      return `/assets/${asset[1]}`;
    }
    return `${UPSTREAM_SITE}/assets/${asset[1]}`;
  }
  const [, pathname, suffix = ''] = target.match(/^\/?([^?#]*)(.*)$/);
  const clean = pathname.replace(/\/$/, '');
  if (clean === 'api' || known.has(clean)) return `/${clean}${suffix}`;
  return `${UPSTREAM_SITE}/${pathname}${suffix}`;
}

function rewriteLinks(text, known) {
  const parts = text.split(/(^\s*(?:`{3,}|~{3,})[\s\S]*?^\s*(?:`{3,}|~{3,})\s*$|`[^`\n]+`)/m);
  return parts.map((part, i) => {
    if (i % 2) return part; // code
    return part
      .replace(/<(body|head|html)>/g, '&lt;$1&gt;') // element names mentioned in prose
      .replace(/(\]\()(<?)([^)\s>]+)(>?)/g, (_, pre, lt, target, gt) => `${pre}${lt}${rewriteTarget(target, known)}${gt}`)
      .replace(/\b(href|src)="([^"]+)"/g, (_, attr, target) => `${attr}="${rewriteTarget(target, known)}"`);
  }).join('');
}

function convertPage(text, page, known) {
  text = text.replace(/\r\n/g, '\n');
  if (!/<table\b/.test(text)) text = text.replace(/^<\/table>\s*$/gm, ''); // stray closing tag upstream
  text = convertBlocks(text, page);
  text = convertLines(text);
  text = rewriteLinks(text, known);
  const leftovers = text.match(/<docs-[\w-]+/g);
  if (leftovers) {
    console.warn(`[import-adev] ${page}: unconverted ${[...new Set(leftovers)].join(', ')}`);
    warnings++;
  }
  return text;
}

// ---------------------------------------------------------------------------

function clearSrc(dir, rel = '') {
  for (const entry of listDir(dir)) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entryRel === 'public/assets') { fs.rmSync(full, { recursive: true, force: true }); continue; }
      clearSrc(full, entryRel);
      if (!fs.readdirSync(full).length) fs.rmdirSync(full);
    } else if (entry.name.endsWith('.md') && !KEEP.has(entryRel)) {
      fs.rmSync(full);
    }
  }
}

function main() {
  const sidebar = collect();
  const known = new Set(pages.keys());

  clearSrc(SRC_DIR);
  for (const [url, file] of pages) {
    const rel = `${url}.md`;
    if (KEEP.has(rel)) continue;
    const out = path.join(SRC_DIR, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, convertPage(fs.readFileSync(file, 'utf8'), url, known));
  }

  for (const asset of assets) {
    const out = path.join(SRC_DIR, 'public', 'assets', asset);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(path.join(ADEV, 'assets', asset), out);
  }

  fs.writeFileSync(NAV_FILE, JSON.stringify(sidebar, null, 2) + '\n');
  console.log(`[import-adev] ${pages.size} pages, ${assets.size} assets, ${warnings} warnings. Sidebar: scripts/nav.json`);
}

main();
