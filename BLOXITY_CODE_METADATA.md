---
game: Lab Rivals
slug: lab-rivals
canDie: true
hasScore: true
multiplayer: true
hostedOnBoxity: true
roomSize: 16
gameplayAds: false
inAppPurchases: false
---

# Lab Rivals: Boxity integration notes

Answers from the developer (2026-11-19):

- **canDie: true.** These knock the player out on the Test Track:
  - the giant scientist walking round his room;
  - spike presses;
  - giant rolling steel balls;
  - laser sweepers;
  - falling flasks;
  - Dr. Mutagen (the chaser);
  - the slime (and each sector's coolant, sludge or plasma).

  A knock-out opens `Legion.SDK.deathScreen.show()` and the game's own death card in the centre of the screen (`#revive` in
  `client/index.html`, `reviveShow` in `client/src/ui.js`). The card has three buttons:
  - **REVIVE at Stage N.** FREE once every 3 minutes, else 5 Gems.
  - **▶ WATCH AD.** A rewarded ad (`revive`) for a FREE revive, shown only while `ads.isAvailable()`.
  - **BACK TO Lab HQ.**

  Every button stays greyed out under Boxity's countdown, and respawns only when `death.respawn()` returns true. Nothing respawns the
  player on a timer.
  - The server keeps the revive on offer for 120 s while the card is up. After that only BACK TO Lab HQ is left.
  - A race start, a rebirth or a world switch while knocked out calls `deathScreen.hide()`.
  - Boxity's "Reset Character" (`respawn_request`) still sends a living player straight back to Lab HQ.

  Slime Rush (the race) has no respawn: a racer caught by the slime wave is out of that race and gets the results card.
- **hasScore: true.** Four boards, declared in `shared/config.js` (`LEADERBOARDS`).
  - The client calls `leaderboard.define()` right after init.
  - The server reports scores from server-owned state (`server/src/bloxity.js` `queueScore`, `server/src/RunRoom.js`) and batches them
    every 15 s.

  | id | label | order | mode | format | reset |
  |---|---|---|---|---|---|
  | `wins` | Wins | desc | sum | compact | weekly |
  | `speed` | Top Speed | desc | best | compact | none |
  | `stage` | Highest Stage | desc | best | number | weekly |
  | `labpoints` | Lab Points | desc | sum | number | weekly |

  When each one is reported:
  - `wins`: every Win as it's earned (doors, rewards, Team Battle prizes, races).
  - `speed`: once a second, only when the player's top Speed has gone up.
  - `stage`: when a door is passed further than ever before, counted across the sectors (Stage 1 of the Frost Lab is 21: a sector has 20 stages).
  - `labpoints`: the points every door scores for the player's lab in the Team Battle (its stage number, counted across the sectors),
    as they're scored.

  Only `legion_` identities are reported. The Leaderboards panel's button opens Boxity's panel (`leaderboard.open('wins')`).
- **Gameplay banners: off.** The screens declared:
  - `panel`: Shop, Pets, Upgrades, Quests, Daily, Wheel, Rebirth, Teleport, Leaderboards, Gifts, Settings, Stats.
  - `lobby`: Slime Rush's start line.
  - `results`: a race's results, and the Team Battle's results card at the end of every round.
  - `gameplay`: declared with no banners.

  There is no start menu: the player lands straight in Lab HQ.
- **No in-app purchases.** Everything costs Wins or Gems earned in the game, so there is no Gems purchase and no webhook.
- **Rewarded ads:**
  - `revive`: a FREE revive on the death card.
  - `skip-stage`: a FREE SKIP of the stage you're in.
  - `x2-speed`: x2 Speed for 10 minutes.

  Each is offered only while `ads.isAvailable()`. The server checks every token with `POST {BLOXITY_API_URL}/v1/ads/reward/verify`
  before granting anything (`onAdRevive`, `onAdSkip`, `onAdX2`).

The Team Battle (this game's own, on the server):
- Everyone in a server is in the RED LAB or the BLUE LAB. A newcomer joins the lab with fewer in it; bots fill the smaller one.
- Every paid door scores its stage number for the lab. The labs' points are in the room's state (`red`, `blue`, `bEnd`, `bRound`,
  `bBreak`), and each player's own points are in their `PlayerState` (`lab`, `pts`).
- After 5 minutes the lab with more points wins. Its scorers get Wins and Gems, the other lab's scorers a little, and the MVP 2 Gems more.
  A player who scored nothing gets nothing.
- A 12-second break with the results card follows, then the next round starts in the same room. Nobody is moved to another room.

Where things live:

- **Client SDK wrapper:** `client/src/bloxity.js`. It holds:
  - the only `onUserChanged` subscription;
  - the environment helper `env()`;
  - avatar slots, the character kit and custom characters;
  - chat, ads, the death screen, leaderboards and settings.
- **Avatars:** `client/src/avatar.js`.
  - It draws every slot from `avatar.getAccessorySlots()`.
  - It uses the platform character kit when `character.canDress` is true.
  - It loads custom characters from `avatar.getCharacterFor`, and takes skins from `avatar.getSkinTextureUrlFor`.
- **Server:** `server/src/bloxity.js` handles:
  - identity: `POST /v1/auth/game-token/verify`, with `carriedFrom` guest progress;
  - rewarded-ad verification;
  - the leaderboards report;
  - profile stats (Lab Points and Team Battles won among them).

  Guest progress adoption is in `server/src/profiles.js` (`adoptGuestProgress`). Open Rooms come from
  `server/src/legion-room-reporter.js` (`installRoomReporter()` after `listen`).
- **Matchmaking:** `client/src/main.js` `serverEndpoint()` resolves a pod with `Legion.SDK.net.resolveEndpoint('lab-rivals')` on every
  connect.
  - It builds a new Client each time and retries with a backoff for up to a minute.
  - No socket ever opens to `lab-rivals.host.bloxity.io`.
  - A `?roomId=` joins that room through its pod's relay first (`{playUrl}/v1/dir/lab-rivals/list`), else normal matchmaking.
- **Chat:** with Boxity chat, each player's latest line shows over their head, found by their Boxity id (`PlayerState.bx`).
- **Emotes:** `game.registerFeature('emotes')` runs right after init. `play_emote` plays on your avatar and is relayed to the room.
- **Ad breaks:** `ads.onBreakStart` stops the frame loop and suspends the audio; `onBreakEnd` resumes both.
