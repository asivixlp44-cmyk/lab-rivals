# Lab Rivals

A multiplayer "+1 Speed" keyboard runner for the browser, built with **Three.js** and **Colyseus** for Bloxity. It is listed as
**[🔬RED vs BLUE] +1 Speed Lab Keyboard Escape**, slug `lab-rivals`.

**RED LAB vs BLUE LAB.** Everyone in a server is on one of two rival labs, racing up a giant keyboard to score for their side.

- **Speed and Levels.** Every step is **+1 Speed and +1 XP, times all your boosts**, and every step clacks a giant keycap.
  - Your daily **Lab Streak** is one of the boosts: x1.35 on day 1, and more every day you come back in a row.
  - XP fills your Level, and **your Level sets how fast you can walk**.
- **Lab HQ.** You start indoors, in the speed lab's great hall: white tiled walls, tall windows, a ceiling of steel trusses and
  light panels, a floor of green and white keycaps. Train on its treadmills ("+2 / STEP", "+5 / STEP" ...).
- **The Test Track.** A run of lab rooms, one a stage, twenty per sector. Each room has tiled walls, a ceiling, and a wall with a
  wide doorway marked "STAGE N" at its end, its chain-link gates standing open. The floor is a giant keyboard and it climbs higher
  and higher. The Green Lab's first five rooms:
  1. **the Clean Room**: green and white keys to run across;
  2. **Dr. Mutagen's Office**: the giant scientist walks round and round his room; slip past behind him;
  3. **Spike Press Row**: spiked presses slam down from the ceiling;
  4. **the Steel Ball Ramp**: a giant steel ball rolls down a ramp of keys, yellow ladders up the walls;
  5. **the Slime Pit**: stepping keys over glowing slime, under glowing pipes.

  Further in:
  - **spike presses** slamming down;
  - **giant steel balls** rolling at you;
  - **laser sweepers** and **falling flasks**;
  - **flicker keys** and **glitch keys** that vanish under your feet;
  - **slime** in the gaps between stepping keys;
  - **Dr. Mutagen**, the lab's giant mutated scientist, who bursts out of a floor vent and lumbers after you.
- **The Team Battle.**
  - Every door you pass scores its stage number for your lab: Stage 4 is 4 points.
  - The bar at the top shows both labs' points, the round's clock, and your own points.
  - After 5 minutes the lab with more points wins. Its scorers get Wins and Gems, and the round's MVP gets 2 Gems more.
  - The other lab's scorers get a little, so playing always pays.
- **Knocked out.** Get hit or fall in and Boxity's death screen counts down. Then:
  - **REVIVE** straight back into the stage: FREE every 3 minutes, for a short ad, or 5 Gems;
  - or go **BACK TO Lab HQ**.
- **Wins.** Every door you pass pays Wins. The Wins you earn open faster treadmills. Spend them on upgrades and Eggs for lab pets.
- **Rebirth and sectors.** Rebirth for a multiplier. Clear a sector's twenty stages to open the next (80 stages in all).
- **SKIP STAGE pads.** Just inside a stage's door stands a purple pad: step on it (E) to skip that stage for Gems or a short ad.
- **WIN mats.** On the floor before every stage's end door lies a mat: "STAGE 3 COMPLETE! +2 WINS", what passing that door pays.
  The same words hang in the doorway, to read from down the room.
- **In Lab HQ.** A golden **x2 WINS** trophy pad east of the spawn (E: the x2 Wins offer), the **TOP 3** podium beside the Most Wins
  board, and under the **WORLDS** vault's name the next sector's: "FROST LAB, LOCKED: pass Stage 20", then "OPEN! Step in".
- **Slime Rush.** Press **RACE** to run five others with a wave of slime rolling in behind.

**Reference.** The genre, the core loop and the numbers' feel follow the Roblox game *[W2🔬] +1 Speed Lab Keyboard Escape!*, studied
from its page and the developer's screenshots:
- a RED LAB vs BLUE LAB team battle with a round clock and "clear stages to score points for your lab";
- "+1 Speed" a step and Levels as walking speed, with Custom Speed;
- a daily streak bonus and a friend bonus;
- "+N / step" treadmills that open with Wins;
- a white-tiled lab with green and white keycaps, stage doors and Recommended Level signs;
- spike presses, a giant rolling ball, a mad scientist chasing you and slime;
- SKIP, rebirth and worlds.

**Our own.** Everything players see and hear:
- the name, Lab HQ, the four sectors and their sixty stages;
- Dr. Mutagen and every hazard;
- the treadmills, pets, eggs, trails and auras;
- the HUD and its art, the Team Battle's bar, screens and results card;
- the icons, the text, the sounds and the music.

**There are no in-app purchases.** Everything costs Wins or Gems earned in the game, and three things can also be had for a rewarded
ad: a revive, a skip, x2 Speed. No Bux are spent anywhere.

It is forked from Lockdown Escape (the newest Legion keyboard escape, the same genre). It shares that game's engine, its server and
race queue with bot takeover, its camera, lighting and quality systems, profiles, saves, play stats, the Bloxity integration and the
test suite. New in this game:
- the Team Battle (server, HUD, results, the screens in Lab HQ, name tags);
- the Lab Streak;
- the spike presses (shared logic, art, hit test, the bots and the autopilot timing them);
- Dr. Mutagen, the steel balls and the flasks;
- the four sectors' looks, Lab HQ's new props, both songs, every text.

