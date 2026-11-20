// Every floating sign in a sector against every other: two signs that stand closer together than their own sizes are over each other
// from wherever you look (a sign always faces the camera), and a sign whose top is over the ceiling is in it. Prints each pair and
// each sign in the ceiling; exits 1 when there are any. Run: node tests/signs-check.mjs [world]   (ALL=1: prints every sign too)
import { startServer, startVite, stopAll, launch, open, sleep, qa, TEST_PORT } from './lib.mjs';
import { ROOM, W, floorY } from '../shared/world.js';
const w = +(process.argv[2] || 0);
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
let bad = 0;
try {
    const page = await open(b, 'http://localhost:5747/', { w: 1280, h: 720, q: 'high', uid: 'signs' + Date.now() });
    await sleep(1200);
    if (w) { await qa(page, (ww) => { const q = window.__qa; q.give({ openWorlds: true }); q.send('world', { w: ww }); }, w); await sleep(4000); }
    const list = (await qa(page, () => window.__qa.signs())).filter((s) => s.on && s.w > 0);
    console.log(list.length + ' signs');
    if (process.env.ALL) for (const s of list) console.log('  ' + [s.x, s.y, s.z].join(', ').padEnd(24) + (s.w + ' x ' + s.h).padEnd(14) + s.t.slice(0, 70));
    // (a bobbing sign rides up and down a little: that much taller)
    const hh = (s) => s.h / 2 + (s.bob ? 0.5 : 0);
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i], c = list[j], d = Math.hypot(a.x - c.x, a.z - c.z), dy = Math.abs(a.y - c.y);
        // closer side to side than half their widths together, and overlapping in height: over each other from every side
        if (d < (a.w + c.w) / 2 * 0.8 && dy < hh(a) + hh(c) - 0.15) { bad++; console.log('OVER  "' + a.t.slice(0, 44) + '" (' + [a.x, a.y, a.z] + ', ' + a.w + 'x' + a.h + ')  x  "' + c.t.slice(0, 44) + '" (' + [c.x, c.y, c.z] + ', ' + c.w + 'x' + c.h + ')  apart ' + d.toFixed(1) + ' / ' + dy.toFixed(1)); }
    }
    // in the ceiling: Lab HQ's hall, a stage's room (its floor climbs)
    for (const s of list) {
        const hall = s.z > W.plaza.z0 - 2, top = s.y + hh(s), ceil = hall ? ROOM.lobbyH : floorY(w, s.z) + ROOM.h;
        if (top > ceil - 0.3) { bad++; console.log('CEILING  "' + s.t.slice(0, 50) + '" top ' + top.toFixed(1) + ' over ' + ceil.toFixed(1) + ' at ' + [s.x, s.y, s.z]); }
    }
    console.log('errors', page.errors);
} catch (e) { console.error(e); bad++; }
console.log(bad ? bad + ' problems' : 'all clear');
await b.close(); stopAll();
process.exit(bad ? 1 : 0);
