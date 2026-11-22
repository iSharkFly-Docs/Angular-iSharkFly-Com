// Assembles the bilingual site in site/ (generated, git-ignored).
// Simplified Chinese is served from the site root; English from /en/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(SITE_DIR, 'src');
const OUT_DIR = path.join(SITE_DIR, 'site');
const EN_DIR = 'en';
const ZH_TRANSLATIONS_DIR = path.join(SITE_DIR, 'i18n', 'zh');

const SKIP_DIRS = new Set(['public', 'zh', EN_DIR]);
const STATIC_PREFIXES = ['images/', 'img/', 'assets/', `${EN_DIR}/`];

function listMarkdown(dir, rel = '') {
  const files = [];
  if (!fs.existsSync(dir))
    return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!rel && SKIP_DIRS.has(entry.name))
        continue;
      files.push(...listMarkdown(path.join(dir, entry.name), entryRel));
    } else if (entry.name.endsWith('.md')) {
      files.push(entryRel);
    }
  }
  return files;
}

function toEnglishPath(target) {
  return STATIC_PREFIXES.some(prefix => target.startsWith(prefix)) ? `/${target}` : `/${EN_DIR}/${target}`;
}

function moveLinksUnderEnglish(text) {
  return text
    .replace(/\]\(\/(?!\/)([^)\s]*)/g, (_, target) => `](${toEnglishPath(target)}`)
    .replace(/\bhref="\/(?!\/)([^"]*)"/g, (_, target) => `href="${toEnglishPath(target)}"`)
    .replace(/^(\s*link:\s*)\/(?!\/)(\S*)/gm, (_, prefix, target) => `${prefix}${toEnglishPath(target)}`);
}

function markUntranslated(text) {
  if (text.startsWith('---\n') || text.startsWith('---\r\n'))
    return text.replace(/^---\r?\n/, '---\nuntranslated: true\n');
  return `---\nuntranslated: true\n---\n\n${text}`;
}

function write(rel, text) {
  const file = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (fs.existsSync(path.join(SRC_DIR, 'public')))
    fs.cpSync(path.join(SRC_DIR, 'public'), path.join(OUT_DIR, 'public'), { recursive: true });

  let translated = 0;
  const pages = listMarkdown(SRC_DIR);
  for (const rel of pages) {
    const english = fs.readFileSync(path.join(SRC_DIR, rel), 'utf8');
    write(`${EN_DIR}/${rel}`, moveLinksUnderEnglish(english));

    const translationFile = path.join(ZH_TRANSLATIONS_DIR, rel);
    if (fs.existsSync(translationFile)) {
      write(rel, fs.readFileSync(translationFile, 'utf8'));
      translated++;
    } else {
      write(rel, markUntranslated(english));
    }
  }

  if (fs.existsSync(ZH_TRANSLATIONS_DIR)) {
    const known = new Set(pages);
    for (const rel of listMarkdown(ZH_TRANSLATIONS_DIR)) {
      if (!known.has(rel))
        console.warn(`[sync-zh] i18n/zh/${rel} has no English page in src/ and was skipped.`);
    }
  }

  console.log(`[sync-zh] ${pages.length} pages: Chinese in site/ (${translated} translated), English in site/${EN_DIR}/.`);
}

main();
