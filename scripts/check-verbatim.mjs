// Verbatim spot-check (build script 14): every listed original sentence must appear in dist HTML.
import { readdirSync, readFileSync } from 'node:fs';
const decode = (s) => s.replace(/<\/?(a|span|strong|em)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const pages = Object.fromEntries(readdirSync('dist').filter((f) => f.endsWith('.html')).map((f) => [f, decode(readFileSync(`dist/${f}`, 'utf8'))]));
const norm = (s) => s.replace(/\s+/g, ' ');
const checks = JSON.parse(readFileSync(new URL('./verbatim.json', import.meta.url), 'utf8'));
let fail = 0;
for (const [page, list] of Object.entries(checks)) for (const t of list) {
  if (!pages[page]?.includes(norm(t))) { fail++; console.error(`MISSING in ${page}: ${t.slice(0, 90)}`); }
}
const total = Object.values(checks).flat().length;
console.log(`${total - fail}/${total} verbatim strings found.`);
process.exit(fail ? 1 : 0);