## Project layout

| Folder | What it is |
|---|---|
| `client/` | Vite + Three.js client. See the file list below. |
| `server/` | Colyseus 0.18 server. See the file list below. |
| `shared/` | `config.js`: the economy, sectors, the Team Battle (`LABS`, `labPoints`, `battlePrize`), the Lab Streak, pets, treadmills, quests, codes and the four `LEADERBOARDS`. `stages.js`: the kinds of stage (the spike press among them) and each sector's order. `world.js`: where everything stands. `arena.js`: a race's course. `physics.js`. |
| `tests/` | Server, economy and browser test scripts, the cover renderer, the setup-page generator. |
| `tools/` | `local-port.mjs`: the port picker `start-local.bat` uses. |

The client's files:

| File | What it holds |
|---|---|
| `main.js` | Boot, your runner, the hazards and the death screen, the Team Battle's bar and banners, the network (Boxity matchmaker, `?roomId=`), races, the camera, input |
| `world.js` | Lab HQ (with the Team Battle's gate screens) and the Test Track |
| `engine.js` | The renderer, the light rig, the sector skies and ground |
| `keycaps.js` | The instanced keycap floor |
| `stagefx.js` | Spike presses, lasers, steel balls, flasks, glitch and flicker keys |
| `monster.js` | Dr. Mutagen, one draw animated in its vertex shader |
| `arenaview.js` | Slime Rush's lanes and the slime wave |
| `bloxity.js` | Every Boxity SDK call |
| `avatar.js`, `chars.js` | Bloxity avatars, the character kit, custom characters, name tags with your lab |
| `pals.js` | The pets |
| `ui.js`, `index.html` | The HUD, the Team Battle bar and results card, the panels, the death card |
| `icons.js` | The drawn HUD icons, pets and eggs |
| `asmr.js` | The key clacks and effects, synthesised in a worker |
| `audio.js` | The mixer and both songs |

The server's files:

| File | What it holds |
|---|---|
| `RunRoom.js` | The `run` room: steps and their guards, doors, Wins and lab points, the Team Battle's rounds and prizes, the Lab Streak, knock-outs and revives (FREE, Gems, a verified rewarded ad), skips, purchases, rebirths, sectors, tasks, quests, rewards, codes, bots |
| `Match.js` | Slime Rush |
| `bloxity.js` | Token verify with `carriedFrom`, rewarded-ad verify, the leaderboards report, profile stats |
| `legion-room-reporter.js` | Open Rooms |
| `profiles.js` | Profiles in MongoDB on Legion, guest progress adoption |

## Run it locally

Needs Node 20 or newer. Double-click `start-local.bat` (it picks port 3219, or the next free one up to 3225). Or run:

```sh
npm install          # installs client and server too
npm run build        # builds the client into client/dist
npm start            # server + game on http://localhost:3219
```

For development:
- Run `npm run dev:server` and `npm run dev:client`, then open http://localhost:5747.
- The dev server injects `window.BLOXITY_ENV = { env: 'local', ... }` before the game's code (`client/vite.config.js`, serve only).
  A production build is told nothing and Boxity tells it where it runs.
- Dev builds, or a build with `VITE_QA=1`, expose `window.__qa`. `QA=1` on the server lets the client give itself Speed, Wins, a lab's
  points, the round's clock and so on; it is refused on Legion.

## Gameplay

- **Steps.**
  - Run (WASD, the stick, the left stick), and every stride is **+1 Speed and +1 XP times all your boosts**.
  - The boosts:
    - the Lab Streak;
    - rebirths, pets, your trail and aura;
    - Lab Sneakers, the sector you're in, the treadmill you're on;
    - x2 Speed and the Friend Bonus.
  - "All Boosts: x1.35" beside the big Speed number shows them together, with the pets', aura's, trail's and rebirths' own
    multipliers round it, and STATS lists each one.
- **The Lab Streak.** The days in a row you've played: day 1 is x1.35 Speed a step, each day after +0.1, up to x1.95 on day 7 and
  after. Miss a day and it's day 1 again. Its line is at the bottom left (in STATS on a phone).
- **Level is your walking speed.** Level 2 needs 20 XP, then each Level 15% more (Level 10 needs 70). Every Level adds 1.75 to your top
  walking speed: 16 studs a second at Level 1, up to 93 at Level 45. A band across the screen says so each time: "Level Up! 1 » 2,
  Walk Speed 16 » 18". The **CUSTOM SPEED** card lets you walk slower.
- **The Team Battle.**
  - **Labs.** Everyone in a server is in the **RED LAB** or the **BLUE LAB**. A newcomer joins the lab with fewer in it, and
    bots fill the smaller lab (they run the Test Track and score too). "YOU'RE ON BLUE LAB!" greets you.
  - **Points.** Every door that pays Wins scores its stage number for your lab, counted across the sectors (Stage 1 of the Frost Lab
    is 16). Your name tag says your lab, and "+4 BLUE!" pops over your head as you score.
  - **The bar.** The bar at the top shows RED's points, the round's clock over a tug of war between the labs' colours, BLUE's
    points, and YOUR LAB and your points this round. The same scores are on two big screens on Lab HQ's north wall, either side of the Test Track's
    mouth.
  - **The result.** After **5 minutes** the lab with more points wins. The results card shows the winner, both labs' points,
    each lab's best scorers, the MVP, and what you scored and won.
    - A winner who scored gets Wins (a lot, growing with the furthest stage you've passed) and 3 Gems.
    - A loser who scored gets a little.
    - The MVP gets 2 Gems more.
    - Standing about in Lab HQ earns nothing.
  - **The next round.** After a 12-second break it starts in the same room. Nobody is moved anywhere.
- **Treadmills in Lab HQ.** They open with the Wins you've earned in all:
  - Test +1, Lab +2 (10 Wins), Beaker +3 (60), Turbo +5 (300), Frost +8 (1,500), Reactor +12 (25,000), Quantum +20 (1,000,000);
  - Gold +35 (120 Gems) and Plasma +60 (400 Gems).

  Hold **DASH** on a belt to sprint.
- **The Test Track.** Fifteen stages in each of four sectors, between lab doors marked "STAGE N". A **Recommended Level** wall monitor
  stands before each one, and gaps are sized to that Level's walking speed. Every stage is its own challenge, and each sector runs
  through them in its own order:
  - **Open Keys**: barriers to hop, chemical tanks to weave round, slime to jump.
  - **Slime Pools**: key bridges over the slime; further in, a spike press and a single stepping key.
  - **Steel Ball Hill**: the stage is a climb, and giant steel balls roll down its lanes at you.
  - **Mutagen Chase**: Dr. Mutagen bursts from his vent behind the door and comes after you.
  - **Spike Press**: spiked steel presses across the way. They shake, slam down to the floor, and lift again; run under while they're up.
  - **Flicker Keys**: a wave of vanishing keys rolls at you; jump it.
  - **Laser Sweeper**: a laser bar on a striped emitter; jump it as it comes round.
  - **Falling Flasks**: giant potion flasks drop where their shadows grow and splash.
  - **Catwalk**: one narrow walkway over the slime.
  - **Stepping Keys**: keys on steel pillars, too far apart if you're slow.
  - **Glitch Keys**: a bridge of keys that blink out behind you.
  - **Jump Pads**: pads that launch you across slime too wide to jump.
  - **The Big Experiment** (every 15th): everything at once.

  The pits are lime slime in the Green Lab, freezing coolant in the Frost Lab, toxic sludge in Toxic Works and plasma in the Plasma
  Core.
- **Knocked out (the death screen).** A flash, then Boxity's death screen (Boxity shows ads round the game while you're down). Our card
  in the middle of the screen shows what got you and the stage, with three buttons:
  - **REVIVE at Stage N**: FREE once every 3 minutes, else 5 Gems.
  - **▶ WATCH AD**: a FREE revive for a rewarded ad, shown only while Boxity has one.
  - **BACK TO Lab HQ**.

  The buttons wait for Boxity's countdown (at least 4 s on Boxity, none outside it), and nothing ever respawns you by itself. The
  revive stays on offer for 2 minutes. The server decides which stage it is, never further than you got in that life.
- **SKIP.** In a stage, SKIP moves you just inside the next door, for 8 Gems or a rewarded ad. The skipped door pays nothing.
- **Wins.**
  - Passing a stage's end door pays its Wins: x3 the first time each rebirth, and again every 30 seconds.
  - **TO STAGE** (B) and the **Teleport** panel take you back to any stage you've reached this rebirth.
- **Rebirth.** It's free:
  - At Level 10, then 15, 20 ... up to 35.
  - You go back to Level 1 and 0 Speed.
  - In return every step gives x1.5, x2 ... for good.
- **Eggs and pets.** Eight Eggs, from 5 Wins to 3.5M: Test Tube, Slime, Potion, Spark, Frost, Atom, Plasma and Mutant. Each holds five
  pets (50 / 30 / 14 / 5 / 1%), forty in all, from a Lab Rat to the Mutant Dragon. Each pet follows you and multiplies your Speed.
- **Upgrades, for Wins:**
  - Lab Sneakers (more Speed a step), Speed Serum (walk faster), Lab Notes (more XP);
  - Rocket Boots, Long Strides, Lucky Beaker (more Wins), Pet Cage (room for another pet).
- **Trails and auras.**
  - Eight trails for Wins, from Beaker Fizz to Rainbow Reaction.
  - Five auras for Gems, from Bubble Field to Mad Science.
- **Gems buy time and Speed.**
  - **x2 SPEED** and **x2 WINS**; x2 Speed can also be had for 10 minutes for a rewarded ad.
  - Three **+SPEED** packs under the Level bar.
- **The Friend Bonus.** Every other real player in your server adds +10% Speed a step for everyone, up to +50%.
- **The four sectors**, each multiplying Speed and Wins:
  - **The Green Lab**: a bright blue day, white tile walls, green and white keys, lime slime.
  - **The Frost Lab**: an icy haze, white and ice blue, coolant.
  - **Toxic Works**: an amber toxic sunset under a purple sky, orange and purple, toxic sludge.
  - **The Plasma Core**: night, a magenta plasma nebula and a giant planet, glowing keys, plasma.

  The second, third and fourth open at 1, 4 and 8 rebirths, once the last stage before them is passed.
- **Slime Rush** (RACE on the right, or V):
  - Everyone who presses RACE at about the same time goes in one race. Bots fill only the empty places and take over for a
    player who leaves.
  - Six keycap lanes, with slime, barriers, swinging hammers, sliding crates and chemical tanks.
  - The slime wave rolls in behind, faster and faster. First through the gate wins.
- **The rest of a session.**
  - A chain of 46 quests. The early Team Battle ones only ask you to score in a round; winning rounds are long goals later on.
  - 5 Daily Quests a day ("0/5 DONE" on their card); "Score points for your lab" is always one of them.
  - The Lucky Wheel, a 7-day daily reward, playtime gifts at 2 minutes to 2 hours, leaderboards, a TOP 3 podium in Lab HQ, titles
    and a guide of chevrons on the ground.
- **Codes:** `LABRIVALS`, `REDLAB`, `BLUELAB`, `SCIENCE`, `BLOXITY`, `LEGION`, `MUTAGEN`.
- **Pacing.** `tests/economy.mjs` simulated a brand-new player on the real formulas and stages, 25 runs of 60 minutes, on 19 November
  2026.
  - It plays Team Battle rounds every 5 minutes, and its lab wins half of them.
  - A sector is twenty stages now and its last ones are laid out for Level 42, so the first sector lasts about 36 minutes (it was
    about 21 with fifteen stages): a door every half minute or so for the first six minutes, then a rebirth and the long rooms.

  Medians:

  | When | What |
  |---|---|
  | 0:13 | Stage 1 passed: the Clean Room |
  | 0:30 | Stage 2 passed: past the giant in Dr. Mutagen's Office |
  | 0:45 | the Lab Treadmill (+2) opens |
  | 0:54 | Stage 3 passed: Spike Press Row |
  | 1:27 | Stage 4 climbed: the Steel Ball Ramp |
  | 1:50 | Stage 5 passed: the Slime Pit |
  | 2:25 | the Beaker Treadmill (+3) opens |
  | 5:24 | Stage 10 passed |
  | 5:44 | the Turbo Treadmill (+5) opens |
  | 7:40 | Level 20 |
  | 11:39 | Stage 15 passed |
  | 14:23 | First rebirth |
  | 18:03 | Stage 18 passed |
  | 27:11 | Stage 19 passed |
  | 35:46 | Stage 20 passed: the Frost Lab opens |

  It's a simulation, not a playtest.

## Bloxity integration

Everything goes through `client/src/bloxity.js`. Its one `onUserChanged` subscription is the source of truth for who the player is.
`BLOXITY_CODE_METADATA.md` has the developer's answers (canDie, hasScore, the boards, gameplay ads off).

- **Environment.**
  - `env()` returns what Boxity told the page (`Legion.SDK.environment()` / `window.BLOXITY_ENV`), prod when nothing was told.
  - The server reads `BLOXITY_ENV`, `BLOXITY_API_URL`, `BLOXITY_MATCHMAKER_URL`, `BLOXITY_PORTAL_URL` and `BLOXITY_STATIC_URL`.
  - No Boxity host is worked out from the page's own address, and no `api.` / `play.` / `static.bloxity.io` is written anywhere but
    the two prod fallbacks.
- **Connecting.**
  - Every connect calls `Legion.SDK.net.resolveEndpoint('lab-rivals')` and makes a new Colyseus Client on that endpoint.
  - While a server wakes up, it retries with a backoff for a minute.
  - **Nothing ever opens a socket to `lab-rivals.host.bloxity.io`**, which is for HTTP only (`/health`, `/api/stats`).
- **Rooms.**
  - `?roomId=` (Open Rooms, invites, CrazyGames invites) joins that room through its pod first, else matchmaking. The room id is
    reported with `game.updateRoom`.
  - The room's `maxClients` is 16 (`roomSize` in the deploy).
  - Each Team Battle round starts in the same room; nobody is moved.
  - `server/src/legion-room-reporter.js` fills Open Rooms.
- **Identity.**
  - The join options carry `auth.getToken()`. The server verifies it with `POST {BLOXITY_API_URL}/v1/auth/game-token/verify` and uses
    only the returned `user._id`. Without a token or with a refused one, the player is a guest with a server-made id.
  - A sign-in mid-game is verified on the same connection, so nobody leaves their room or their lab.
  - `carriedFrom` guest progress is copied into an account that has none here yet, once only.
- **Avatars** (`avatar.js`). The platform character kit dresses the rig when `character.canDress` says it can. Otherwise:
  - every accessory slot from `getAccessorySlots()`;
  - skins with pants, shirt and face from `getSkinTextureUrlFor`;
  - proportions;
  - custom uploaded characters.

  Only ids are replicated.
- **Death screen.** `deathScreen.show()` on every knock-out on the Test Track:
  - The card's buttons wait for `onCountdown` to reach 0, and respawn only when `respawn()` is true.
  - A race, a rebirth or a world switch while down calls `deathScreen.hide()`.
  - Boxity's "Reset Character" (`respawn_request`) is still instant for a living player.
- **Ads.**
  - `ads.onBreakStart` / `onBreakEnd` stop and restart the frame loop and the sound.
  - `declareScreens` lists these screens, and `ads.screen()` is reported as each opens:
    - `panel`;
    - `lobby` (Slime Rush's start line);
    - `results` (a race's results, and the Team Battle's results card every round);
    - `gameplay` (no banners in play, the developer's choice).
  - Rewarded ads `revive`, `skip-stage` and `x2-speed` show only while `isAvailable()`, and are granted only after the server verifies
    the token (`POST /v1/ads/reward/verify`).
- **Leaderboards.** The client calls `leaderboard.define()` right after init. The server reports from its own state, batched every
  15 s and only for `legion_` ids:
  - **Wins**: sum, weekly;
  - **Top Speed**: best, all time;
  - **Highest Stage**: best, weekly, counted across sectors;
  - **Lab Points**: sum, weekly (the points you score for your lab).

  The Leaderboards panel opens Boxity's own (`leaderboard.open`).
- **Also wired:**
  - **Chat:** Boxity chat bubbles over heads, found by the Boxity id in `PlayerState.bx`.
  - **Emotes:** `registerFeature('emotes')` at boot; `play_emote` is played and relayed.
  - **Settings:** `master_volume`, `music_volume`, `graphics_quality`, `camera_sensitivity` and `show_fps`.
  - **Lifecycle:** `loadingStep` and `loadingEnd`, with no start menu.
  - **ESC** closes the results card, then opens Boxity's menu.
  - **CrazyGames:** P is never bound (race is V), and there is no fullscreen button of the game's own.

## Controls

| Action | Keyboard / mouse | Controller | Touch |
|---|---|---|---|
| Run | WASD / arrows | Left stick | The stick |
| Jump | Space | A | JUMP |
| Dash / sprint on a treadmill (hold) | Shift, F, Enter | RT, LT or X | DASH |
| Revive (death card) / use | E | Y | The card's buttons |
| Back to Lab HQ (death card) / home | R | L3 | The card's button |
| Camera | Drag, wheel | Right stick | Drag, pinch |
| Race | V | LB | RACE |
| Close the round's results | Esc | B | OK |
| Pets / Upgrades / Teleport / Wheel / Quests / Shop / Sound | J / U / T / C / Q / G / M | D-pad to the HUD, A to press | The buttons |

## Sound

- **Key clacks and effects**: synthesised sample by sample in a worker while the world builds.
  - Each key press is a click, a clack and a thock.
  - The spike presses land with a heavy thud and a shake, and a falling flask smashes with a thud and a splash of potion.
  - The other effects: a slime splash, Dr. Mutagen's roar, the slime wave's hiss, the lab alarm.
- **Music**, all our own, each rendered once into loops by an OfflineAudioContext behind the loading screen (never note by note in
  play):
  - **"Beaker Bop"**, the Lab HQ song: a cheerful, bubbly tune in G major at 118 BPM, lightly swung. It has a marimba lead, woodblock
    ticks, a bouncing bass, a theremin-like mad-science "ooh" and glass bells fizzing like bubbles.
  - **"Overclock Rush"**, the Test Track and race song: a driving chase in A minor at 168 BPM. It has a sixteenth-note bass,
    four-on-the-floor, the lab alarm wailing up a fifth every four bars with the lead answering, and bells and toms at full intensity.

## Graphics and performance

- **Lighting and materials:**
  - The top games' lighting: hemisphere 1.1, ambient 0.45, sun 1.5, PCF shadows, no tone mapping.
  - **Only matte Lambert and unlit materials.** No reflections, environment maps, bloom or post-processing.
  - Each sector's mood tints the rig and sets its sky: blue day, amber toxic sunset, icy haze, or night with stars, a magenta nebula
    and a giant planet.
- **Our own art, all built in code:**
  - **Lab HQ:** a great hall. White tiled walls over a blue-grey dado, pillars, tall windows, a ceiling of steel trusses and light
    panels. In its north wall is the Test Track's mouth; either side of it are the Team Battle's two live screens (RED LAB and BLUE
    LAB, their points and the clock, a crown over the lab ahead), "TEAM BATTLE" over each. Red and blue lab banners hang along
    the wall, clear of Dr. Mutagen's cell and the booths. Beside the Most Wins board stands the TOP 3 podium, the week's three names
    on its steps; east of the spawn, the FREE GIFT crate and the x2 WINS trophy pad.
  - **Words over the world.** The HUD's own lines (the quest, your lab's line, a stage's name and bar, the multipliers, the streak)
    each sit on a dark backing, so a sign or a key's letter behind them never runs into them. No sign stands in the top middle of
    the screen from the spawn, where the HUD's words are. Around them stand lab treadmills, the Upgrade Lab and Rebirth Reactor booths, Eggs in cages, the Worlds vault,
    the SLIME RUSH gate, wall-monitor leaderboards (Most Wins, Fastest, Lab Points), giant flask mascots, and Dr. Mutagen asleep in
    his containment cell ("DO NOT WAKE").
  - **The Test Track:** rooms. White tiled walls with a blue-grey dado and a green stripe, pillars, windows, yellow arrows, pipes
    and X-braced trusses under the ceiling, light panels in it. Between two rooms a wall with a wide doorway: steel jambs striped
    like blast doors, a keypad, "STAGE N" on a screen over it, chain-link gates swung open. Green and white keycaps underfoot. The
    ceiling rides the floor up every ramp, so the steel ball rooms climb like stairwells.
  - **The giant:** Dr. Mutagen at twice the chaser's size, upright, walking his round on the server's clock; his footfalls thud and
    shake the screen as he comes near.
  - **The spike presses:** a hazard-striped steel slab across the way with rows of steel spikes under it. It shakes before it drops,
    slams down and lifts again. It hangs from a striped gantry whose piston rods slide in and out of their housings, over a striped
    impact plate.
  - **Dr. Mutagen:** one geometry, one draw, animated in its vertex shader.
    - His look: a hulking hunched scientist with mutant skin, round goggles with glowing lenses, wild white hair, a lab coat with
      flapping tails, rubber gloves and boots. He has a look of his own in each sector.
    - His animations: a lumbering zombie run with his arms out, grabbing when close, bursting up from his vent, a sleeping pose.
    - He has fewer parts on Low.
  - **The steel balls:** brushed steel plates and seams, a band of stripes in the sector's colour that shows them roll.
  - **The flasks:** round-bottomed glass flasks with a coloured potion, a cork and a highlight.
- **Keeping it fast** (all kept from Lockdown Escape):
  - The keycap floor is instanced in chunks, with the press and ripple in the vertex shader.
  - Static things are merged per stage into BatchedMeshes culled per stage; hazards and props are instanced. The spike presses are one
    instanced draw a sector, in the doors' cheap material.
  - Every shader, panel and emoji is warmed up behind the loading screen.
  - The HUD writes only on change and moves its bars with transforms; the Team Battle bar is no exception.
  - The gate screens redraw only when a score or the clock's second changes, and only while you're near Lab HQ.
- **Weak devices start on Low:** phones, and PCs with 4 cores or fewer, 4 GB or less, or an older Intel or small Radeon GPU. Below
  54 FPS the resolution steps down first, then the quality.

- **Measured** on this PC on 19 November 2026, after the lab went indoors (`node tests/perf.mjs`). Setup:
  - Intel UHD Graphics on ANGLE D3D11, Chrome headless, a 144 Hz display.
  - The automatic resolution step-down was switched off, so these are the worst case.
  - Frames drawn per second, with the 95th percentile frame interval in brackets. *Paced* means the game drew every other refresh of
    the fast screen, by design when frames are uneven.

  | Device | Running the Test Track (autopilot) | Sprinting on a treadmill | At a door | In a Mutagen Chase | At the spawn | In a race | Load + join (dev build) |
  |---|---|---|---|---|---|---|---|
  | Desktop, 1920x1080, High | 82 paced (20.8 ms) | 63 paced (13.9 ms) | 71 paced (7.1 ms) | 69 paced (7.2 ms) | 66 paced (13.9 ms) | 72 paced (7.1 ms) | 7.7 s |
  | Desktop, 1600x900, Medium | 98 (20.8 ms) | 63 paced (13.9 ms) | 70 paced (7.2 ms) | 67 paced (13.8 ms) | 70 paced (7.2 ms) | 143 (7.2 ms) | 5.0 s |
  | **Weak laptop**: CPU throttled 4x, 1366x768, Low | 64 (27.8 ms) | 59 (34.6 ms) | 59 paced (14 ms) | 58 (27.8 ms) | 72 paced (20.9 ms) | 82 (20.9 ms) | 15.9 s |
  | **Phone**: 844x390 @2x, touch, Low, CPU 4x | 56 (34.8 ms) | 72 paced (27.7 ms) | 70 paced (20.8 ms) | 66 (27.8 ms) | 66 paced (13.8 ms) | 76 paced (14 ms) | 13.7 s |
  | **Phone**: 390x844 @2x, touch, Low, CPU 4x | 75 paced (20.8 ms) | 67 paced (13.8 ms) | 69 paced (13.7 ms) | 72 paced (20.7 ms) | 70 paced (7.1 ms) | 70 paced (7.2 ms) | 10.9 s |

  Draw calls stayed at 16 to 36 a frame and triangles at 41k to 153k: the rooms' walls and ceilings are a few big quads in batches
  that throw no shadows, and the yard, the far buildings and the lab block that used to stand under the track are no longer drawn.
- **Against the outdoor version of this game** (same PC, same scenarios, earlier the same day): nothing got slower. The weak laptop
  ran the Test Track at 52 FPS outdoors and 64 indoors, the desktop on High at 50 and 82. Numbers on this PC move between runs by
  ten or so, so read that as "no cost", not as a measured gain.
- **Caveats**:
  - Frames over 50 ms: up to 5 to 7 in a 6-second window on the desktops and the weak laptop while running (mostly when a stage first
    comes into view). Only 0 to 2 at a door, in a chase, at the spawn or in a race.
  - The phones are simulated (a desktop chip and a throttled CPU). Nothing has been measured on a real phone or on the Legion servers
    yet.

- **The CPU profile** (`tests/perf.mjs profile`: unminified dev build, weak laptop, Low, CPU 4x, running the Test Track):
  - Self time: 35.6% `(program)` (the browser's and the driver's own work), 4.5% idle, 3.8% Three.js `setProgram`; no function of the
    game's own over 1.2%.
  - Layout and style reads in the frame loop: 0.00%. Audio-node calls: 0.28%.
  - A frame's work: about 1.1 ms update, 0.3 ms camera and sky, 3.5 ms render.

## Testing

Test tools install on their own: `npm --prefix tests install`. Browser runs need Chrome.
- They use their own ports (3226 / 5747; `TEST_PORT` and `VITE_PORT` move them), so a running game on 3219 is left alone.
- Run browser suites one at a time.

- **`tests/server.test.mjs`**: the whole loop and its guards, headless. Among them:
  - steps (x1.35 on day 1 of the Lab Streak), treadmills and the move guard;
  - doors, Wins and **lab points**;
  - knock-outs and revives;
  - spending, rewards, SKIP, rebirth and sectors, the Friend Bonus;
  - **the Team Battle**:
    - the labs even;
    - the round ending with the leading lab's win;
    - a scorer paid, a non-scorer not;
    - the MVP, the break, the next round at 0 - 0;
    - the streak's multiplier;
  - Slime Rush's queue, bots, the slime wave and prizes;
  - nonsense messages, saves.
- **`tests/smoke.mjs`**: the page loads and joins, music loops, steps count x1.35, a Speed pack, SKIP, and the death card. Then a
  **stand-in Boxity SDK** whose death screen counts down 4 to 0 checks:
  - `init` with the slug, emotes registered, the four boards declared (`labpoints` among them);
  - screens declared and `gameplay` reported, `loadingEnd` once;
  - pressing a button during the countdown does nothing, and REVIVE respawns only on `respawn() === true`;
  - an ad break pauses the frame loop and resumes it;
  - **a round's end shows the results card and reports `results`, closing it reports `gameplay`**.
- **`tests/autopilot.mjs`**: the autopilot plays the whole loop (doors, a knock-out and revive, treadmills, Custom Speed), full Slime
  Rushes on all four maps, and a run in each other sector.
- **`tests/passable.mjs`**: every stage of every sector is passed at its Recommended Level (the autopilot times the spike presses and
  waits for the giant to walk on).
- **`tests/hazards.mjs`**: Dr. Mutagen, the flicker wave and the steel balls each knock you out when you stand still.
- **`tests/extras.mjs`**: what the indoor lab added, with real key presses: the x2 WINS pad and a SKIP STAGE pad (E, the question,
  the skip), the giant stomping you and the death card saying so, the Worlds vault's sign (LOCKED, then OPEN), and W held along a
  wall through three doorways without ever sticking.
- **`tests/signs-check.mjs`**: every floating sign against every other (two closer together than their own sizes are over each
  other from wherever you look) and against the ceiling.
- **`tests/latency.mjs`**: two players through a 350 ms round trip.
- **`tests/reconnect.mjs`**: a dropped connection in Lab HQ and in a race, short and long.
- **`tests/gamepad.mjs`**: the whole game on a controller.
- **`tests/prod.mjs`**: the production build with real input only, a portrait phone by touch included.
- **`tests/economy.mjs`**: the pacing above, Team Battle rounds included.
- **`tests/screens.mjs`**: every screen at 390x844, 360x800, 375x667, a landscape phone and desktop.
- **`tests/perf.mjs`**: frame rates.
- **Screenshots:**
  - `tests/battle-look.mjs`: the Team Battle bar and results card on three screen sizes.
  - `tests/press-look.mjs`: a Spike Press stage. `tests/rooms-look.mjs`: Lab HQ and the first rooms.
  - `tests/stage-trace.mjs`: the autopilot through one stage, its position and every knock-out's cause printed.
  - `look.mjs`, `lobby-look.mjs`, `chase-look.mjs`, `race-look.mjs`, `stages.mjs`.
- **`tests/probe.mjs`**: prints a page's errors while it loads (for a page that never gets past its loading screen).
- **`tests/sdk-check.mjs`**: the real Boxity SDK on a local page: it loads, `environment()`, `onUserChanged`, and no socket to
  `<id>.host.bloxity.io`. **`tests/sdk-probe.mjs`** prints what the SDK script left on the page.
- **`tests/covers.mjs`**: renders the two store covers from the game. **`tests/setup-page.mjs`**: writes `bloxity-setup.html`.

**Last full run, 20 November 2026 (after the indoor rework and its polish pass):**

| Suite | Result |
|---|---|
| Server | 125 / 125, the Team Battle and the Lab Streak included |
| Smoke | all good, the stand-in SDK's death screen and the round's `results` screen included |
| Autopilot | all good: full races, a run in every sector, no snaps |
| Every stage passable | 80 / 80, at most 1 knock-out on any stage; all twelve Giant's Rooms with none |
| Hazards | all good |
| The indoor lab's extras (`tests/extras.mjs`) | all good: both pads' prompts and offers, a skip, the giant's stomp and its death card, the vault's sign, three doorways along a wall |
| Signs (`tests/signs-check.mjs`) | all clear: 100 signs, none over another, none in a ceiling |
| Latency (350 ms) | all good (its bot is watched from Lab HQ now, see below) |
| Reconnect | all good |
| Controller | all good |
| Production build, real input | all good, a keyboard run and a touch run hugging the wall through the doorways included |
| Screens | 0 problems at 13 sizes with the new HUD and its backings; the death screen's toasts measured against the battle bar |
| The real Boxity SDK on a local page (`tests/sdk-check.mjs`) | all good |

Fixed along the way (the indoor rework):
- **Stuck on a doorway.** Running along a wall with only forward held, your body caught on the wall beside the opening and stopped.
  The production test's wall-hugging run found it. The doorway now slides you into the opening a stud earlier
  (`shared/world.js` doorLimit).
- **A safe strip past the giant.** His round stopped short of both walls, so hugging one walked past him untouched. It reaches the
  walls now.
- **The autopilot hopped early.** It held JUMP from 26 studs short of a slime pit, and holding JUMP keeps jumping, so in the new
  Mutagen Sprint it came down in the pit every time. It holds JUMP from the take-off on.
- **Glitch keys nobody could steer.** At 77 studs a second the bridge stepped sideways twice within eight studs. After a step it now
  runs straight for a while, longer the faster the stage.
- **The battle bar in the Bloxity corner** on a 360-wide phone, after the round buttons moved to the right column. It sits under the
  corner's height now.
- The passable test counted a door as paid by the Wins on screen, which the autopilot had already spent on an Egg. It counts doors.
- The store covers' run now jumps the low barrier, so the runner isn't hidden behind it.

Fixed in the polish pass (overlaps and bugs, 20 November):
- **The Team Battle screens were dark.** Each stood in the same plane as its bezel and flickered behind it. They stand proud of it.
- **Signs over signs.** "TEAM BATTLE" and "THE TEST TRACK" stood one into the other over the mouth, the first into the ceiling, and
  both under the HUD's words on a phone. "TEAM BATTLE" is over each screen now. "FREE GIFT" stood in front of the treadmills' signs
  from the spawn: the crate is on the east side. `tests/signs-check.mjs` keeps watch.
- **The podium hid its own board.** It stands beside the Most Wins board now, not in front of it.
- **Two lab banners were hidden** behind Dr. Mutagen's cell and a booth. All four hang on open wall.
- **A stage's Wins couldn't be read at its door**: the sign was at the wall, off a phone's screen and behind the HUD's cards on a
  desktop. It's a WIN mat on the floor and a sign in the doorway now.
- **The HUD's words ran into the world's.** The quest line, your lab's line, a stage's bar, the multipliers and the streak's lines
  had no backing: over a sign's or a key's letters they read as one. Each has a dark backing.
- **Toasts over the battle bar** while knocked out (desktop and a phone upright). They sit under it.
- **"You fell in the slime!" when the giant stomped you.** The death card says "Stomped by the giant Dr. Mutagen!".
- "DAILY QUESTS" ran out of its card on a wide screen; the quests panel said "Daily Tasks".
- The Worlds vault's round door was a blank grey disc from Lab HQ's side: spokes and a hub on both faces.
- **The latency test's bot check** watched from deep in a stage, where with twenty stages a bot may not pass in time, and then from
  in the bots' way, where a rival right up against the camera isn't drawn (its place read as a jump). It watches from the side of
  Lab HQ.

Not checked: nothing here has been played by a person yet, on a real phone, or on the Legion servers. Frame rates were measured
before the polish pass (it added twenty floor quads, a trophy and a few signs) and not again.

## Deploying (prod + stage)

`.github/workflows/deploy.yml` deploys every push.

- **Platforms.**
  - `main` goes to the production channel and `dev` to the playtest channel.
  - Every push goes to **prod always**, and to **stage too** once the repo has `LEGION_DEPLOY_TOKEN_STAGE`.
  - A manual run (Actions → Run workflow, `target`: staging or prod) deploys any branch to one platform.
- **Isolation.**
  - The platforms are separate matrix jobs (`fail-fast: false`), so a stage failure never blocks prod.
  - A staging job reads only the stage token and fails clearly when it's missing.
  - There is one client build for both, with no environment baked in.
  - Server images are tagged per platform (`stage-<channel>-<sha>` on stage).

Repository secrets to add:
- **`LEGION_DEPLOY_TOKEN`**, from hosting.bloxity.io.
- **`LEGION_DEPLOY_TOKEN_STAGE`**, from hosting.stage.bloxity.io, to ship to stage too. See docs.bloxity.io › Environments › Getting
  your game onto stage.

Not hosted yet: the folder isn't a git repo. Once the repo exists and the secret is in, every push to `main` deploys to
https://lab-rivals.play.bloxity.io.

`bloxity-setup.html` has every field of Bloxity's Create New Game form with copy buttons, and the two covers.

Play stats are at `GET /api/stats?key=<stats key>&days=7` on the host. The key is in `server/STATS_KEY.local.txt` (git-ignored); only
its SHA-256 is in the code.
