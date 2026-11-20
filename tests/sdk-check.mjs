// The real Boxity SDK (loaded from sdk.bloxity.io by the page's script tag) on a standalone local page: init ran with the slug,
// onUserChanged fired (a guest here: nobody is signed in), environment() returns what the page was told (the dev server tells it
// 'local'), and the game connected to its own local server (no Boxity matchmaker locally, no socket to <id>.host.bloxity.io).
// Run: node tests/sdk-check.mjs
import { startServer, startVite, stopAll, launch, open, sleep, TEST_PORT } from './lib.mjs';
let bad = 0;
const check = (ok, what) => { if (!ok) bad++; console.log((ok ? '  ok  ' : 'FAIL  ') + what); };
await startServer(TEST_PORT, { QA: '1', NO_BOTS: '1' });
await startVite();
const b = await launch();
const ws = [];
try {
    const page = await open(b, 'http://localhost:5747/', { w: 1280, h: 720, q: 'low', uid: 'sdk' + Date.now(), init: `window.__ws = []; const W0 = window.WebSocket; window.WebSocket = class extends W0 { constructor(u, p) { super(u, p); window.__ws.push(String(u)); } };` });
    await sleep(2500);
    const r = await page.evaluate(async () => {
        const S = window.Legion && window.Legion.SDK;
        let user = 'unset';
        // (its first call comes as soon as it knows: a moment after subscribing)
        let off = null;
        if (S && S.auth && S.auth.onUserChanged) off = S.auth.onUserChanged((u) => { user = u ? (u.username || 'user') : null; });
        for (let i = 0; i < 40 && user === 'unset'; i++) await new Promise((res) => setTimeout(res, 50));
        if (typeof off === 'function') off();
        return { sdk: !!S, env: S && S.environment ? S.environment() : null, user, loggedIn: S && S.auth && S.auth.isLoggedIn ? S.auth.isLoggedIn() : null, ws: window.__ws.slice() };
    });
    check(r.sdk, 'the real SDK loaded (window.Legion.SDK)');
    check(r.env && r.env.env === 'local' && r.env.apiUrl === 'http://localhost:4000' && r.env.playUrl === 'http://localhost:2567', 'environment() returns what the page was told: ' + JSON.stringify(r.env));
    check(r.user !== 'unset', 'onUserChanged fires straight away with the current state (' + (r.user === null ? 'nobody signed in: a guest' : r.user) + ')');
    check(r.ws.length > 0 && r.ws.every((u) => !/host\.bloxity\.io/.test(u)), 'the game socket goes to its own server, never to <id>.host.bloxity.io: ' + r.ws.join(', '));
    check(page.errors.length === 0, 'no console errors ' + JSON.stringify(page.errors));
    ws.push(...r.ws);
} catch (e) { console.error(e); bad++; }
console.log(bad ? bad + ' FAILED' : 'all good');
await b.close(); stopAll();
process.exit(bad ? 1 : 0);
