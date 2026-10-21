// Downloads every photo the site uses from the gym's current Wix site into src/assets/images/.
// The files are the exact original bytes (checked with SHA-256). No dependencies; needs Node 18+ (fetch).
// Usage: node scripts/fetch-assets.mjs        (skips files that already exist and match)
// Note: two files end in .png but Wix serves them under ~mv2.jpg URLs; the bytes are saved unchanged on purpose.
// Favicons and Open Graph images in public/ are NOT downloaded: `npm run build` creates them (scripts/make-icons-og.mjs).
// Fonts come from the @fontsource npm packages installed by `npm install`.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'images');
// [project path under src/assets/images, original URL, sha256, bytes]
const ASSETS = [
  ['archived-coach-info/coach-jessica-k-owner.jpg', 'https://static.wixstatic.com/media/90a441_d4fa091d26c44b9b855245011eb4d0f3~mv2.jpg', '10bb025311279a680aaf7a06995d2a4fc8948725b2aa2d9b4a6e1d9bdde0279c', 159044],
  ['archived-coach-info/coach-kaitlyn-w.jpg', 'https://static.wixstatic.com/media/90a441_126808887adc494d99ece8761aea5954~mv2.jpg', '693a3b620ae37edf5a0d53069950db2743b05a75f7e1c1e9ee049eb1395c90f3', 214035],
  ['archived-coach-info/coach-mariah-c.jpg', 'https://static.wixstatic.com/media/90a441_c533fd66e17e4e0ebdc9e8f5a5f15614~mv2.jpg', '25585784a9f36abd88a43c7766e07d1d74691b0db96797dca11b948e19c7fa3c', 129853],
  ['archived-coach-info/coach-noelle-g.jpg', 'https://static.wixstatic.com/media/90a441_570f0e90637d4803bf92a832225325f1~mv2.jpg', '7eeee822124ed622feb29e391342d4b2a7250c4015fc4dffbb7819d76584a305', 177806],
  ['archived-coach-info/coach-shannon-s-office-manager.jpg', 'https://static.wixstatic.com/media/90a441_0c0f2da20e4b4f3fb785ec956b41bb92~mv2.jpg', 'c815403c0f05dc5c314337db7c4a7482a4621562ad1dbdd999ee3e5e250b9b80', 226157],
  ['global/hero-desktop-girls-hanging-on-bars.jpg', 'https://static.wixstatic.com/media/90a441_42a75e502eb440c99184d07cde02786e~mv2.jpg', 'd69dc95c96b5c18c67e91dc61a2a03713f5261f5361f078a32cde0dad926b5b1', 131864],
  ['global/hero-mobile-girls-hanging-on-bars-purple-tint.jpg', 'https://static.wixstatic.com/media/90a441_a6ead47e47164499ac5a0d9a2c051f55~mv2.jpg', 'd69dc95c96b5c18c67e91dc61a2a03713f5261f5361f078a32cde0dad926b5b1', 131864],
  ['nerf-battle/nerf-battle-01-kids-with-nerf-blasters.png', 'https://static.wixstatic.com/media/90a441_da6757e9d832412ca5887c5f5b13e8f6~mv2.jpg', 'e5eccd287140de92012879d7beeb151a321cf32376e4f49b1b6c0dc8a67bb252', 149721],
  ['photos/photos-01-split-leap-on-tumble-track.jpg', 'https://static.wixstatic.com/media/90a441_66ca3ecdd43949fa9e6edcfcfb594e63~mv2.jpg', 'ebe10bfd1a49ae359750b34f2f7ff9de5a0a62a0b3d10f2c0797398747f445b0', 137503],
  ['photos/photos-02-preschool-class-on-mats-with-tunnel.jpg', 'https://static.wixstatic.com/media/90a441_388832d950aa4d30b0104a3e6b201c0a~mv2.jpg', '741345b587116baedc283fb7296ceb30e0538bdea15146feec2ba3ad2c2ad346', 162374],
  ['photos/photos-03-toddler-jumping-on-tumble-track.jpg', 'https://static.wixstatic.com/media/90a441_8142972fefed4be5a3b31adbd8b6cbee~mv2.jpg', 'c0d50f3fc36e4a59fdfd70ca916729ccc0a367f7d46c291db76b22a30235f7e6', 90837],
  ['photos/photos-04-toddler-hanging-on-bar.jpg', 'https://static.wixstatic.com/media/90a441_b211e0e28bd84c4c8f3a2632b6482d29~mv2.jpg', 'd682c26675311c2806482b993c51d55a3c2a73ce2939578c4d3b96464d4377c1', 91799],
  ['photos/photos-05-boy-on-rings.jpg', 'https://static.wixstatic.com/media/90a441_91e0dc9c231c4645ab94d913fad4d5fb~mv2.jpg', 'a83acde7fbc41abcb4e85759e03bff69d15611d84e25913e71a490d659958054', 140298],
  ['photos/photos-06-gymnast-handstand-at-meet.jpg', 'https://static.wixstatic.com/media/90a441_dd35e2ddffbc46dc81271dafddec0efb~mv2.jpg', 'b8ec5fc223d68d75621800e1884fe6d1e209cc4a9a681a9d5e5188231bbf9972', 108581],
  ['photos/photos-07-three-gymnasts-medals-2019-balloons.jpg', 'https://static.wixstatic.com/media/90a441_fc8c3c26a2c7418094896109d610b0c8~mv2.jpg', '1ffe8c22f2efc545e81a0dcfa0d9971fad72d5dc44500d3f54a8d5dd2f93f1dc', 190710],
  ['photos/photos-08-team-2nd-place-banner.jpg', 'https://static.wixstatic.com/media/90a441_8013341455ce4ef3ba49c474d1c3f285~mv2.jpg', 'c0ce2e2e6a34c40cb7a10deef84c44cf944ed0a65117f74af5c725573a52d31d', 146243],
  ['photos/photos-09-boy-on-tumble-track.jpg', 'https://static.wixstatic.com/media/90a441_10511d1f3f704d94a41c0ae4868a7b7e~mv2.jpg', '1d11efad9c588cf6a7c106e9ee7bbc105b7f62bbf6073c166e293872012fd47b', 116662],
  ['photos/photos-10-child-with-nerf-blaster-on-mats.jpg', 'https://static.wixstatic.com/media/90a441_6dcdb280323e4210bad573169b7988bb~mv2.jpg', 'd2b83d680f2b18e4c6d424c54c3630033626a122c24d8a43b9979ba04ca8eeab', 110019],
  ['photos/photos-11-gymnast-leg-extension-on-beam.png', 'https://static.wixstatic.com/media/90a441_0dce9e21e6914e02891c9f7d9ae7b8b9~mv2.jpg', '14397cb52490437d4fbd6262dbe623745d1bbdb74722d42dc33b336a53942c28', 1646317],
  ['photos/photos-12-kids-class-on-floor.jpg', 'https://static.wixstatic.com/media/90a441_740715a794f543739d58a9cc0642ea8c~mv2.jpg', '95dc31d0e9d565328e2acfc8236cf7ab0f5125f2645959bf8a286836b0b93ce1', 122830],
  ['photos/photos-13-two-gymnasts-arms-up-by-team-wall.jpg', 'https://static.wixstatic.com/media/90a441_5933189609734be09ae5b9d423d4e2f4~mv2.jpg', 'f5443a88c90cc9cb7d6b39dbc5ce9cd5745b25097022f0daf59d8c7b430f2f95', 121217],
  ['photos/photos-14-gymnast-with-wisconsin-sign-at-meet.jpg', 'https://static.wixstatic.com/media/90a441_5eaaeb9fca734a9193fbc34ab78cb3f2~mv2.jpg', '77a4de924441bbf0642b8b69f10072920efd07223cbe145c5cfaa16427444845', 153629],
  ['photos/photos-15-two-gymnasts-dancing-at-meet.jpg', 'https://static.wixstatic.com/media/90a441_fde20611ab95467c936ec88f4f410925~mv2.jpg', '4019dc5164fe5c89053c437939ac742b9fbd0e53fc2378ea93400e55afe0c24d', 121492],
  ['team-gymnastics/team-01-gymnast-on-uneven-bars-at-meet.jpg', 'https://static.wixstatic.com/media/90a441_c4d0adb264d442b191005b7fcd7ab648~mv2.jpg', '6d1774745c579cf7e89bdbec959e090703f37e8c2fc633deecf7fc58141db705', 171995],
  ['team-gymnastics/team-02-three-gymnasts-on-podium.jpg', 'https://static.wixstatic.com/media/90a441_6d57f67e35534b2cbc657bfc776cefc4~mv2.jpg', '849462d7663780bddf8f61ccdaaf8cc758e99d896cb954331f2ba051567153ea', 159463],
  ['team-gymnastics/team-03-team-with-wisconsin-sign.jpg', 'https://static.wixstatic.com/media/90a441_82327880bc664679b0f61580165a67a9~mv2.jpg', 'd7d557867ca9d9dc733716eb00ad067cec202da9127ca38bc8914204b7700c2c', 141405],
  ['team-gymnastics/team-04-two-teammates-hugging.jpg', 'https://static.wixstatic.com/media/90a441_811e4d173733447ea7f7e5c5dbe8848e~mv2.jpg', '794d90e3ec318334e86a1bab2842078076acc8bab0076ac88fe01e1531389994', 121681],
  ['team-gymnastics/team-05-gymnasts-stretching-splits.jpg', 'https://static.wixstatic.com/media/90a441_7b1d07e7e8b14f869a0ad63a2be84633~mv2.jpg', '654f157bd114421c9d1c4861f6983962200cd3d43337aee317b44a17658cccf2', 122824],
  ['team-gymnastics/team-06-two-girls-hugging-smiling.jpg', 'https://static.wixstatic.com/media/90a441_a5255f9a4c2d46f0863529497ef3635b~mv2.jpg', '4d2b08dcccdc664ec2c9eec02621a3dfc22fda57b6cd8ec58b29cbf48b502e21', 211482],
  ['team-gymnastics/team-07-gymnast-at-region-2-xcel-regionals.jpg', 'https://static.wixstatic.com/media/90a441_6e031d55e6e04ce8898b1a620868b275~mv2.jpg', '1cd646bb516556b3676948b974cce2441530636caa580c8d913729b328ed85b8', 143485],
  ['team-gymnastics/team-08-gymnast-bar-release-at-meet.jpg', 'https://static.wixstatic.com/media/90a441_941aa11fe72d44e696541582d559f191~mv2.jpg', 'dbc51abcbb58411a180b69e8a404e432ba4311f9a2f1b844ec4dfc93038568cc', 182176],
  ['team-gymnastics/team-09-large-group-arms-up.jpg', 'https://static.wixstatic.com/media/90a441_9206ba6f94bc499782ed81883f9c4d04~mv2.jpg', '90790ef2d988b26afb68f20cafa83e2b51225b43a16da21a5ad5225b3f677a37', 192161],
  ['team-gymnastics/team-10-team-outdoors-with-wisconsin-sign.jpg', 'https://static.wixstatic.com/media/90a441_515df8e7aa824ee1ba0c6d00780ad126~mv2.jpg', 'c40cbefa971fcb7f3d0b1bcb48dc589ca4bdc48d1e4bab0e5246e780343ba994', 319327],
  ['team-gymnastics/team-11-meet-parade-wisconsin-and-n-dakota-signs.jpg', 'https://static.wixstatic.com/media/90a441_d6cba61927fd4d94b8ba5b405e043f78~mv2.jpg', 'd2e59913d8791dcf9427472b4e315be2d8324f3321e31f30e4cb8a5b7f2a7efa', 158824],
  ['team-gymnastics/team-12-three-gymnasts-with-medals.jpg', 'https://static.wixstatic.com/media/90a441_19a19311c2e84bf28b22c771d35bc70e~mv2.jpg', '44bda07c2e034d429c03eb69e8993582e44dc7a57f75ed9392a1a0f8fbae36e7', 249141],
  ['team-gymnastics/team-13-team-on-podium-2019-banner.jpg', 'https://static.wixstatic.com/media/90a441_5186f2ccdb034d97ad53c50ad3d98380~mv2.jpg', 'b3fa72f8c5077bd033061b4c251db8afb2ed4fc116b2e0c8130c9a1ad369bd2d', 100832],
  ['team-gymnastics/team-14-team-on-podium-blue-backdrop.jpg', 'https://static.wixstatic.com/media/90a441_644c5d2b962743baa1f0cfab3da08ae0~mv2.jpg', 'f29dd6b4f00fa25f0d035ab330828deb83ae0a2021edb47fe72612a293a63d39', 211141],
  ['team-gymnastics/team-15-two-gymnasts-purple-leotards.jpg', 'https://static.wixstatic.com/media/90a441_c8fb42c69ef54eb9a306ea3d6721b8a0~mv2.jpg', 'b76dce4311c8b5998c96e4dbc4db53f405975acdf9f3e59a226ffc33d5bf7022', 186080]
];

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
let ok = 0, failed = [];
for (const [file, url, hash, size] of ASSETS) {
  const out = join(ROOT, file);
  try { if (sha(await readFile(out)) === hash) { ok++; continue; } } catch {}
  let done = false;
  for (let attempt = 1; attempt <= 4 && !done; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (asset fetch)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (sha(buf) !== hash) throw new Error(`checksum mismatch (got ${buf.length} bytes, expected ${size})`);
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, buf);
      console.log(`ok   ${file}`);
      ok++; done = true;
    } catch (err) {
      if (attempt === 4) { console.error(`FAIL ${file}: ${err.message}`); failed.push(file); }
      else await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}
console.log(`\n${ok} of ${ASSETS.length} images ready in src/assets/images/`);
if (failed.length) { console.error('Missing:', failed.join(', ')); process.exit(1); }
