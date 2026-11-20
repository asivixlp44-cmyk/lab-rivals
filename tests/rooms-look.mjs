// QA helper: the lab indoors. Lab HQ from the spawn (north, south, east, west), then the first stages' rooms seen from just inside
// their doors and from their middles (STAGES=1,2,3,4,5 by default; W=0 the sector), on a desktop (SIZES=port: a portrait phone too).
// Run: node tests/rooms-look.mjs
import { startServer, startVite, stopAll, launch, open, shot, sleep, qa, TEST_PORT } from './lib.mjs';
import { wallZ, floorY, stageLen } from '../shared/world.js';
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const sizes = process.env.SIZES === 'port' ? [['port', 390, 844], ['desk', 1280, 720]] : [['desk', 1280, 720]];
const stages = (process.env.STAGES || '1,2,3,4,5').split(',').map((s) => +s - 1), w = +(process.env.W || 0), lobby = process.env.LOBBY !== '0';
try {
    for (const [name, vw, vh] of sizes) {
        const page = await open(b, 'http://localhost:5747/', { w: vw, h: vh, dpr: name === 'port' ? 2 : 1, touch: name === 'port', q: name === 'port' ? 'low' : 'high', uid: 'rooms' + name + Date.now() });
        await qa(page, () => { window.__qa.close(); window.__noFloat = true; });
        await sleep(1500);
        // (another sector: W=1..3)
        if (w) { await qa(page, (ww) => { const q = window.__qa; q.give({ openWorlds: true }); q.send('world', { w: ww }); }, w); await sleep(4500); await qa(page, () => window.__qa.close()); }
        if (lobby) for (const [tag, x, z, yaw] of [['n', 0, 100, 0], ['s', 0, 100, Math.PI], ['e', 0, 100, -Math.PI / 2], ['w', 0, 100, Math.PI / 2], ['mouth', 0, 62, 0], ['podium', -78, 104, Math.PI / 2]]) {
            await qa(page, (a) => { const q = window.__qa; q.close(); q.teleport(a.x, 0, a.z, 0); q.look(a.yaw, 0.16, 20); }, { x, z, yaw });
            await sleep(900);
            console.log(await shot(page, 'room-' + name + (w ? '-w' + w : '') + '-lobby-' + tag));
        }
        for (const k of stages) {
            for (const [tag, back, x] of [['door', -9, 0], ['in', 14, 0], ['mid', stageLen(k) * 0.5, 6]]) {
                const z = wallZ(k) - back;
                await qa(page, (a) => { const q = window.__qa; q.close(); if (q.god) q.god(true); q.teleport(a.x, a.y, a.z, 0); q.look(0, 0.2, 20); }, { x, y: floorY(w, z) + 0.2, z });
                await sleep(1100);
                console.log(await shot(page, 'room-' + name + (w ? '-w' + w : '') + '-s' + (k + 1) + '-' + tag));
            }
        }
        console.log('errors', page.errors);
        await page.close();
    }
} catch (e) { console.error(e); }
await b.close(); stopAll();
process.exit(0);
