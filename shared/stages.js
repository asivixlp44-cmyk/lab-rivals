// The stages' own challenges: every stage of the Test Track is a kind of its own, with its own way through, so no two stages in a row
// play alike. Everything in them ends your run: touch a laser, a steel ball, a spike press or the slime and you're knocked out. A
// sector runs through the kinds in its own order, harder the further in; gaps are sized for the stage's Recommended Level (stageV: too
// slow and you fall short). shared/world.js builds each stage from its kind and its seed; the client draws it and judges it on your
// screen; the server knows its platforms.
//   field      Open Keys: open keys, chemical tanks to weave round, a low barrier to hop, boost chevrons; later, slime pits to jump
//   moat       Slime Pools: slime across the way with key bridges over it; further in, a spike press and a pool with one stepping key
//   sweeper    Laser Sweeper: a laser bar turning round its emitter, right across the way: jump it as it comes
//   giant      Giant's Room: Dr. Mutagen (twice your height, and then some) walks round and round his room: slip past behind him
//   crusher    Spike Press: spiked steel presses across the way slam down to the floor and lift again: run under while they're up
//   bridge     Catwalk: one narrow winding walkway of keys over the slime (later with gaps, and a laser between two of them)
//   stones     Stepping Keys: the floor is slime; hop from one giant key on its pillar to the next (gaps sized to the stage's pace)
//   crumble    Glitch Keys: a bridge of keys over the slime; each one glitches out a moment after you step on it
//   bounce     Jump Pads: slime too wide to jump; jump pads launch you across
//   gauntlet   The Big Experiment (the last stage): stepping keys, a laser, the catwalk, spike presses
//   boulders   Steel Ball Hill: the stage is a hill; giant steel balls roll down its lanes at you: switch lanes to dodge
//   chase      Mutagen Chase: Dr. Mutagen bursts out of his vent behind the door and comes after you; low barriers, tanks and slime pits
//              slow you down
//   blink      Flicker Keys: a path of keys over the slime; a wave of flickering keys rolls down it at you: jump over it
//   gumballs   Falling Flasks: giant flasks dropping from the ceiling where their shadows grow
// (sliders, walls, ice, axes, maze, boss: kinds in no world's order; kept so nothing that names them breaks)
import { rngFrom } from './config.js';

export const STAGE_TYPES = {
    field: { title: 'Open Keys', tip: 'Clack across the keys! Hop the barriers and jump the slime.' },
    moat: { title: 'Slime Pools', tip: 'Cross on the key bridges: step in the slime and you are out!' },
    sweeper: { title: 'Laser Sweeper', tip: "Jump the spinning laser as it comes round: touch it and you're out!" },
    giant: { title: "Giant's Room", tip: 'Dr. Mutagen is walking round his room! Slip past behind him: touch him and you are out.' },
    crusher: { title: 'Spike Press', tip: 'Spike presses slam down! Wait for one to lift, then run under it.' },
    sliders: { title: 'Blast Doors', tip: 'Sliding blast doors! Time it and slip past.' },
    bridge: { title: 'Catwalk', tip: 'One narrow catwalk over the slime: stay on it!' },
    stones: { title: 'Stepping Keys', tip: 'Hop from key to key: too slow and you fall short!' },
    crumble: { title: 'Glitch Keys', tip: "The keys glitch out behind you: don't stop!" },
    bounce: { title: 'Jump Pads', tip: 'Land on the jump pads: they launch you across!' },
    gauntlet: { title: 'The Big Experiment', tip: 'Stepping keys, a laser, the catwalk, spike presses: everything at once!' },
    boulders: { title: 'Steel Ball Hill', tip: 'Climb the hill! Giant steel balls roll down at you: switch lanes to dodge them!' },
    chase: { title: 'Mutagen Chase', tip: "Dr. Mutagen is loose and he's after you! RUN and don't stop!" },
    blink: { title: 'Flicker Keys', tip: "A wave of flickering keys rolls at you: jump over it, don't stand still!" },
    gumballs: { title: 'Falling Flasks', tip: 'Giant flasks drop from the ceiling! Stay off the growing shadows.' },
    walls: { title: 'Foam Walls', tip: 'Walls of foam! DASH into them to smash through.' },
    ice: { title: 'Slippery Floor', tip: 'Freshly mopped! You slide where you were going.' },
    axes: { title: 'Swinging Hammers', tip: 'Swinging hammers: run through when they swing away.' },
    maze: { title: 'Vent Maze', tip: 'Find the open door in every wall.' },
    boss: { title: 'Final Run', tip: 'Everything at once: RUN!' },
};
// each world's twenty. The Green Lab opens the way the lab does: the key room, the giant's room, the spike presses, the steel ball
// ramp, the slime pit; then lasers, the chase, flasks, flicker keys and the rest (the last, everything). Each world its own order;
// every Steel Ball stage is a climb (shared/world.js floorY)
const ORDER = [
    ['field', 'giant', 'crusher', 'boulders', 'stones', 'sweeper', 'chase', 'gumballs', 'moat', 'blink', 'giant', 'boulders', 'bridge', 'crusher', 'bounce', 'chase', 'crumble', 'giant', 'stones', 'gauntlet'],
    ['field', 'crusher', 'giant', 'moat', 'boulders', 'stones', 'sweeper', 'chase', 'gumballs', 'blink', 'boulders', 'giant', 'crusher', 'bridge', 'chase', 'crumble', 'bounce', 'giant', 'sweeper', 'gauntlet'],
    ['field', 'giant', 'moat', 'crusher', 'boulders', 'chase', 'stones', 'blink', 'sweeper', 'gumballs', 'giant', 'boulders', 'chase', 'bridge', 'crusher', 'bounce', 'crumble', 'giant', 'blink', 'gauntlet'],
    ['field', 'chase', 'giant', 'boulders', 'crusher', 'crumble', 'blink', 'sweeper', 'stones', 'gumballs', 'boulders', 'giant', 'chase', 'crusher', 'bridge', 'bounce', 'blink', 'giant', 'sweeper', 'gauntlet'],
];
export const stageType = (w, k) => (ORDER[(w | 0) % ORDER.length][k] || 'field');

