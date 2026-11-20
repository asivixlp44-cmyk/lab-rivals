// QA helper: what the real Boxity SDK script left on a standalone local page (its global, the script's load, any error it threw).
// Run: node tests/sdk-probe.mjs
import { startServer, startVite, stopAll, launch, open, sleep, TEST_PORT } from './lib.mjs';
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const page = await open(b, 'http://localhost:5747/', { w: 1280, h: 720, q: 'low', uid: 'sdkp' + Date.now() });
page.on('console', (m) => { if (/legion|sdk|bloxity|boxity/i.test(m.text())) console.log('[console]', m.type(), m.text().slice(0, 300)); });
await sleep(3000);
console.log(JSON.stringify(await page.evaluate(() => ({
    typeofLegion: typeof window.Legion,
    legionKeys: window.Legion ? Object.keys(window.Legion) : null,
    sdkKeys: window.Legion && window.Legion.SDK ? Object.keys(window.Legion.SDK).slice(0, 40) : null,
    globals: Object.keys(window).filter((k) => /legion|bloxity|boxity|sdk/i.test(k)),
    script: [...document.scripts].map((s) => s.src).filter(Boolean),
    loaded: performance.getEntriesByType('resource').filter((e) => /sdk\.bloxity/.test(e.name)).map((e) => ({ name: e.name, size: e.transferSize, dur: Math.round(e.duration), status: e.responseStatus })),
    env: window.BLOXITY_ENV || null,
})), null, 1));
await b.close(); stopAll();
process.exit(0);
