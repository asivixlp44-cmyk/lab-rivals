// Dr. Mutagen (our own): the lab's giant mutated scientist who chases you up a Mutagen Chase stage, and his sleeping twin slumped in the
// containment cell in Lab HQ. A hulking hunched brute (about 13 studs standing tall): mutant skin, a huge jaw with a jagged grin, round
// lab goggles with glowing lenses over his eyes and a strap round his head, a shock of wild white hair, bushy brows, a lab coat with
// its tails flapping behind him (a shirt and tie under it, a pocket of pens, a name badge), rubber gloves, dark trousers and heavy
// boots. He lumbers after you zombie-style, his arms stretched out at you. Sculpted, rounded low-poly forms, all one geometry: every
// vertex says which part it is and where that part turns (aPart, aC), so the run is all in the vertex shader (the legs pounding, the
// knees folding, the outstretched arms bobbing and grabbing at you when he's close, the head lolling and twitching, the coat tails
// flapping, the whole body straightening up when he bursts out of his vent) and the whole monster is one draw, its pose a few
// uniforms.
// Local space: his reach (where his hands get you) at the origin on the floor, facing -z (north), his body behind (+z). He runs hunched
// forward, his head under 10 studs: the chase camera looks down over his head at you. Only when he bursts out (or rears up) does he
// stand tall.
// (The exported names stay the old monster's: main.js, stagefx.js and world.js know them by those.)
import { T } from './engine.js';
import { nearFade } from './geo.js';
import { CU } from './clock.js';
import * as FX from './fx.js';

// each sector's Dr. Mutagen: skin (mutant), dark (shadows, the mouth, the goggles' rims, his boots), coat, shirt, tie, pants, glove (his
// rubber gloves), eye (the goggles' lenses, glowing), hair (wild, and his brows), badge (his name badge, his pens); glowRim: the lenses'
// rims glow too (night)
const LOOKS = {
    hazard: { skin: 0x78d052, dark: 0x1c2618, coat: 0xf4f6f8, shirt: 0x9ad0ff, tie: 0x2a3a6a, pants: 0x3a3f4c, glove: 0x2ac8b0, eye: 0xff3a24, hair: 0xf6f6f2, badge: 0x2ecc5a, glowRim: 0 },
    cryo: { skin: 0x7ac8e0, dark: 0x16263a, coat: 0xf6faff, shirt: 0xd8f2ff, tie: 0x1e4ab8, pants: 0x2e3e58, glove: 0x3a7ad8, eye: 0x6af4ff, hair: 0xffffff, badge: 0x2ab4e8, glowRim: 0 },
    biolab: { skin: 0xa8d23a, dark: 0x2a1a2e, coat: 0xf4ecdc, shirt: 0xffd8a8, tie: 0x6a2ab8, pants: 0x3a2e48, glove: 0x8a4ad8, eye: 0xff8a14, hair: 0xfff0c8, badge: 0xff8a1a, glowRim: 0 },
    void: { skin: 0x9a78e0, dark: 0x120c24, coat: 0xe8e2ff, shirt: 0x7af0ff, tie: 0xff3ad8, pants: 0x2a2450, glove: 0x3af0ff, eye: 0xff4ad8, hair: 0xf4ecff, badge: 0xff4ad8, glowRim: 1 },
};
export const scorpionLook = (Wd) => LOOKS[Wd && Wd.id] || LOOKS.hazard;
// the parts: 0 body, 1 / 3 the thighs (left / right), 2 / 4 the shins and boots, 5 / 7 the upper arms, 6 / 8 the forearms and hands,
// 9 the head, 10 the coat's tails (they flap)
// the running pose's joints (the vertex shader turns the limbs round these)
const HIP = [[-1.3, 4.95, 6.6], [1.3, 4.95, 6.6]], SHOULDER = [[-2.1, 7.25, 4.6], [2.1, 7.25, 4.6]], HIPC = [0, 4.95, 6.6], WAIST = [0, 5.9, 6.3];