// ----- the moving things' sizes and where they are at server time t (seconds) -----
// a laser sweep: its beam's half length, how high its middle is, how thick; post: its pylon's radius
export const SWEEP = { r: 15.4, y: 1.2, t: 1.0, post: 1.6 };
// a laser sweep's angle at t (radians)
export const sweeperAngle = (o, t) => o.phase + (o.dir * Math.PI * 2 * (t % o.period)) / o.period;
// a spike press: how deep it is along the way (d), its spikes' length, its slab's thickness, how high its spike points hang when it's up
// (clear of the highest jump), how long it takes to slam down, how long it stays down, how long it takes to lift; warn: how long it shakes
// before it drops
export const CRUSH = { d: 7, spike: 1.8, slab: 3, up: 15.5, drop: 0.24, hold: 0.42, rise: 0.95, warn: 0.42 };
// where a press is in its cycle at t: u (seconds into it) and wait (how long it hangs up, from the cycle's start)
const crushU = (o, t) => { const P = o.period; return { u: (((t + o.phase) % P) + P) % P, wait: P - CRUSH.drop - CRUSH.hold - CRUSH.rise }; };
// how high its spike points are over the floor at server time t (0: slammed down)
export function crusherY(o, t) {
    const { u, wait } = crushU(o, t);
    if (u < wait) return CRUSH.up;
    let v = u - wait;
    if (v < CRUSH.drop) { const f = v / CRUSH.drop; return CRUSH.up * (1 - f * f); }
    v -= CRUSH.drop;
    if (v < CRUSH.hold) return 0;
    const f = Math.min(1, (v - CRUSH.hold) / CRUSH.rise);
    return CRUSH.up * f * f * (3 - 2 * f);
}
// about to drop: shaking (0..1, how close)
export function crusherWarn(o, t) { const { u, wait } = crushU(o, t); return u < wait && u > wait - CRUSH.warn ? (u - (wait - CRUSH.warn)) / CRUSH.warn : 0; }
// does it get you: inside its band (a little slack for your body), its points lower than the top of your head (feet y studs over its
// floor, about 5.6 studs tall)
export const crusherHits = (o, x, z, y, t) => Math.abs(z - o.z) < CRUSH.d / 2 + 0.5 && crusherY(o, t) < y + 5.6;
// a giant on his round: Dr. Mutagen walking round and round his room, an oval ax across and az along round (0, o.z), once every
// o.period seconds (o.dir: which way round). r: how close to his middle he has you (his boots and his coat); tall: too tall to jump;
// s: how many times the chaser's size he's drawn
export const GIANT = { r: 4.8, tall: 15, s: 2 };
// where he is at server time t: { x, z, ry (his facing, the monster's own: 0 north) }
export function giantAt(o, t, out) {
    const a = o.phase + o.dir * 6.283185307 * (((t % o.period) + o.period) % o.period) / o.period, q = out || {};
    q.x = Math.sin(a) * o.ax; q.z = o.z + Math.cos(a) * o.az;
    q.ry = Math.atan2(-Math.cos(a) * o.ax * o.dir, Math.sin(a) * o.az * o.dir);
    return q;
}
const gq = { x: 0, z: 0, ry: 0 };
// does he have you (feet y studs over the floor)?
export function giantHits(o, x, z, y, t) { if (y > GIANT.tall || Math.abs(z - o.z) > o.az + GIANT.r + 0.5) return false; giantAt(o, t, gq); return (x - gq.x) ** 2 + (z - gq.z) ** 2 < GIANT.r * GIANT.r; }
// would he get someone running straight on up the stage from (x, z) at v studs/s, setting off now (t)? (all the way through his
// round, a little slack)
export function giantBlocks(o, x, z, v, t) {
    const far = o.z - o.az - GIANT.r - 1, T = (z - far) / Math.max(1, v), R2 = (GIANT.r + 1.4) ** 2;
    for (let u = 0; u <= T; u += 0.05) { giantAt(o, t + u, gq); if ((x - gq.x) ** 2 + (z - v * u - gq.z) ** 2 < R2) return true; }
    return false;
}
// a rolling cannonball: its radius; the z of lane i's ball at t (it rolls from the stage's far end towards its gate, again and again)
export const BALL = { r: 5.4 };
export function ballZ(o, i, t) { const L = o.z1 - o.z0 + 24, s = ((t * o.v + o.ph[i]) % L + L) % L; return o.z0 - 12 + s; }
// a falling boulder: its radius, how long its shadow grows before it lands, how long it falls, how far from where it lands it hits
export const GUM = { r: 2.5, warn: 1.15, fall: 0.42, hit: 3.6 };
// the gumballs of a drop zone falling or just landed at t: [{ x, z, t0 (when its shadow appeared), c (colour index) }]
const gumHash = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 2654435761) ^ Math.imul(b + 0x7f4a7c15, 2246822519); h ^= h >>> 15; h = Math.imul(h, 2654435769); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
export function gumballsAt(o, t, out) {
    out = out || [];
    out.length = 0;
    const life = GUM.warn + GUM.fall + 0.7, s1 = Math.floor(t / o.dt), s0 = Math.floor((t - life) / o.dt);
    for (let s = s0; s <= s1; s++) {
        const t0 = s * o.dt;
        if (t0 > t || t - t0 > life) continue;
        const u = gumHash(o.seed, s), v = gumHash(o.seed + 17, s);
        out.push({ x: o.x0 + u * (o.x1 - o.x0), z: o.z0 + v * (o.z1 - o.z0), t0, c: s & 7, s });
    }
    return out;
}
// Dr. Mutagen: how long after you come through the door it bursts out, how close behind you it has to get to have you, its
// length (for the art). chaserDist: how far up the stage (from the door) its jaws are t seconds after you came through
// gap: how close behind you it keeps while you run (its jaws, studs); press: how fast it closes in while you're stalling (studs/s);
// sprint: how much faster than the stage's pace it runs to catch up when it's fallen back
export const CHASER = { delay: 0.7, reach: 5.5, len: 20, gap: 8.5, press: 6, sprint: 1.75, keep: 1.35 };
export function chaserDist(o, t) {
    const u = Math.max(0, t - CHASER.delay), tu = Math.min(u, (o.v1 - o.v0) / o.acc);
    // speeding up from v0 to v1 (acc a second), then steady
    return o.v0 * tu + 0.5 * o.acc * tu * tu + o.v1 * Math.max(0, u - tu) - CHASER.len * 0.4;
}
// the vanishing keys: a row (its index) is there at server time t unless the wave is going through it: on for o.on of every
// o.period seconds, each row o.dt later than the one after it (so the gap runs down the path towards you)
export const BLINK = { s: 4, warn: 0.32 };
export const blinkPhase = (o, row, t) => { const u = (t + row * o.dt) % o.period; return u < 0 ? u + o.period : u; };
export const blinkOn = (o, row, t) => blinkPhase(o, row, t) < o.on;
// (about to go: shaking, fading)
export const blinkWarn = (o, row, t) => { const u = blinkPhase(o, row, t); return u < o.on && u > o.on - BLINK.warn; };
// a keycap wall: its thickness and height (too high to jump: DASH through)
export const JWALL = { d: 2.6, h: 11 };
// a spring spacebar: its size, its top, how hard it throws you up
export const TRAMP = { w: 7, top: 1.2, bounce: 54 };
// a crumbling key tile: its size; how long it shakes before it drops, how long until it's back
export const TILE = { s: 4, shake: 0.42, back: 4.5 };

