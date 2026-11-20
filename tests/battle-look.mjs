// The Team Battle on screen: the bar at the top and the round's results card, on a desktop and a phone held upright. The round is made
// short with QA so the results come up. Run: node tests/battle-look.mjs
import { startServer, startVite, stopAll, launch, open, shot, sleep, TEST_PORT } from './lib.mjs';
await startServer(TEST_PORT, { QA: '1' });
await startVite();
const b = await launch();
const SIZES = [{ name: 'desk', w: 1280, h: 720 }, { name: 'port', w: 390, h: 844, dpr: 2, touch: true }, { name: 'land', w: 844, h: 390, dpr: 2, touch: true }];
for (const S of SIZES) {
    const page = await open(b, 'http://localhost:5747/', { w: S.w, h: S.h, dpr: S.dpr || 1, touch: !!S.touch, q: 'low', uid: 'bl' + S.name + Date.now() });
    const ev = (fn, ...a) => page.evaluate(fn, ...a);
    await sleep(2500);
    await shot(page, 'battle-' + S.name + '-join');
    // points for both labs, a door passed by you (the bar and your points), then the round's end
    await ev(() => { const q = window.__qa; q.close(); q.give({ red: 182, blue: 240 }); });
    await sleep(1500);
    await shot(page, 'battle-' + S.name + '-bar');
    await ev(() => window.__qa.give({ battleIn: 0.5 }));
    await sleep(2200);
    await shot(page, 'battle-' + S.name + '-end');
    console.log(S.name, 'errors', page.errors);
    await page.close();
}
await b.close(); stopAll();
process.exit(0);
