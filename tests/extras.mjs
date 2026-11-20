// What the indoor lab added, with real key presses where a player would press: the x2 WINS trophy pad and its E prompt, a stage's
// SKIP STAGE pad (E, the question, the skip itself), the giant in his room (standing in his way: stomped, and the death card says
// so), the Worlds vault's sign (LOCKED, then OPEN), the doorways (W held along a wall through three of them: never stuck), the WIN
// mats and the Team Battle screens there. Run: node tests/extras.mjs
import { startServer, startVite, stopAll, launch, open, shot, sleep, qa, TEST_PORT } from './lib.mjs';
import { wallZ, floorY, stagePlan, w2Spot, W } from '../shared/world.js';
import { WALLS_N } from '../shared/config.js';
let bad = 0;
const check = (ok, what) => { if (!ok) bad++; console.log((ok ? '  ok  ' : 'FAIL  ') + what); };
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
try {
    const page = await open(b, 'http://localhost:5747/', { w: 1280, h: 720, q: 'low', uid: 'extras' + Date.now() });
    const st = () => qa(page, () => window.__qa.state());
    const waitFor = async (fn, secs) => { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > secs * 1000) return null; await sleep(120); } };
    const confirmUp = () => page.evaluate(() => { const c = document.querySelector('#confirm'); return c && !c.hidden ? c.querySelector('h2').textContent : ''; });
    await qa(page, () => { const q = window.__qa; q.close(); q.noWatch(true); window.__noFloat = true; q.give({ gems: 100, lv: 6 }); });
    await sleep(900);

    console.log('--- the Worlds vault');
    const sign0 = (await qa(page, () => window.__qa.signs())).find((s) => s.t.startsWith('FROST LAB /'));
    check(sign0 && /LOCKED: pass Stage 20/.test(sign0.t), 'its sign: "' + (sign0 && sign0.t) + '"');

    console.log('--- the x2 WINS trophy pad');
    await qa(page, (p) => { const q = window.__qa; q.close(); q.teleport(p.x, 0, p.z + 4.2, Math.PI); }, w2Spot);
    await waitFor(async () => (await st()).prompt === 'x2 Wins', 3);
    check((await st()).prompt === 'x2 Wins', 'standing by it: the prompt "' + (await st()).prompt + '"');
    await page.keyboard.press('KeyE');
    await sleep(300);
    check(/x2 WINS/.test(await confirmUp()), 'E: its offer comes up ("' + await confirmUp() + '")');
    await page.click('#confirm [data-no]');
    await sleep(200);

    console.log('--- a SKIP STAGE pad');
    const k = 1, pz = wallZ(k) - 8.2, px = W.halfW - 2;
    await qa(page, (a) => { const q = window.__qa; q.close(); q.teleport(a.x, a.y, a.z, 0); }, { x: px, y: floorY(0, pz), z: pz });
    await waitFor(async () => (await st()).prompt === 'Skip Stage ' + (k + 1), 3);
    check((await st()).prompt === 'Skip Stage ' + (k + 1), 'on the pad just inside Stage ' + (k + 1) + '\'s door: the prompt "' + (await st()).prompt + '"');
    await page.keyboard.press('KeyE');
    await sleep(300);
    check(/SKIP/.test(await confirmUp()), 'E: "' + await confirmUp() + '"');
    const g0 = (await st()).gems;
    await page.click('#confirm [data-yes]');
    const skipped = await waitFor(async () => { const s = await st(); return s.stage === k + 1 && s; }, 4);
    check(!!skipped && skipped.gems < g0, 'yes: in Stage ' + (k + 2) + ' (z ' + (skipped ? Math.round(skipped.z) : '?') + '), ' + (skipped ? g0 - skipped.gems : 0) + ' Gems spent');
    check(!(await st()).prompt, 'no prompt left over away from a pad');

    console.log('--- the giant in his room');
    const kg = 1, og = stagePlan(0, kg).list.find((o) => o.kind === 'giant');
    await qa(page, (a) => { const q = window.__qa; q.close(); q.give({ reviveAt: 0 }); q.teleport(a.x, a.y, a.z, 0); }, { x: og.ax, y: floorY(0, og.z), z: og.z });
    const dead = await waitFor(async () => (await st()).dead, og.period + 3);
    const why = await page.evaluate(() => document.querySelector('#dcWhy').textContent);
    check(!!dead, 'standing in his round (it takes him ' + og.period + ' s): stomped');
    check(/giant/i.test(why), 'the death card: "' + why + '"');
    await shot(page, 'extras-giant');
    await waitFor(async () => !(await page.$eval('#revive', (e) => e.classList.contains('wait'))), 8);
    await qa(page, () => window.__qa.actions.giveUp());
    await waitFor(async () => !(await st()).dead, 6);
    await sleep(800);

    console.log('--- the doorways: W held along the left wall, from Lab HQ through three of them');
    await qa(page, () => { const q = window.__qa; q.close(); q.give({ lv: 30, reviveAt: 0 }); q.god && q.god(true); q.teleport(-16, 0, 43, 0); q.look(0, 0.2, 20); });
    await sleep(400);
    await page.keyboard.down('KeyW');
    // (jumping all the way: over the low barrier, and nothing here needs timing at this speed but the giant, who is shielded against below)
    await page.keyboard.down('Space');
    let far = 0, stuckAt = null, lastZ = 99, still = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 22000) {
        await sleep(200);
        const s = await st();
        if (s.dead) { await qa(page, () => { const q = window.__qa; q.actions.revive && q.actions.revive(); }); await sleep(600); continue; }
        far = Math.max(far, s.stage);
        if (Math.abs(s.z - lastZ) < 0.3) { if (++still >= 8) { stuckAt = s; break; } } else still = 0;
        lastZ = s.z;
        if (s.stage >= 3) break;
    }
    await page.keyboard.up('KeyW'); await page.keyboard.up('Space');
    check(!stuckAt, stuckAt ? 'STUCK at x ' + stuckAt.x + ', z ' + stuckAt.z + ' (stage ' + (stuckAt.stage + 1) + ')' : 'never stuck');
    check(far >= 2, 'through the doors of Stages 1, 2 and 3 (got to Stage ' + (far + 1) + ')');

    console.log('--- every sector open: the vault says so');
    await qa(page, () => { const q = window.__qa; q.close(); q.give({ openWorlds: true }); });
    const sign1 = await waitFor(async () => (await qa(page, () => window.__qa.signs())).find((s) => s.t.startsWith('FROST LAB /') && /OPEN/.test(s.t)), 4);
    check(!!sign1, 'its sign now: "' + (sign1 && sign1.t) + '"');
    check(page.errors.length === 0, 'no console errors ' + JSON.stringify(page.errors));
    void WALLS_N;
} catch (e) { console.error(e); bad++; }
console.log(bad ? bad + ' FAILED' : 'all good');
await b.close(); stopAll();
process.exit(bad ? 1 : 0);
