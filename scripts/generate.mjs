// Generates the site.json configuration file for the Angular documentation.
// The sidebar comes from scripts/nav.json, which import-adev.mjs writes from the
// upstream adev navigation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAV_FILE = path.join(SITE_DIR, 'scripts', 'nav.json');
const GENERATED_DIR = path.join(SITE_DIR, '.vitepress', 'generated');

const EXPANDED_GROUPS = new Set(['Introduction']);

function toSidebarItems(items, base, depth) {
  return items.map(item => {
    if (item.items) {
      return {
        text: item.text,
        collapsed: !(depth === 0 && EXPANDED_GROUPS.has(item.text)),
        items: toSidebarItems(item.items, base, depth + 1),
      };
    }
    const link = item.link.startsWith('/') ? `${base}${item.link.slice(1)}` : item.link;
    return { text: item.text, link };
  });
}

function main() {
  if (!fs.existsSync(NAV_FILE))
    throw new Error('scripts/nav.json is missing. Run "node scripts/import-adev.mjs <angular-repo>" first.');
  const nav = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const site = {
    locales: {
      root: {
        label: 'Angular',
        base: '/',
        sidebar: { '/': toSidebarItems(nav, '/', 0) },
      },
    },
  };

  fs.writeFileSync(path.join(GENERATED_DIR, 'site.json'), JSON.stringify(site, null, 2));
  console.log('[generate] Generated site.json');
}

main();