// ----- a little sculpting kit: smooth-shaded ellipsoids, oriented and tapered, their colour worked out per vertex -----
const tc = new T.Color(), tc2 = new T.Color();
class Sculpt {
    constructor() { this.p = []; this.n = []; this.c = []; this.g = []; this.a = []; this.cen = []; }
    vert(P, N, c, g, part, pv) { this.p.push(P[0], P[1], P[2]); this.n.push(N[0], N[1], N[2]); tc.set(c); this.c.push(tc.r, tc.g, tc.b); this.g.push(g || 0); this.a.push(part); this.cen.push(pv[0], pv[1], pv[2]); }
    // an ellipsoid round C with axes ex, ey, ez (unit) and radii rx, ry, rz; its cross-section scaled from tA at the -ez end to tB at
    // the +ez end (a tapered segment); nu sides round, nv rings along; col(lx, ly, lz, ny) -> colour, glow(lx, ly, lz) -> 0/1/2
    blob(C, ex, ey, ez, rx, ry, rz, tA, tB, nu, nv, col, glow, part, pv) {
        const V = [];
        for (let j = 0; j <= nv; j++) {
            const th = j / nv * Math.PI, lz = -Math.cos(th), s = Math.sin(th), tp = tA + (tB - tA) * (lz + 1) / 2, row = [];
            for (let i = 0; i <= nu; i++) {
                const ph = i / nu * Math.PI * 2, lx = s * Math.cos(ph), ly = s * Math.sin(ph);
                const px = lx * rx * tp, py = ly * ry * tp, pz = lz * rz;
                const P = [C[0] + ex[0] * px + ey[0] * py + ez[0] * pz, C[1] + ex[1] * px + ey[1] * py + ez[1] * pz, C[2] + ex[2] * px + ey[2] * py + ez[2] * pz];
                const nx = lx / (rx * tp || 1), ny = ly / (ry * tp || 1), nz = lz / rz;
                const N = [ex[0] * nx + ey[0] * ny + ez[0] * nz, ex[1] * nx + ey[1] * ny + ez[1] * nz, ex[2] * nx + ey[2] * ny + ez[2] * nz], l = Math.hypot(N[0], N[1], N[2]) || 1;
                N[0] /= l; N[1] /= l; N[2] /= l;
                row.push({ P, N, c: col(lx, ly, lz, N[1]), g: glow ? glow(lx, ly, lz) : 0 });
            }
            V.push(row);
        }
        const put = (v) => this.vert(v.P, v.N, v.c, v.g, part, pv);
        for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
            const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], d = V[j + 1][i];
            if (j > 0) { put(a); put(b); put(c); }
            if (j < nv - 1) { put(a); put(c); put(d); }
        }
    }
    // a hanging sheet (a coat's skirt): a band between a ring round C0 (radius r0) and a ring round C1 (radius r1), both level, from
    // angle a0 to a1 round y (0: +z, his back); outside and (a shade darker) inside, so it reads from under it too
    sheet(C0, r0, C1, r1, a0, a1, n, col, colIn, part, pv) {
        const at = (C, r, a) => [C[0] + Math.sin(a) * r, C[1], C[2] + Math.cos(a) * r];
        // (the normal: out from the axis, tipped out with the flare)
        const nrm = (a) => { const dy = C0[1] - C1[1], dr = r1 - r0, l = Math.hypot(dy, dr) || 1; return [Math.sin(a) * dy / l, dr / l, Math.cos(a) * dy / l]; };
        const inv = (v) => [-v[0], -v[1], -v[2]];
        for (let i = 0; i < n; i++) {
            const u0 = a0 + (a1 - a0) * i / n, u1 = a0 + (a1 - a0) * (i + 1) / n;
            const A = at(C0, r0, u0), B = at(C0, r0, u1), Cc = at(C1, r1, u1), D = at(C1, r1, u0);
            const nA = nrm(u0), nB = nrm(u1), cA = col(i / n, 0), cD = col(i / n, 1);
            this.vert(A, nA, cA, 0, part, pv); this.vert(D, nA, cD, 0, part, pv); this.vert(Cc, nB, cD, 0, part, pv);
            this.vert(A, nA, cA, 0, part, pv); this.vert(Cc, nB, cD, 0, part, pv); this.vert(B, nB, cA, 0, part, pv);
            this.vert(A, inv(nA), colIn, 0, part, pv); this.vert(Cc, inv(nB), colIn, 0, part, pv); this.vert(D, inv(nA), colIn, 0, part, pv);
            this.vert(A, inv(nA), colIn, 0, part, pv); this.vert(B, inv(nB), colIn, 0, part, pv); this.vert(Cc, inv(nB), colIn, 0, part, pv);
        }
    }
    geometry() {
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
        g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
        g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
        g.setAttribute('aGlow', new T.Float32BufferAttribute(this.g, 1));
        g.setAttribute('aPart', new T.Float32BufferAttribute(this.a, 1));
        g.setAttribute('aC', new T.Float32BufferAttribute(this.cen, 3));
        g.computeBoundingSphere();
        return g;
    }
}
const add = (a, b, k) => [a[0] + b[0] * (k ?? 1), a[1] + b[1] * (k ?? 1), a[2] + b[2] * (k ?? 1)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// a frame round direction ez (ex level, ey up as far as it can be)
function frame(ez) { let ex = cross([0, 1, 0], ez); if (Math.hypot(...ex) < 1e-3) ex = [1, 0, 0]; ex = norm(ex); return [ex, norm(cross(ez, ex))]; }
const mixHex = (a, b, k) => tc2.set(a).lerp(tc.set(b), Math.max(0, Math.min(1, k))).getHex();
const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

// the two poses' joints: 0 running (the shader's bind pose: hunched forward, head thrust out at your height, arms stretched out at you),
// 1 asleep (sitting slumped against the cell's back, knees up, arms over them, head bowed)
const POSE = [
    {
        hip: HIP, knee: [[-1.4, 2.75, 5.5], [1.4, 2.75, 5.5]], ankle: [[-1.35, 0.85, 6.7], [1.35, 0.85, 6.7]], toe: [[-1.35, 0.3, 5.0], [1.35, 0.3, 5.0]],
        pelvis: [0, 5.05, 6.75], waist: WAIST, shC: [0, 7.2, 4.75], sh: SHOULDER, elbow: [[-2.35, 6.75, 2.3], [2.35, 6.75, 2.3]], wrist: [[-2.05, 6.45, 0.05], [2.05, 6.45, 0.05]],
        hand: [0, -0.12, -1], neck0: [0, 7.5, 4.2], neck1: [0, 7.8, 3.55], head: [0, 7.9, 2.5], face: norm([0, -0.12, -1]),
    },
    {
        hip: [[-1.3, 1.1, 2.9], [1.3, 1.1, 2.9]], knee: [[-1.6, 4.4, 0.2], [1.6, 4.4, 0.2]], ankle: [[-1.45, 0.9, -1.0], [1.45, 0.9, -1.0]], toe: [[-1.45, 0.3, -2.6], [1.45, 0.3, -2.6]],
        pelvis: [0, 1.2, 3.1], waist: [0, 2.6, 3.4], shC: [0, 5.2, 3.0], sh: [[-2.1, 5.15, 3.0], [2.1, 5.15, 3.0]], elbow: [[-2.7, 5.0, 0.4], [2.7, 5.0, 0.4]], wrist: [[-2.2, 3.4, -1.4], [2.2, 3.4, -1.4]],
        hand: [0, -0.9, -0.4], neck0: [0, 5.5, 2.6], neck1: [0, 5.3, 1.9], head: [0, 4.95, 1.1], face: norm([0, -0.8, -0.6]),
    },
];

// build Dr. Mutagen (pose 0 awake and running, 1 asleep); L: his colours; low: fewer facets (far away, Low quality)
export function scorpionGeo(L, low, pose) {
    const S = new Sculpt(), sleep = pose === 1, J = POSE[sleep ? 1 : 0], Q = low ? 0.6 : 1, nU = (n) => Math.max(5, Math.round(n * Q)), nV = (n) => Math.max(3, Math.round(n * Q));
    const rimG = L.glowRim ? () => 1 : null, body = [0, 0, 0], X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
    void Y; void Z;
    // a colour lit from above, shadowed underneath
    const shadeC = (base, k) => (lx, ly, lz, ny) => (ny < -0.2 ? mixHex(base, L.dark, (k ?? 0.3) * sm(-0.2, -0.9, ny)) : mixHex(base, 0xffffff, 0.1 * sm(0.3, 1, ny)));
    // a tapered segment from A to B, radius rA to rB, its colour (a function or a colour)
    const seg = (A, B, rA, rB, nu, nv, base, part, pv, o) => {
        const ez = norm(sub(B, A)), [ex, ey] = frame(ez), L2 = Math.hypot(...sub(B, A)) / 2, C = lerp3(A, B, 0.5), r = Math.max(rA, rB), ov = (o && o.ov) ?? 0.3;
        const col = typeof base === 'function' ? base : (o && o.flat) ? () => base : shadeC(base);
        S.blob(C, ex, ey, ez, r, r, L2 + r * ov, rA / r, rB / r, nu, nv, col, o && o.glow, part, pv);
    };
    const ball = (C, r, nu, nv, c, g, part, pv, sx, sy, sz) => S.blob(C, X, [0, 1, 0], [0, 0, 1], r * (sx || 1), r * (sy || 1), r * (sz || 1), 1, 1, nu, nv, typeof c === 'function' ? c : () => c, g ? () => g : null, part, pv);
    // a ring round a limb (a cuff, the goggles' rims, the strap): short segments round the circle at P, square to dir
    const ring = (P, dir, R, r, n, c, part, pv, g) => {
        const [a, b] = frame(norm(dir));
        const at = (i) => { const t = i / n * Math.PI * 2; return add(add(P, a, Math.cos(t) * R), b, Math.sin(t) * R); };
        for (let i = 0; i < n; i++) seg(at(i), at(i + 1), r, r, nU(5), 3, c, part, pv, { flat: true, ov: 0.6, glow: g });
    };

    // ----- the body: trousers at the hips, a big barrel chest in the lab coat (a shirt and tie in the V at its front, a collar, a pocket
    // of pens and a name badge), a hump of shoulders; the coat's tails hanging from the waist, open at the front -----
    const spine = norm(sub(J.shC, J.waist)), [sx_, sy_] = frame(spine);
    S.blob(J.pelvis, X, [0, 1, 0], [0, 0, 1], 1.85, 1.05, 1.35, 1, 1, nU(10), nV(6), shadeC(L.pants), null, 0, body);
    const chestC = lerp3(J.waist, J.shC, 0.52), chestL = Math.hypot(...sub(J.shC, J.waist)) * 0.66;
    S.blob(chestC, sx_, sy_, spine, 2.25, 1.75, chestL, 0.86, 1, nU(14), nV(9), (lx, ly, lz, ny) => {
        // the coat; at its front (ly < 0: his belly side) a V of shirt down to the waist with the tie down its middle
        const v = ly < -0.55 && Math.abs(lx) < 0.12 + 0.36 * (lz + 1) / 2;
        const c = v ? (Math.abs(lx) < 0.09 ? L.tie : L.shirt) : L.coat;
        return shadeC(c, 0.22)(lx, ly, lz, ny);
    }, null, 0, body);
    // a belt of coat round the waist (where the tails hang from)
    seg(J.pelvis, J.waist, 1.75, 1.6, nU(10), nV(4), L.coat, 0, body, { ov: 0.15 });
    // the shoulders' hump and the collar's flaps
    for (const s of [-1, 1]) S.blob(add(add(J.shC, sx_, s * 1.35), sy_, 0.55), sx_, sy_, spine, 1.05, 0.75, 1.0, 1, 0.85, nU(8), nV(5), shadeC(L.coat, 0.2), null, 0, body);
    for (const s of [-1, 1]) seg(add(add(J.shC, sx_, s * 0.45), sy_, -0.3), add(add(add(J.shC, sx_, s * 1.1), sy_, -1.2), spine, -0.6), 0.22, 0.12, nU(5), 3, mixHex(L.coat, L.dark, 0.08), 0, body, { flat: true });
    if (!low) {
        // the pocket of pens (left of his chest) and his name badge (right)
        const front = add(chestC, sy_, -1.62);
        ball(add(add(front, sx_, 0.95), spine, 0.25), 0.36, 6, 4, mixHex(L.coat, L.dark, 0.12), 0, 0, body, 1, 1, 0.35);
        for (const [o, c] of [[-0.12, 0xff3a3a], [0.02, 0x3a7aff], [0.16, 0x222230]]) seg(add(add(front, sx_, 0.95 + o), spine, 0.35), add(add(front, sx_, 0.95 + o), spine, 0.85), 0.05, 0.05, 4, 3, c, 0, body, { flat: true });
        ball(add(add(front, sx_, -0.95), spine, 0.35), 0.3, 6, 4, L.badge, 0, 0, body, 1.3, 1, 0.3);
    }
    // the coat's tails: hanging from the waist to above his knees, flaring out, open at the front (their own part: they flap)
    {
        const top = add(J.waist, [0, -0.2, 0.1]), bot = sleep ? add(J.pelvis, [0, -0.9, 1.2]) : [0, 2.95, 7.25];
        S.sheet(top, 1.68, bot, sleep ? 2.4 : 2.6, -2.25, 2.25, low ? 8 : 14, (u, v) => (v > 0.5 ? mixHex(L.coat, L.dark, 0.1) : L.coat), mixHex(L.coat, L.dark, 0.35), 10, J.waist);
    }
    // the neck: thick, his skin
    seg(J.neck0, J.neck1, 0.82, 0.72, nU(8), nV(4), L.skin, 0, body, { ov: 0.2 });

    // ----- the head (it lolls and twitches on his neck): a big lumpy head with a huge jaw, a jagged grin, his goggles with their strap
    // round his head, bushy brows, ears, a shock of wild white hair -----
    const fz = J.face, [fx, fy] = frame(fz), HC = J.head, hp = J.neck1;
    S.blob(HC, fx, fy, fz, 1.42, 1.5, 1.38, 1, 1, nU(14), nV(10), (lx, ly, lz, ny) => mixHex(shadeC(L.skin, 0.4)(lx, ly, lz, ny), L.dark, 0.14 * sm(0.2, -0.9, lz)), null, 9, hp);
    // the jaw: wide and heavy, jutting out under the face
    S.blob(add(add(HC, fy, -0.95), fz, 0.45), fx, fy, fz, 1.32, 0.72, 1.1, 1, 1, nU(12), nV(6), shadeC(mixHex(L.skin, L.dark, 0.06), 0.45), null, 9, hp);
    // the nose, the ears
    S.blob(add(add(HC, fz, 1.38), fy, -0.18), fx, fy, fz, 0.3, 0.26, 0.33, 1, 1, 6, 4, () => mixHex(L.skin, L.dark, 0.1), null, 9, hp);
    for (const s of [-1, 1]) S.blob(add(add(HC, fx, s * 1.42), fy, -0.1), fx, fy, fz, 0.19, 0.34, 0.3, 1, 1, 6, 4, () => mixHex(L.skin, L.dark, 0.12), null, 9, hp);
    // a point on the face's surface: u across, v up (from the middle), out a little past the skin
    const onFace = (u, v, out) => { const x = u * 1.42, y = v * 1.5, z = 1.38 * Math.sqrt(Math.max(0, 1 - u * u - v * v)) + (out || 0.05); return add(add(add(HC, fx, x), fy, y), fz, z); };
    // the grin: a wide dark mouth across the jaw, jagged teeth along its top
    const mouth = [];
    for (let j = 0; j <= 8; j++) { const u = -0.62 + 1.24 * j / 8; mouth.push(add(add(add(HC, fy, -0.98 + 0.12 * (u / 0.62) * (u / 0.62)), fx, u * 1.32), fz, 1.42 * Math.sqrt(Math.max(0.05, 1 - u * u * 0.9)) - 0.08)); }
    for (let j = 0; j < 8; j++) seg(mouth[j], mouth[j + 1], sleep ? 0.06 : 0.16, sleep ? 0.06 : 0.16, nU(5), 3, L.dark, 9, hp, { flat: true, ov: 0.5 });
    if (!sleep) for (const j of [1, 2, 3, 4, 5, 6, 7]) { const P = mouth[j]; seg(add(P, fy, 0.12), add(add(P, fy, -0.12), fz, 0.04), 0.09, 0.03, 4, 3, 0xfaf8ee, 9, hp, { flat: true }); }
    // the goggles: two big round lenses (glowing while he's awake), dark rims round them, a bridge, the strap right round his head
    const lens = [onFace(-0.36, 0.2, 0.12), onFace(0.36, 0.2, 0.12)];
    for (const P of lens) {
        S.blob(P, fx, fy, fz, 0.5, 0.5, 0.26, 1, 1, nU(12), nV(5), (lx, ly, lz) => (lz > 0.3 ? (sleep ? mixHex(L.eye, L.dark, 0.75) : mixHex(L.eye, 0xffffff, 0.12 * sm(0.6, 1, ly))) : L.dark), sleep ? null : (lx, ly, lz) => (lz > 0.3 ? 1 : 0), 9, hp);
        ring(add(P, fz, 0.12), fz, 0.54, 0.11, low ? 8 : 12, L.dark, 9, hp, rimG);
        // a glint
        if (!sleep && !low) S.blob(add(add(add(P, fz, 0.26), fy, 0.2), fx, 0.17), fx, fy, fz, 0.08, 0.08, 0.08, 1, 1, 4, 3, () => 0xffffff, () => 1, 9, hp);
    }
    seg(lens[0], lens[1], 0.09, 0.09, 4, 3, L.dark, 9, hp, { flat: true });
    // (the strap: a band round his head at the goggles' height)
    ring(add(add(HC, fy, 0.25), fz, -0.05), fy, 1.44, 0.12, low ? 10 : 16, L.dark, 9, hp);
    // bushy brows over the goggles, scowling down at the middle
    for (const s of [-1, 1]) seg(onFace(s * 0.1, 0.58, 0.18), onFace(s * 0.66, 0.66, 0.12), 0.2, 0.15, nU(6), 4, L.hair, 9, hp, { ov: 0.4 });
    // wild white hair: spikes standing up off the top and back of his head, every which way (directions in the head's frame: across, up,
    // out of the face; the length)
    const HAIR = low
        ? [[0, 0.95, -0.1, 1.2], [-0.6, 0.75, -0.4, 1.0], [0.6, 0.75, -0.4, 1.0], [0, 0.6, -0.85, 1.0], [-0.85, 0.35, -0.5, 0.8], [0.85, 0.35, -0.5, 0.8]]
        : [[0, 0.98, 0.05, 1.25], [-0.45, 0.9, -0.15, 1.15], [0.45, 0.9, -0.15, 1.15], [-0.85, 0.62, -0.25, 1.0], [0.85, 0.62, -0.25, 1.0], [-0.3, 0.75, -0.6, 1.1], [0.3, 0.75, -0.6, 1.1], [0, 0.45, -0.95, 1.05], [-0.75, 0.2, -0.7, 0.9], [0.75, 0.2, -0.7, 0.9], [-1.0, 0.05, -0.2, 0.7], [1.0, 0.05, -0.2, 0.7]];
    for (const [hx, hy, hz, len] of HAIR) {
        const d = norm([fx[0] * hx + fy[0] * hy + fz[0] * hz, fx[1] * hx + fy[1] * hy + fz[1] * hz, fx[2] * hx + fy[2] * hy + fz[2] * hz]);
        const base = add(HC, d, 1.15), tip = add(add(base, d, len), [0, 0.35, 0.15]);
        seg(base, tip, 0.38, 0.05, nU(6), 4, (lx, ly, lz, ny) => mixHex(L.hair, L.dark, 0.12 * sm(0.3, -1, lz) + 0.1 * sm(-0.2, -0.9, ny)), 9, hp, { ov: 0.2 });
    }

    // ----- the legs: dark trousers, the knees folding, heavy boots with thick soles -----
    for (let s = 0; s < 2; s++) {
        const thigh = 1 + s * 2, shin = 2 + s * 2, hip = J.hip[s], knee = J.knee[s], ank = J.ankle[s], toe = J.toe[s];
        seg(hip, knee, 0.92, 0.72, nU(8), nV(5), L.pants, thigh, hip);
        ball(knee, 0.7, nU(7), nV(4), shadeC(mixHex(L.pants, L.dark, 0.1)), 0, thigh, hip);
        seg(knee, ank, 0.68, 0.55, nU(8), nV(5), L.pants, shin, knee);
        // the boot: an ankle cuff, the foot, the sole
        ball(ank, 0.62, nU(7), nV(4), L.dark, 0, shin, knee);
        const fd = norm(sub(toe, ank));
        seg(ank, toe, 0.58, 0.5, nU(7), nV(4), (lx, ly, lz, ny) => (ny < -0.5 ? mixHex(L.dark, 0x000000, 0.4) : mixHex(L.dark, 0xffffff, 0.08)), shin, knee, { ov: 0.45 });
        ball(add(toe, fd, 0.15), 0.52, nU(6), nV(4), L.dark, 0, shin, knee, 1.05, 0.85, 1);
    }

    // ----- the arms: coat sleeves, the elbows, the sleeves rolled back at the forearm, his own skin, rubber gloves with a cuff and big
    // grabbing fingers curling at you -----
    for (let s = 0; s < 2; s++) {
        const up = 5 + s * 2, fore = 6 + s * 2, sh = J.sh[s], el = J.elbow[s], wr = J.wrist[s], side = s ? 1 : -1;
        ball(sh, 0.95, nU(8), nV(5), shadeC(L.coat, 0.2), 0, up, sh);
        seg(sh, el, 0.85, 0.7, nU(8), nV(5), L.coat, up, sh);
        ball(el, 0.7, nU(7), nV(4), shadeC(L.coat, 0.2), 0, up, sh);
        const roll = lerp3(el, wr, 0.42);
        seg(el, roll, 0.7, 0.68, nU(8), nV(4), L.coat, fore, el);
        ring(roll, sub(wr, el), 0.7, 0.16, low ? 7 : 10, mixHex(L.coat, L.dark, 0.1), fore, el);
        seg(roll, wr, 0.55, 0.48, nU(8), nV(4), L.skin, fore, el);
        // the glove: its cuff, the palm, four fingers and a thumb
        const gc = lerp3(roll, wr, 0.75);
        seg(gc, wr, 0.62, 0.58, nU(8), 3, L.glove, fore, el, { ov: 0.1 });
        const hd = norm(J.hand), [ha, hb] = frame(hd), pc = add(wr, hd, 0.6);
        S.blob(pc, ha, hb, hd, 0.78, 0.36, 0.72, 1, 0.92, nU(9), nV(5), shadeC(L.glove, 0.3), null, fore, el);
        for (const o of [-0.52, -0.18, 0.18, 0.52]) {
            const f0 = add(add(pc, hd, 0.6), ha, o), f1 = add(add(add(f0, hd, 0.75), ha, o * 0.2), hb, -0.12), f2 = add(add(f1, hd, 0.45), hb, -0.4);
            seg(f0, f1, 0.2, 0.18, nU(5), 3, L.glove, fore, el, { ov: 0.35 });
            seg(f1, f2, 0.18, 0.1, nU(5), 3, mixHex(L.glove, L.dark, 0.15), fore, el, { ov: 0.5 });
        }
        const t0 = add(add(pc, ha, side * 0.7), hd, 0.1), t1 = add(add(add(t0, ha, side * 0.35), hd, 0.55), hb, -0.25);
        seg(t0, t1, 0.2, 0.1, nU(5), 3, L.glove, fore, el, { ov: 0.4 });
    }
    return S.geometry();
}

// the live monster: one mesh, its pose in uniforms. mode: 'burst' (bursting up out of his floor vent in a cloud of dust), 'run', 'bite'
// (grabbing at you)
// (opt.scale: drawn that many times the size: the giant on his round in a Giant's Room, 'walk' mode: upright, slow heavy strides,
// x and z his hips' place on the floor)
export const GIANT_STEP = 0.75;
export function buildScorpion(group, Wd, low, opt) {
    const L = scorpionLook(Wd), g = scorpionGeo(L, low, 0), SC = (opt && opt.scale) || 1;
    const U = { uPhase: { value: 0 }, uStrike: { value: 0 }, uBob: { value: 0 }, uRear: { value: 0 } };
    const v3s = (a) => 'vec3(' + a.map((x) => x.toFixed(3)).join(', ') + ')';
    const m = new T.MeshLambertMaterial({ vertexColors: true });
    m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U); sh.uniforms.uNow = CU.uNow;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
attribute float aPart; attribute vec3 aC; attribute float aGlow; uniform float uNow; uniform float uPhase; uniform float uStrike; uniform float uBob; uniform float uRear;
varying float vGlow;
mat2 sRot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }`)
            .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
vec3 sP = position; float id = aPart; vec3 nN = objectNormal;
if (id > 0.5 && id < 4.5) {
    // a leg: the two out of step, each swinging round its hip, the knee folding as it comes forward (the boot lifting), straight as
    // it pushes back
    float side = id < 2.5 ? -1.0 : 1.0, ph = uPhase + (side > 0.0 ? 3.1416 : 0.0);
    float sw = -sin(ph) * 0.6, kb = 0.08 + 0.95 * max(0.0, cos(ph));
    vec3 hip = side < 0.0 ? ${v3s(HIP[0])} : ${v3s(HIP[1])};
    if (mod(id, 2.0) < 0.5) { vec3 q = sP - aC; q.yz = sRot(kb) * q.yz; nN.yz = sRot(kb) * nN.yz; sP = aC + q; }
    vec3 q = sP - hip; q.yz = sRot(sw) * q.yz; nN.yz = sRot(sw) * nN.yz; sP = hip + q;
} else if (id > 4.5 && id < 8.5) {
    // an arm, stretched out at you (zombie-style): bobbing a little with his stride, the elbow giving; grabbing (up and in round you)
    // when he's close
    float side = id < 6.5 ? -1.0 : 1.0, ph = uPhase + (side > 0.0 ? 3.1416 : 0.0);
    float sa = sin(ph) * 0.16 - uStrike * 0.35, eb = -(0.04 + 0.14 * max(0.0, -cos(ph))) * (1.0 - uStrike * 0.8);
    vec3 sh = side < 0.0 ? ${v3s(SHOULDER[0])} : ${v3s(SHOULDER[1])};
    if (mod(id, 2.0) < 0.5) { vec3 q = sP - aC; q.yz = sRot(eb) * q.yz; nN.yz = sRot(eb) * nN.yz; sP = aC + q; }
    float spread = (uStrike * 0.3 - 0.06) * side + sin(uPhase * 0.5 + side) * 0.05;
    vec3 q = sP - sh; q.yz = sRot(sa) * q.yz; nN.yz = sRot(sa) * nN.yz; q.xz = sRot(-spread) * q.xz; nN.xz = sRot(-spread) * nN.xz; sP = sh + q;
} else if (id > 8.5 && id < 9.5) {
    // the head: lolling slowly from side to side, twitching now and then, thrust forward when he grabs
    float tw = sin(uNow * 1.1) * 0.14 + step(0.93, fract(uNow * 0.37)) * sin(uNow * 61.0) * 0.1, nod = -uStrike * 0.25 + sin(uPhase * 2.0) * 0.06;
    vec3 q = sP - aC; q.xy = sRot(tw) * q.xy; nN.xy = sRot(tw) * nN.xy; q.yz = sRot(nod) * q.yz; nN.yz = sRot(nod) * nN.yz; sP = aC + q;
} else if (id > 9.5) {
    // the coat's tails: flapping out behind him as he runs (more the further down)
    float fl = (sin(uPhase * 2.0 + sP.x * 0.4) * 0.09 + 0.12) * smoothstep(0.0, 3.0, aC.y - sP.y);
    vec3 q = sP - aC; q.yz = sRot(fl) * q.yz; nN.yz = sRot(fl) * nN.yz; sP = aC + q;
}
if (id < 0.5 || id > 4.5) {
    // the whole top half straightening up round the hips (he bursts out standing tall, then hunches over to run); a lurch from side to
    // side as he lumbers
    vec3 q = sP - ${v3s(HIPC)}; float ra = -0.75 * uRear + sin(uPhase * 2.0) * 0.035; q.yz = sRot(ra) * q.yz; nN.yz = sRot(ra) * nN.yz;
    float rl = sin(uPhase) * 0.06; q.xy = sRot(rl) * q.xy; nN.xy = sRot(rl) * nN.xy; sP = ${v3s(HIPC)} + q;
}
sP.y += uBob;
// boots stamp down on the floor rather than through it (not while he's still coming up out of his vent)
if (id > 0.5 && id < 4.5 && uBob > -0.5) sP.y = max(sP.y, 0.1);
objectNormal = nN;`)
            .replace('#include <begin_vertex>', `vec3 transformed = sP;
vGlow = aGlow > 1.5 ? (fract(uNow * 1.4) < 0.45 ? 1.0 : 0.12) : aGlow > 0.5 ? 1.0 : 0.0;`);
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;')
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * (0.12 + vGlow * 1.3);
diffuseColor.rgb *= 1.0 - vGlow * 0.6;`);
    };
    m.customProgramCacheKey = () => 'lrv-mutagen' + (low ? '-l' : '');
    // (only what's right at the lens dissolves: the chase camera looks down over his head and must see him)
    nearFade(m, 'lrv-mutagen-f' + (low ? '-l' : ''), 3, 6.5);
    const mesh = new T.Mesh(g, m);
    mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = !low; mesh.matrixAutoUpdate = false; mesh.visible = false;
    mesh.scale.setScalar(SC);
    group.add(mesh);
    // a soft shadow under him (he runs on keys that take no shadows)
    let blob = null;
    if (!low) {
        const bg = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
        blob = new T.Mesh(bg, new T.ShaderMaterial({
            vertexShader: 'varying vec2 vP; void main() { vP = position.xz * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'varying vec2 vP; void main() { float r = length(vP); if (r > 1.0) discard; gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0 - smoothstep(0.35, 1.0, r)) * 0.4); }',
            transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
        }));
        blob.scale.set(9 * (SC > 1 ? SC * 0.8 : 1), 1, 12 * (SC > 1 ? SC * 0.6 : 1)); blob.frustumCulled = false; blob.matrixAutoUpdate = false; blob.visible = false; blob.renderOrder = 2;
        group.add(blob);
    }
    const dust = new T.Color(Wd.floor ?? 0xe8e6de).lerp(new T.Color(0xffffff), 0.3).getHex(), tv = new T.Vector3();
    let burstAt = -1, puffAt = 0, warm = false;
    const S = {
        mesh, blob,
        // on: shown or not; x, y, z: his reach on the floor; ry: facing (0 north); t: seconds (his clock); mode: 'burst' | 'run' | 'bite'
        set(on, x, y, z, ry, t, mode) {
            if (!on) { if (!warm) { mesh.visible = false; if (blob) blob.visible = false; } burstAt = -1; return; }
            mesh.visible = true; if (blob) blob.visible = true;
            if (mode === 'burst' && (burstAt < 0 || t < burstAt)) { burstAt = t; puffAt = 0; }
            if (mode !== 'burst') burstAt = -1;
            const bk = mode === 'burst' ? Math.min(1, (t - burstAt) / 0.8) : 1, rise = (1 - bk) * (1 - bk);
            const bite = mode === 'bite' ? 1 : 0, walk = mode === 'walk';
            // (walking: two footfalls a stride, GIANT_STEP strides a second, on the clock main.js thuds to; wrapped, the server's seconds are huge)
            U.uPhase.value = walk ? (t % (2 / GIANT_STEP)) * 6.2831853 * GIANT_STEP : t * (mode === 'burst' ? 6 : 10.5);
            U.uBob.value = walk ? Math.abs(Math.sin(U.uPhase.value)) * 0.2 : Math.abs(Math.sin(t * 10.5)) * 0.38 * bk - rise * 15;
            U.uStrike.value += (bite - U.uStrike.value) * 0.25;
            // he comes up standing tall, and hunches over as he sets off
            if (walk) U.uRear.value = 0.82; else U.uRear.value += ((mode === 'burst' ? 1 : 0) - U.uRear.value) * (mode === 'burst' ? 0.3 : 0.14);
            const lunge = U.uStrike.value * 1.4 + (walk ? HIPC[2] * SC : 0), s = Math.sin(ry), c = Math.cos(ry);
            mesh.position.set(x - s * lunge, y, z - c * lunge);
            mesh.rotation.set(-0.3 * rise, ry, 0, 'YXZ');
            mesh.updateMatrix(); mesh.updateMatrixWorld();
            if (blob) { if (walk) blob.position.set(x, y + 0.12, z); else blob.position.set(x + s * 4.5, y + 0.12, z + c * 4.5); blob.rotation.set(0, ry, 0); blob.updateMatrix(); blob.updateMatrixWorld(); }
            if (walk) return;
            // dust: a cloud as he breaks out of his vent, puffs from his boots as he runs
            if (mode === 'burst' && t - puffAt > 0.12 && bk < 1) { puffAt = t; for (let i = 0; i < (low ? 2 : 4); i++) { tv.set(x + (Math.random() - 0.5) * 7 * c, y + 0.5, z + 5 + (Math.random() - 0.5) * 7); FX.dust(tv, low ? 2 : 3, 2.2, dust); } }
            else if (!low && mode !== 'burst' && t - puffAt > 0.2) { puffAt = t; tv.set(x + (Math.random() - 0.5) * 5 * c, y + 0.3, z + 5 + Math.random() * 3); FX.dust(tv, 1, 1.2, dust); }
        },
        warm(on) { warm = !!on; mesh.visible = warm; if (blob) blob.visible = warm; if (on) { mesh.position.set(0, -50, 0); mesh.updateMatrix(); mesh.updateMatrixWorld(); } },
        dispose() { group.remove(mesh); g.dispose(); m.dispose(); if (blob) { group.remove(blob); blob.geometry.dispose(); blob.material.dispose(); } },
    };
    return S;
}
