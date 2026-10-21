// Generates favicon.svg/.ico, apple-touch-icon.png and 1200x630 Open Graph images into public/.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
const P = (p) => new URL(`../${p}`, import.meta.url).pathname;
mkdirSync(P('public/og'), { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#413659"/><text x="32" y="43" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="700" font-size="30" fill="#fff">SG</text><path d="M52 8 Q53 13 58 14 Q53 15 52 20 Q51 15 46 14 Q51 13 52 8Z" fill="#FFCB05"/></svg>`;
writeFileSync(P('public/favicon.svg'), svg);
await sharp(Buffer.from(svg), { density: 600 }).resize(180, 180).png().toFile(P('public/apple-touch-icon.png'));
const png32 = await sharp(Buffer.from(svg), { density: 300 }).resize(32, 32).png().toBuffer();
// ICO container holding one 32x32 PNG.
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png32.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(P('public/favicon.ico'), Buffer.concat([head, png32]));

async function og(src, out, { tint = false } = {}) {
  if (existsSync(P(`public/og/${out}`))) return;
  let img = sharp(P(`src/assets/images/${src}`)).resize({ height: 560, width: 1100, fit: 'inside' });
  if (tint) img = img.tint({ r: 98, g: 57, b: 98 });
  const buf = await img.jpeg({ quality: 88 }).toBuffer();
  const { width, height } = await sharp(buf).metadata();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#413659' } })
    .composite([{ input: buf, left: Math.round((1200 - width) / 2), top: Math.round((630 - height) / 2) }])
    .jpeg({ quality: 86 }).toFile(P(`public/og/${out}`));
}
await og('global/hero-mobile-girls-hanging-on-bars-purple-tint.jpg', 'default.jpg', { tint: true });
await og('team-gymnastics/team-13-team-on-podium-2019-banner.jpg', 'team.jpg');
await og('photos/photos-07-three-gymnasts-medals-2019-balloons.jpg', 'photos.jpg');
await og('nerf-battle/nerf-battle-01-kids-with-nerf-blasters.png', 'nerf.jpg');
console.log('icons + og images ready');