// ----- building a stage of a kind: what's in the way, the rift lakes, the platforms (golden keys: none any more) -----
// g: { w, k, a (the zone's south end: the gate you came in by), b (its north end: the stage's end gate), v (the stage's pace: the
// top walk speed at its Recommended Level), hw (half its width), r (its random numbers), d (0..1: how far into the world) };
// returns { list, lakes, plats, candies (always empty), icy }
export function buildStage(type, g) {
    const out = { list: [], lakes: [], plats: [], candies: [], icy: [] };
    const B = BUILD[type] || BUILD.field;
    B(g, out, g.a, g.b);
    return out;
}
// a jump at this pace, from the ground: how far it carries (a full jump is in the air about 0.79 s)
export const jumpDist = (v) => v * 0.79;
// the gap (edge to edge) between two floating keys at a stage's pace, the speed gate of the Test Track: at the Recommended Level a
// jump from a few studs short of the edge makes it; at four fifths of its walk speed only a jump from the very edge does (the
// body's width and a moment's coyote time count for you); slower than that, without a well-timed DASH, you fall short
// a gap to jump: about 0.68 s of running at the stage's pace (a walking jump at the Recommended Level clears it with ~10% to spare)
export const islandGap = (v) => Math.max(7, Math.min(64, v * 0.68));
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
// a lake right across the way between z0 and z1 (the rift: falling in is the end of this life)
const lake = (out, g, z0, z1) => { const o = { x0: -g.hw - 1, x1: g.hw + 1, z0, z1 }; out.lakes.push(o); return o; };
// a rift right across the way to jump (a pool): as deep as a gap between islands, times k
const jumpPit = (out, g, zc, k) => { const dd = islandGap(g.v) * (k || 1); out.list.push({ kind: 'pool', z0: zc - dd / 2, z1: zc + dd / 2, x0: -g.hw - 1, x1: g.hw + 1 }); return dd; };
// a walkway of keycaps (stone platforms, each tile long, edge to edge) from z1 down to z0, its middle following path(z) -> x
function walkway(out, z0, z1, w, top, path) {
    const n = Math.max(1, Math.round((z1 - z0) / 4)), sz = (z1 - z0) / n;
    for (let i = 0; i < n; i++) { const z = z1 - sz * (i + 0.5); out.plats.push({ kind: 'stone', x: +path(z).toFixed(2), z: +z.toFixed(2), sx: w, sz: +(sz + 0.02).toFixed(2), top }); }
}

