// Launch gate (build script 7.14 / 14): fails if any "PLACEHOLDER" remains in the built site.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const hits = [];
for (const f of walk('dist').filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  const re = /PLACEHOLDER - confirm with gym: ([^<]*)/g; let m;
  while ((m = re.exec(html))) hits.push(`${f.replace(/^dist/, '')}: ${m[1].trim()}`);
}
if (hits.length) {
  console.error(`\n${hits.length} placeholder(s) still need gym confirmation:\n` + hits.map((h) => ' - ' + h).join('\n'));
  process.exit(1);
}
console.log('No placeholders left. OK to launch.');
