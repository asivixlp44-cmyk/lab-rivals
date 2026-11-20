// QA helper: the autopilot through one stage at its Recommended Level, its position printed five times a second and every death with
// its cause (the death card's words), to see where and why a stage goes wrong. Run: node tests/stage-trace.mjs <stage 1..20> [world]
// (SECS=n: how long, default 25; SHOT=1: a screenshot at every death)
import { startServer, startVite, stopAll, launch, open, shot, sleep, TEST_PORT } from './lib.mjs';
import { QUESTS, recLevel } from '../shared/config.js';
import { stagePlan, wallZ } from '../shared/world.js';
const k = +(process.argv[2] || 1) - 1, w = +(process.argv[3] || 0), SECS = +(process.env.SECS || 25);
const plan = stagePlan(w, k);
console.log('stage', k + 1, plan.type, 'from z', wallZ(k), 'to', wallZ(k + 1), JSON.stringify(plan.list.map((o) => ({ kind: o.kind, z: Math.round(o.z ?? (o.z0 + o.z1) / 2), z0: o.z0 && Math.round(o.z0), z1: o.z1 && Math.round(o.z1) }))));
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const page = await open(b, 'http://localhost:5747/', { w: 960, h: 540, q: 'low', uid: 'trace' + Date.now() });
const ev = (fn, ...a) => page.evaluate(fn, ...a);
await sleep(800);
await ev((qn) => { const q = window.__qa; q.close(); q.noWatch(true); q.give({ openWorlds: true, qi: qn }); }, QUESTS.length);
if (w) { await ev((ww) => window.__qa.send('world', { w: ww }), w); await sleep(3500); }
const lv = recLevel(w, k), set = { lv, rebirths: Math.max(0, Math.ceil((lv + 8 - 10) / 5)), best: k, gems: 1e5, reviveAt: 0, ups: { feet: 0, reach: 0, spring: 0 } };
await ev((s) => { const q = window.__qa; q.auto(false); q.close(); q.give(s); }, set);
await sleep(500);
await ev((kk) => { const q = window.__qa, cp = q.checkpoint(kk); q.teleport(cp.x, 0, cp.z, Math.PI); q.look(0, 0.2, 22); }, k);
await sleep(700);
await ev(() => { window.__jl = []; window.__qa.auto(true); });
let deaths = 0;
const t0 = Date.now();
while (Date.now() - t0 < SECS * 1000) {
    await sleep(200);
    const s = await ev(() => { const q = window.__qa, s = q.state(); return { x: s.x, y: s.y, z: s.z, g: s.onGround, dead: !!s.dead, deaths: s.deaths, stage: s.stage, v: s.v, why: (document.querySelector('#dcWhy') || {}).textContent, pop: !!document.querySelector('#confirm:not([hidden])'), prompt: s.prompt }; });
    console.log(((Date.now() - t0) / 1000).toFixed(1), 'x', s.x, 'y', s.y, 'z', s.z, s.g ? 'ground' : 'air', 'v', s.v, s.dead ? 'DEAD: ' + s.why : '', s.pop ? 'CONFIRM OPEN' : '', s.prompt ? 'prompt: ' + s.prompt : '');
    if (s.deaths > deaths) { deaths = s.deaths; if (process.env.SHOT) console.log(await shot(page, 'trace-' + (k + 1) + '-' + deaths)); await ev((st) => window.__qa.give({ lv: st.lv, reviveAt: 0 }), set); }
    if (!s.dead && s.stage > k) { console.log('THROUGH'); break; }
}
console.log('jumps', JSON.stringify(await ev(() => window.__jl)));
console.log('errors', page.errors);
await b.close(); stopAll();
process.exit(0);
