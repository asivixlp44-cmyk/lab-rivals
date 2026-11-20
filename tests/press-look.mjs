// The spike presses: screenshots of a Spike Press stage (world argv[2], default 0) looking up it from just inside its door, a few
// moments apart (presses up, coming down, slammed), then the autopilot running it. Run: node tests/press-look.mjs [world]
import { startServer, startVite, stopAll, launch, open, shot, sleep, TEST_PORT } from './lib.mjs';
const world = +(process.argv[2] || 0);
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const page = await open(b, 'http://localhost:5747/', { w: 1280, h: 720, q: 'medium', uid: 'press' + Date.now() });
const ev = (fn, ...a) => page.evaluate(fn, ...a);
await sleep(800);
await ev((w) => { const q = window.__qa; q.close(); q.give({ speed: 1e9, lv: 30, openWorlds: true, wins: 1e6 }); if (w) q.send('world', { w }); }, world);
await sleep(world ? 4000 : 1500);
let k = -1;
for (let i = 0; i < 15; i++) if (await ev((kk) => window.__qa.stageType(kk), i) === 'crusher') { k = i; break; }
console.log('press stage', k + 1);
await ev((kk) => { const q = window.__qa; q.close(); q.auto(false); const z = q.checkpoint(kk).z; q.teleport(0, 0, z - 2, Math.PI); q.look(0, 0.18, 22); }, k);
for (let i = 0; i < 4; i++) { await sleep(450); await shot(page, `press-w${world}-${i}`); }
await ev(() => window.__qa.auto(true));
for (let i = 0; i < 6; i++) { await sleep(1200); await ev(() => window.__qa.close()); await shot(page, `press-w${world}-run${i}`); console.log(JSON.stringify(await ev(() => { const s = window.__qa.state(); return { z: Math.round(s.z), stage: s.stage, dead: s.dead }; }))); }
console.log('errors', page.errors);
await b.close(); stopAll();
process.exit(0);
