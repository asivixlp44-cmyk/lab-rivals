// QA helper: loads the page and prints what it logs (errors, warnings, the loading line) for a while, without waiting for the game to
// start: for a page that never gets past its loading screen. Run: node tests/probe.mjs [seconds]
import { startServer, startVite, stopAll, launch, sleep, TEST_PORT, VITE_PORT } from './lib.mjs';
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const page = await (await b.createBrowserContext()).newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[' + m.type() + ']', m.text().slice(0, 400)); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message, (e.stack || '').split('\n').slice(0, 4).join(' | ')));
await page.setViewport({ width: 1280, height: 720 });
await page.goto('http://localhost:' + VITE_PORT + '/', { waitUntil: 'domcontentloaded' });
const secs = +(process.argv[2] || 25);
for (let i = 0; i < secs; i += 5) {
    await sleep(5000);
    const st = await page.evaluate(() => ({ loading: (document.querySelector('#loading') || {}).textContent, start: !(document.querySelector('#start') || {}).hidden }));
    console.log(i + 5 + 's', JSON.stringify(st));
    if (!st.start) break;
}
await b.close(); stopAll();
process.exit(0);