const BUILD = {
    // a field of keys: pillars to weave round, a low wall to hop, boosts; after the first stage, rifts (sized to the pace) as well
    field(g, out, a, b) {
        const { r, v, k, hw, d } = g, L = a - b;
        const pillars = (z, m) => { const pz = []; for (let j = 0; j < m; j++) pz.push({ x: +(-hw + 4 + ((j + 0.5) / m) * (hw * 2 - 8) + (r() - 0.5) * 3).toFixed(2), z: +(z + (r() - 0.5) * 6).toFixed(2), s: 3.4 }); out.list.push({ kind: 'pillars', z, list: pz }); };
        const boost = (z) => out.list.push({ kind: 'boost', z, x: +((r() - 0.5) * (hw * 2 - 12)).toFixed(2), hw: 5, hd: 4 });
        if (k === 0) {
            // the very first: nothing that can end you. Run, weave, hop
            boost(a - L * 0.18); pillars(a - L * 0.4, 3);
            out.list.push({ kind: 'hurdle', z: a - L * 0.62, h: 1.6, d: 1.4 });
            pillars(a - L * 0.78, 2); boost(a - L * 0.9);
            return;
        }
        const n = cl(Math.min(4 + Math.floor(d * 4), Math.floor(L / (jumpDist(v) + 18))), 3, 7), span = L / n;
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.5) + (r() - 0.5) * span * 0.2, kind = i % 3;
            if (kind === 0) jumpPit(out, g, z, 0.72);
            else if (kind === 1) {
                // a rift on one side (go round it, or over it), pillars on the other
                const side = r() < 0.5 ? -1 : 1, dd = cl(span * 0.55, 8, 30), x0 = side < 0 ? -hw - 1 : -hw * 0.25, x1 = side < 0 ? hw * 0.25 : hw + 1;
                out.list.push({ kind: 'pool', z0: z - dd / 2, z1: z + dd / 2, x0, x1 });
                out.list.push({ kind: 'pillars', z, list: [{ x: +(-side * (hw - 5)).toFixed(2), z: +z.toFixed(2), s: 3.4 }] });
            } else if (r() < 0.5) boost(z); else pillars(z, 3);
        }
    },
    // rifts right across the way, key bridges over them (wide and three early on, narrower and two later); further in, a laser gate
    // and a second rift with no bridge: one keycap island in it, a jump either side (the stage's speed gate)
    moat(g, out, a, b) {
        const { r, v, d, hw } = g, L = a - b, nm = d < 0.4 ? 1 : 2, ml = cl(12 + v * 0.3, 14, 34);
        const nb = d < 0.25 ? 3 : 2, bw = cl(5.6 - d * 2.8, 3.4, 5.6);
        for (let j = 0; j < nm; j++) {
            const zc = a - L * (nm === 1 ? 0.5 : j ? 0.76 : 0.26);
            if (j === 1) {
                const gp = islandGap(v), dz = 8, o = lake(out, g, zc - gp - dz / 2, zc + gp + dz / 2);
                out.plats.push({ kind: 'stone', x: +((r() - 0.5) * 10).toFixed(2), z: +zc.toFixed(2), sx: 9, sz: dz, top: 1 });
                void o;
                continue;
            }
            const o = lake(out, g, zc - ml / 2, zc + ml / 2);
            const xs = nb === 3 ? [-hw + 4 + r() * 2, (r() - 0.5) * 4, hw - 4 - r() * 2] : [-(5 + r() * 7), 5 + r() * 7];
            for (const x0 of xs) {
                // a bridge a little crooked: its middle wanders across a few studs from one bank to the other
                const lean = (r() - 0.5) * 6, xa = cl(x0, -hw + bw / 2 + 1, hw - bw / 2 - 1);
                walkway(out, o.z0 - 0.6, o.z1 + 0.6, bw, 1, (z) => cl(xa + lean * ((o.z1 - z) / ml - 0.5), -hw + bw / 2 + 0.5, hw - bw / 2 - 0.5));
            }
        }
        if (nm === 2) out.list.push({ kind: 'crusher', z: +(a - L * 0.5).toFixed(2), period: +(Math.max(2.4, 3.3 - d * 0.8) + r() * 0.5).toFixed(3), phase: +(r() * 9).toFixed(3) });
        else out.list.push({ kind: 'boost', z: a - L * 0.82, x: 0, hw: 5, hd: 4 });
    },
    // lasers turning round their pylons, right across the way: two at first, three later (the later ones two beams crossed)
    sweeper(g, out, a, b) {
        const { r, d, k } = g, room = SWEEP.r * 2 + 8, n = Math.max(1, Math.min(2 + Math.floor(d * 3), Math.floor((a - b) / room))), span = (a - b) / n;
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.5);
            out.list.push({ kind: 'sweeper', z, x: 0, period: Math.max(1.7, 3.2 - d * 1.4 - i * 0.2), dir: i % 2 ? -1 : 1, phase: r() * 6.283, bars: k >= 5 && i > 0 ? 2 : 1 });
        }
    },
    // laser panels sliding across, one after another; further in, a rift to jump between two of them (sized to the pace)
    sliders(g, out, a, b) {
        const { r, d } = g, n = Math.max(g.nMin || 3, Math.min(g.nMax || 6, 3 + Math.floor(d * 4), Math.floor((a - b) / (0.9 * g.v + 14)))), span = (a - b) / n, pit = d >= 0.4 && n >= 3 && span > 1.62 * g.v + 8;
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.5);
            out.list.push({ kind: 'slider', z, period: Math.max(1.8, 3.0 - d * 1.1) + r() * 0.6, phase: r() * 6.283 });
            // a rift after a gate only with room for it all at the stage's pace: land after the gate, run up, jump the rift, land, take off for the next gate
            if (pit && i === n - 2) jumpPit(out, g, z - (0.45 * g.v + 4) - islandGap(g.v) / 2, 1);
        }
    },
    // the giant's room: Dr. Mutagen on his round (one at first; two, then three of him further in, each the other way round and
    // quicker), a boost between two rounds
    giant(g, out, a, b) {
        const { r, d, v, hw } = g, L = a - b, az = cl(6.5 + v * 0.05, 7, 11), n = cl(1 + Math.floor(d * 2.6), 1, Math.max(1, Math.floor(L / (az * 2 + GIANT.r * 2 + 0.6 * v + 14)))), span = L / n;
        // (his round takes him right up to both walls: no strip along them he never treads)
        const ax = +(hw - GIANT.r + 1.4).toFixed(2);
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.5);
            out.list.push({ kind: 'giant', z: +z.toFixed(2), ax, az: +az.toFixed(2), period: +(Math.max(3.4, 5.6 - d * 2) + r() * 0.5).toFixed(3), phase: +(r() * 6.283).toFixed(3), dir: i % 2 ? -1 : 1 });
            if (i > 0) out.list.push({ kind: 'boost', z: +(z + span / 2).toFixed(2), x: +((r() - 0.5) * (hw * 2 - 14)).toFixed(2), hw: 5, hd: 4 });
        }
    },
    // spike presses right across the way, one after another (room to stop and wait between two); further in, a pit to jump between two
    // of them (sized to the pace)
    crusher(g, out, a, b) {
        const { r, d, v } = g, n = Math.max(g.nMin || 2, Math.min(g.nMax || 6, 3 + Math.floor(d * 4), Math.floor((a - b) / (0.9 * v + 16)))), span = (a - b) / n;
        const pit = d >= 0.4 && n >= 3 && span > 1.62 * v + 12, period = Math.max(2.2, 3.1 - d * 0.8);
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.5);
            out.list.push({ kind: 'crusher', z: +z.toFixed(2), period: +(period + r() * 0.5).toFixed(3), phase: +(r() * 9).toFixed(3) });
            if (pit && i === n - 2) jumpPit(out, g, z - (CRUSH.d / 2 + 0.45 * v + 4) - islandGap(v) / 2, 1);
        }
    },
    // one narrow winding walkway of keycaps over the rift; further in, gaps in it (sized to the pace) and two rifts with a laser between
    bridge(g, out, a, b) {
        const { r, v, d, hw } = g, L = a - b, band = (SWEEP.r + 1.5) * 2 + 2, two = d >= 0.4 && L > band + 90;
        // (wide enough and gently enough curved to steer at the stage's pace: 7 studs early, 5 at the end, never more than ~15 studs/s sideways)
        const bw = cl(6.2 - d * 2, 4.4, 6.2), gap = islandGap(v) * (d >= 0.5 ? 0.92 : 0.78), lim = hw - bw / 2 - 1.5;
        const span = (z0, z1) => {
            const o = lake(out, g, z0, z1), A = r() * 6.283, B = r() * 6.283, amp = Math.min(lim, 2 + d * 4), wav = 0.025 + r() * 0.015;
            const path = (z) => cl(Math.sin(z * wav + A) * amp * 0.7 + Math.sin(z * wav * 2.3 + B) * amp * 0.3, -lim, lim);
            // the walkway in runs, a gap between (none early on): the first run starts on the near bank, the last ends on the far one
            const run = d < 0.2 ? 1e9 : cl(v * 1.3, 24, 84), end = o.z0 - 0.6;
            for (let z = o.z1 + 0.6; ;) {
                const z2 = z - run;
                // not room for another gap and a run after this one: this one goes on to the far bank
                if (z2 - gap - 10 < end) { walkway(out, end, z, bw, 1, path); break; }
                walkway(out, z2, z, bw, 1, path);
                z = z2 - gap;
            }
        };
        if (two) {
            const m = a - L * 0.5;
            span(m + band / 2, a);
            out.list.push({ kind: 'sweeper', z: m, x: 0, period: Math.max(2, 3.4 - d * 1.2), dir: r() < 0.5 ? -1 : 1, phase: r() * 6.283, bars: 1 });
            span(b, m - band / 2);
        } else span(b, a);
    },
    // giant floating keycaps over a rift: a path of them, each a gap (sized to the pace) on from the last
    stones(g, out, a, b) {
        const { r, v, d, hw } = g, gap = islandGap(v), depth = cl(6 + v * 0.04, 6.5, 10), o = lake(out, g, b + 1, a - 1);
        // (the first jump, off the bank, a little shorter; then a full gap each time)
        let edge = o.z1 - gap * 0.78, cx = 0, i = 0, far = o.z1;
        while (edge - depth > b + 1 + gap * 0.85) {
            const big = i % 4 === 3, w = big ? 9 : Math.max(4.8, 7.4 - d * 2.6) + r() * 1.2, dz = big ? Math.max(depth, 9) : depth;
            const dx = (r() - 0.5) * Math.min(12, gap * 0.6);
            cx = cl(cx + dx, -hw + w / 2 + 1, hw - w / 2 - 1);
            const z = edge - dz / 2;
            out.plats.push({ kind: 'stone', x: +cx.toFixed(2), z: +z.toFixed(2), sx: +w.toFixed(2), sz: dz, top: +(0.9 + r() * 1.1).toFixed(2) });
            far = edge - dz;
            // (sideways the next one can be a few studs off: the jump's along z, a little less for it)
            edge = far - gap * (0.92 + r() * 0.08) * Math.cos(Math.min(0.5, Math.abs(dx) / Math.max(1, gap)));
            i++;
        }
        // the far bank comes up a jump after the last one
        o.z0 = Math.max(b + 1, far - gap * 0.92);
    },
    // spring spacebars over a rift: each one throws you on to the next
    bounce(g, out, a, b) {
        const { r, v, d, hw } = g, step = Math.max(16, Math.min(40, v * 0.86));
        lake(out, g, b + 1, a - 1);
        // the first one right at the shore: run onto it
        let z = a - 1 - TRAMP.w / 2, cx = (r() - 0.5) * 8;
        while (z - TRAMP.w / 2 > b + 2) {
            out.plats.push({ kind: 'tramp', x: cx, z, sx: TRAMP.w - d * 1.2, sz: TRAMP.w - d * 1.2, top: TRAMP.top });
            cx = Math.max(-hw + 6, Math.min(hw - 6, cx + (r() - 0.5) * 14));
            z -= step * (0.9 + r() * 0.2);
        }
    },
    // a bridge of keys over a rift, winding, two tiles wide (three early on)
    crumble(g, out, a, b) {
        const { r, d, hw } = g, S = TILE.s, wide = d < 0.15 ? 3 : 2, tiles = [], o = lake(out, g, b + 1, a - 1);
        let cx = 0;
        const path = [];
        // (after a step sideways the bridge runs straight for a while: time to see it and steer, at the stage's pace)
        const straight = Math.max(1, Math.ceil(g.v * 0.06));
        let px0 = null, since = straight;
        for (let z = a - S / 2 - 0.5, i = 0; z > b + 1 + S / 2; z -= S, i++) {
            if (i % 3 === 0) cx = Math.max(-hw + S * wide / 2 + 1, Math.min(hw - S * wide / 2 - 1, cx + (r() - 0.5) * 9));
            // (each row overlaps the one before by a whole key at least: never a step across a corner)
            let x0 = Math.round((cx - S * wide / 2) / S) * S + S / 2;
            if (px0 !== null) { x0 = since < straight ? px0 : Math.max(px0 - S * (wide - 1), Math.min(px0 + S * (wide - 1), x0)); if (x0 !== px0) since = 0; }
            since++;
            px0 = x0;
            path.push({ z, x: x0 + (wide - 1) * S / 2 });
            for (let j = 0; j < wide; j++) tiles.push({ x: x0 + j * S, z });
        }
        out.list.push({ kind: 'crumble', z: (a + b) / 2, tiles: tiles.filter((t) => Math.abs(t.x) < hw - 0.5), path });
        // the far shore comes right up to the bridge's last row (no rift between)
        if (path.length) o.z0 = Math.max(b + 1, path[path.length - 1].z - S / 2 + 0.5);
    },
    // the last stage: floating keys (the world's longest jumps), a laser sweep, the narrow bridge, two spike presses
    gauntlet(g, out, a, b) {
        // (the laser's strip between the islands and the bridge grows with the pace: room to land off the islands, time the beam, and run
        // up to the bridge, not one jump's length that drops you on the beam or over it into the rift)
        const L = a - b, band = Math.min(L * 0.3, SWEEP.r * 2 + 8 + 1.28 * g.v), z1 = a - L * 0.42, z2 = z1 - band, z3 = a - L * 0.86;
        BUILD.stones({ ...g, v: g.v * 0.97, d: Math.min(g.d, 0.55) }, out, a, z1);
        BUILD.sweeper({ ...g, k: 0, d: Math.min(g.d, 0.5) }, out, z1, z2);
        BUILD.bridge({ ...g, d: 0.15 }, out, z2, z3);
        BUILD.crusher({ ...g, d: 0, nMin: 2, nMax: 2 }, out, z3, b);
    },
    // Dr. Mutagen: a run of low walls, tanks and small slime pits (they cost you a moment), with him on your heels
    chase(g, out, a, b) {
        // (room between them for a jump at the pace, its landing and a run-up: never a wall's jump that comes down in the next pit)
        const { r, v, hw, d } = g, L = a - b, n = cl(Math.min(3 + Math.floor(d * 4), Math.floor(L / (jumpDist(v) * 1.35 + 14))), 2, 7), span = L / n;
        out.list.push({ kind: 'chaser', z: (a + b) / 2, z0: a + 16, z1: b - 6, v0: v * 0.8, v1: v * (0.96 + d * 0.02), acc: v * 0.06 });
        for (let i = 0; i < n; i++) {
            const z = a - span * (i + 0.6), kind = (i + (r() < 0.5 ? 0 : 1)) % 3;
            if (kind === 0) out.list.push({ kind: 'hurdle', z, h: 1.6, d: 1.4 });
            else if (kind === 1) { const m = 2 + (r() < 0.5 ? 1 : 0), pz = []; for (let j = 0; j < m; j++) pz.push({ x: +(-hw + 4 + ((j + 0.5) / m) * (hw * 2 - 8) + (r() - 0.5) * 3).toFixed(2), z: +(z + (r() - 0.5) * 4).toFixed(2), s: 3.4 }); out.list.push({ kind: 'pillars', z, list: pz }); }
            else if (i > 0) jumpPit(out, g, z, 0.6);
            else out.list.push({ kind: 'boost', z, x: 0, hw: 5, hd: 4 });
        }
    },
    // vanishing keys: a winding path (three keys across early, two later) over the goo; the wave's gap is sized to the pace
    // (a jump at the Recommended Level clears it as it comes at you) and the waves far enough apart to land between them
    blink(g, out, a, b) {
        const { r, v, d, hw } = g, S = BLINK.s, wide = d < 0.3 ? 3 : 2, o = lake(out, g, b + 1, a - 1);
        const gapLen = cl(v * 0.34, 9, 24), spacing = jumpDist(v) * 1.75 + gapLen, c = v * 0.4;
        const rows = [];
        let cx = 0;
        for (let z = a - S / 2 - 0.5, i = 0; z > b + 1 + S / 2; z -= S, i++) {
            if (i % 4 === 0) cx = cl(cx + (r() - 0.5) * 8, -hw + S * wide / 2 + 1, hw - S * wide / 2 - 1);
            rows.push({ z: +z.toFixed(2), x: +cx.toFixed(2), w: S * wide });
        }
        out.list.push({ kind: 'blink', z: (a + b) / 2, rows, dt: +(S / c).toFixed(3), period: +(spacing / c).toFixed(3), on: +((spacing - gapLen) / c).toFixed(3) });
        if (rows.length) o.z0 = Math.max(b + 1, rows[rows.length - 1].z - S / 2 + 0.5);
    },
    // ----- steel balls and falling crates; then the old kinds (in no world's order now) -----
    boulders(g, out, a, b) {
        const { r, d } = g, one = d < 0.1 ? [-8.5, 8.5] : [-10.6, 0, 10.6], z1 = a - 6, z0 = b + 4, L = z1 - z0 + 24;
        const two = d >= 0.6 && one.length === 3, lanes = two ? one.concat(one) : one, o0 = r() * L;
        // (lane order round the cycle shuffled once; every boulder a whole share of the cycle from the next)
        const order = [0, 1, 2].sort(() => r() - 0.5), ph = lanes.map((_, i) => o0 + ((two ? order[i % 3] + (i >= 3 ? 3 : 0) : (one.length === 3 ? order[i] : i) + 0.25) / lanes.length) * L);
        out.list.push({ kind: 'boulders', z: (z0 + z1) / 2, z0, z1, lanes, v: 13 + d * 13, ph });
    },
    gumballs(g, out, a, b) {
        const { d, hw, w, k } = g;
        out.list.push({ kind: 'gumballs', z: (a + b) / 2, z0: b + 3, z1: a - 3, x0: -hw + 2.5, x1: hw - 2.5, dt: Math.max(0.14, 0.27 - d * 0.12), seed: w * 1009 + k * 71 + 5 });
    },
    walls(g, out, a, b) {
        const { d } = g, n = Math.max(2, Math.min(6, 3 + Math.floor(d * 3))), span = (a - b) / n;
        for (let i = 0; i < n; i++) out.list.push({ kind: 'jwall', z: a - span * (i + 0.5), i });
    },
    ice(g, out, a, b) { out.icy.push({ x0: -g.hw - 1, x1: g.hw + 1, z0: b, z1: a + 4 }); BUILD.field(g, out, a, b); },
    axes(g, out, a, b) {
        const { r, d } = g, n = Math.max(3, Math.min(6, 3 + Math.floor(d * 4))), span = (a - b) / n;
        for (let i = 0; i < n; i++) out.list.push({ kind: 'blade', z: a - span * (i + 0.5), period: Math.max(1.9, 2.8 - d * 0.7) + r() * 0.6, phase: r() * 6.283 });
    },
    maze(g, out, a, b) {
        const { r, d, hw } = g, n = Math.max(4, Math.min(8, 4 + Math.floor(d * 5))), span = (a - b) / n;
        for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, gw = Math.max(5, 7.5 - d * 2); out.list.push({ kind: 'slit', z: a - span * (i + 0.5), gx: side * (hw - gw / 2 - 1.5 - r() * 4), gw, h: 9, d: 2 }); }
    },
    boss(g, out, a, b) { BUILD.gauntlet(g, out, a, b); },
};

// ----- tests on the stage's ground, shared -----
export function inRect(o, x, z) { return x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1; }
// standing on a vanishing-keys row that's there at server time t?
export function onBlink(o, x, z, t) {
    for (let i = 0; i < o.rows.length; i++) { const q = o.rows[i]; if (Math.abs(z - q.z) < BLINK.s / 2 + 0.3 && Math.abs(x - q.x) < q.w / 2 + 0.3) return blinkOn(o, i, t); }
    return false;
}
export const onPlat = (p, x, z, pad) => Math.abs(x - p.x) < p.sx / 2 + (pad || 0) && Math.abs(z - p.z) < p.sz / 2 + (pad || 0);
void rngFrom;
