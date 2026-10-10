# Rune Runner

A colorful, endless fantasy runner made with plain HTML, CSS, and JavaScript. No build tools, downloads, accounts, API keys, or backend are required to play.

## Play

Open `index.html` in your browser and choose **Wizard**, **Elf**, **Warrior**, or **World Banker**, then click **Start quest** (or press Space). All characters have the same abilities.

- Press **Space**, click the game, or tap it on your phone to jump. Press/click/tap again in the air for a magic double jump. Two quick clicks work; you get two jumps before you must land.
- Glowing high coins can only be collected with a double jump. Time your second jump shortly after the first to rise higher.
- Travel through slowly changing forests, mountain ranges, and castle lands. Moonlit colors and terrain blend through 30 distinct 90-second chapters, with no palette cycle in the first 20 minutes. Scenery is generated from world positions instead of a repeating short sequence.
- Jump over pink slimes and purple crystals. Touching an obstacle ends the quest.
- Collect gold during jumps: each coin adds 50 points. Running also adds points.
- Speed increases by 8 pixels per second every 500 points (including gold bonuses). Try to beat your best score!
- Click **Restart quest**, or press Space on the game-over screen, to try again.

Your best score is saved in this browser when browser storage is available. There is no shared leaderboard.

## Run locally

Double-click `index.html`, or use a local server:

```sh
cd /workspace/my-first-game
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` on the same computer. Stop the server with Ctrl+C.

## Publish for free with GitHub Pages

1. Put `index.html`, `style.css`, `game.js`, and this README in the root of the `mattemala-blip/my-first-game` repository on GitHub's **main** branch. If these changes are still only in your development workspace, commit and push them (or open and merge a pull request) first. From a checkout on the main branch:
   ```sh
   git add index.html style.css game.js README.md
   git commit -m "Add Rune Runner browser game"
   git push origin main
   ```
   Cloud tasks may use a working branch; in that case push that branch and merge its pull request into main through GitHub. Do not assume a local commit is already published.
2. For free GitHub Pages on a personal GitHub Free account, make sure the repository is **public**. If it is private, review its contents before changing visibility in **Settings → General → Danger Zone → Change repository visibility**.
3. Open the repository on GitHub: https://github.com/mattemala-blip/my-first-game
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select **main** and **/ (root)**, then click **Save**.
7. Wait for the Pages deployment to finish (usually a few minutes). Check the **Actions** tab if deployment fails. Return to **Settings → Pages** and click **Visit site**.

The expected public game address is:

**https://mattemala-blip.github.io/my-first-game/**

This URL works only after the files reach main and GitHub Pages deployment succeeds. If GitHub displays a different address, use the address shown in Settings → Pages.

## Exactly how to play and share

1. After deployment finishes, open the public URL above on your computer or phone.
2. Click **Start quest**.
3. Press Space, click the game, or tap the game to jump. Jump slightly before each obstacle reaches the mage.
4. After losing, click **Restart quest** to play again.
5. Copy the public URL from your browser's address bar and paste it into a text, email, or group chat. Friends open that same link and play immediately; no account or installation is needed.

Suggested message:

> I made a tiny fantasy game! Can you beat my score? Play here: https://mattemala-blip.github.io/my-first-game/ — press Space or tap to jump.

## Files and beginner-friendly changes

- `index.html`: page, scoreboard, and start/restart screen.
- `style.css`: colors, layout, and responsive styling.
- `game.js`: drawing, jumping physics, random obstacles, coins, score, and collisions.

Change the starting speed (`270`), speed step (`8` in `speedForScore`), jump velocity (`-650`), or gravity (`1700`) in `game.js` to adjust difficulty. Graphics are drawn with Canvas, so there are no missing image assets or external fonts.

## Validation

Tested in headless Chromium: starting, Space/click/tap jumps, coin collection and score, obstacle collision, game-over screen, restart, high-score persistence, natural obstacle spawning, and mobile layout. JavaScript syntax also passed `node --check game.js`.

The character and landscape update was also tested in Chromium: four character selections; mouse, keyboard, and touch double jumps; a third jump prevented; landing and restart reset jumps; high coins missed by a single jump and collected with a double jump; smooth region transitions; mobile character-menu layout.

## Character effects and living scenery

The four names are **Wizard**, **Elf**, **Warrior**, and **World Banker**. The Wizard double-jumps with sparkles; the Elf spins around without particles; the Warrior moves sword and shield without particles; the World Banker throws papers upward. All retain identical jump physics. The World Banker has two visible eyes behind glasses.

Scenery is drawn with fully opaque shapes: slowly changing mountains and rolling countryside, rivers with bridges, evergreen trees and orchards, castles, manors, cottages, fences, windmills, fields, sheep, deer, clouds, and flapping birds. Objects scroll into view instead of fading through one another.

Validated the new labels and each character's jump pose/effect in Chromium, and checked that scenery drawing remains at full opacity across all five regions. The existing keyboard/mouse/touch, coin-height, landing/reset, and mobile-layout checks also passed.

Obstacle types, single/paired clusters, spacing, and coin counts, heights, and offsets are randomized each run. Patterns include coin-free challenges and high double-jump rewards. Spawn spacing leaves time to land between obstacle groups.

Latest validation: Chromium checks for character-specific particles/poses, 500-point speed thresholds, 21 distinct minute palettes, gradual transitions, varied random patterns, jump physics, and mobile double-jump/restart. An accelerated 20-minute simulation (collisions bypassed for long-run inspection) completed with finite positions and bounded object counts. Live GitHub Pages deployment is separate from these local checks.

## Gloomy forest update

Dense, solid evergreen silhouettes frame occasional distant landmarks. Rivers, buildings, animals and birds are spaced farther apart; the 30 slowly blending regions now form a 45-minute palette cycle. The World Banker throws five larger paper sheets with folded corners and written lines.

Ten randomly selected fantasy obstacles: slimes, crystals, spikes, cursed mushrooms, skulls, stumps, treasure chests, gargoyles, cauldrons, and thorns. Every 10,000 points, a four-second speech bubble shows a different running complaint, also announced for screen readers. Restart resets the milestone counter.

Validated all obstacle drawing paths, milestone messages and threshold stability, upward paper movement, particle-free Elf spin, mobile jump/restart, and another accelerated 20-minute run in Chromium.

## Random effects and rare treasure

Every double jump randomly selects an effect: Wizard has 50 combinations (10 palettes × 5 sparkle shapes), Warrior has 8 moves (7 sword hacks and 1 forward flip), Elf has 5 flip styles, and World Banker has 150 paper-throw combinations (25 document sets × 6 throw styles, with varied counts, sizes, and directions). Papers feature budget/report/GDP/loan/data/plan headings and lines, tables, or charts. Random choices can repeat; these are variations, not a fixed sequence.

Milestone dialogue randomly picks from 24 complaints and avoids immediately repeating the previous line, including across restarts. Grass blades replace the colorful ground dots. The title credit reads “A game by Matteo Malacarne.”

A glowing blue coin appears repeatedly at random intervals of 120–300 seconds of active gameplay and awards 20 gold (1,000 score points). The first appears 2–5 minutes after starting; restarting resets its schedule. Background-tab time does not count.

Validated all 135 effect variants in Chromium, distinct Wizard/paper combinations, random milestone selection, rare-coin spawn branches and reward, credit, mobile controls/layout/restart, and browser-error-free drawing.

Latest refinement: each sheet in a paper throw has a distinct heading, chosen from 25 document subjects. Warrior slashes rotate a fixed-length arm in different directions, with six flips as alternatives. Browser checks rendered all 150 paper combinations and 30 Warrior moves, verified exact page text, and simulated 20 minutes with recurring blue coins and 2–5 minute gaps.

## Purple treasure

One purple coin appears per run at a randomly scheduled time from 5 to 20 minutes of active gameplay. It awards 50,000 bonus points, separate from gold. Missing it does not cause another to spawn. Restarting schedules a new one. Blue coins continue on their independent 2–5 minute schedule. The footer uses matching gold, blue, and purple coin drawings with their point values. Warrior now randomly selects from eight fixed-arm slash/flip moves.

Validated purple timing boundaries, one spawn over a simulated 25-minute run, the exact 50,000-point reward, restart reset, all eight Warrior drawing paths, coin legend, and mobile layout/jumping in Chromium.

## Treasure challenges

Warrior now has exactly seven directional sword hacks and one forward flip. Wizard retains 50 random variations; World Banker retains 150. Blue coins have a plain center stripe, without “20,” including in the legend.

Each blue or purple spawn randomly chooses one of four obstacle layouts. Blue coins demand a timed double jump above or just after obstacles; purple coins sit higher among tighter obstacle groups. Layout offsets scale with speed and leave reaction time, while normal obstacle spawning pauses around their approach. Blue recurrence and once-per-run purple scheduling remain in place.

Browser validation found successful timed double jumps for all 24 combinations of coin type, layout, and three representative speeds (0/30,000/70,000 points), and rendered all 208 Wizard/Warrior/World Banker variants without browser errors.

## Discreet scenery and updated timing

Background portals and crystal groves have been removed. Remaining landmarks are 25% smaller and use muted colors. Character sprites are scaled around their feet to similar standing heights while retaining the same shared gameplay hitbox. World Banker sheets are 15% smaller than the previous version.

Current coin timing: first blue coin scheduled randomly at 2–3 minutes; later blue coins every 1–3 minutes. Purple coin scheduled once per run at 8–20 minutes. These clocks use active gameplay time, reset on restart, and retain randomized treasure obstacle challenges.

Validated timing in an accelerated 21-minute Chromium simulation, exact paper scaling, rendering for all four characters, and collectibility of all treasure layouts at three speeds.

Latest update: Elf narrowed another 10% (81% of its original width). Random character comments now appear every five minutes of active gameplay, beginning at five minutes, instead of score thresholds. Restart resets the timer; time in a hidden browser tab does not count.

## Original fantasy lo-fi music

`assets/fantasy-lofi.mp3` is an original rendered 72 BPM fantasy lo-fi loop, with a soft melody, chords, bass, and percussion. `music.js` plays it through native browser audio. No external audio services are needed. Click Start quest to begin music; use Music on/off to toggle it. Music starts enabled on each page visit, pauses in hidden tabs, and recovers on return or the next game click/tap. Browser playback restrictions show “Tap to play music” and allow retry without disabling audio.

Validated MP3 decoding and non-silent samples, advancing playback time, mute/unmute, recovery after blocked playback and navigation, and no browser errors in Chromium. Device mute and browser sound permissions still control whether playback can be heard.

Latest update: sky coins bob at a steady, faster rate (6 radians/second, ±4 pixels), independent of running speed. Music replaced with the native audio player and bundled original MP3.

## Three-minute song and mobile welcome

The original soundtrack is now a full 180-second arrangement at 72 BPM, with an introduction, main theme, open-landscape section, brighter variation, quiet bridge, and homecoming. Notes wrap across the loop boundary rather than ending with silence. Browser tests verified exact decoded duration, varying section content, and native playback crossing the loop boundary.

On devices with a touch-oriented primary pointer, the welcome screen displays “Turn your phone in landscape mode.” Verified on a mobile browser viewport, with the message hidden on desktop.

## Five-song fantasy lo-fi suite

The soundtrack now contains five original three-minute compositions in one continuous 15-minute audio file: Moonlit Trail, Elven Lanterns, Mountain Watch, Forgotten Kingdom, and Homeward Stars. Each has a distinct melody and chord progression, with evolving sections. Sustained notes carry across song boundaries, and the end wraps into song one without a silent gap. All remain at 72 BPM in a compatible fantasy lo-fi style.

The mobile landscape instruction now uses a large, bright mint banner with bold text. Extra mobile canvas height keeps menu controls visible.

Validated exactly 900 seconds of decoded audio, distinct content across all five songs, non-silent transitions, playback across all four internal boundaries and the loop back to song one, and mobile banner/start controls. The soundtrack is about 11 MB.

The reproducible composer is `scripts/render_soundtrack.py` (Python with NumPy); it renders `/tmp/rune-suite.wav`. Encode with `ffmpeg -i /tmp/rune-suite.wav -codec:a libmp3lame -b:a 96k assets/fantasy-lofi.mp3`. These tools are only needed to regenerate music; playing requires only a browser.

## Random obstacle sizes and middle coins

All ten obstacle types now randomly use small (75%), medium (100%), or large (125%) size, with collision boxes scaled alongside the artwork. Normal obstacle groups mix random types/sizes and spacing. Gold coins randomly appear at low, middle, and sky heights with varied counts and horizontal gaps; sky coins keep bobbing. Treasure challenges also use random obstacle sizes.

Validated all three sizes, ten types, three coin-height bands, randomized placements, ground alignment, rendering, and collectibility of all treasure challenge layouts at three representative speeds in Chromium.

## Fantasy wildlife and timed complaints

Random complaints appear at 3, 6, 8, 10, 12 minutes and every two minutes thereafter, measured in active gameplay time. All coins now bob gently by ±2.5 pixels, including blue and purple treasure.

The forest has 20 creature designs: wolf, dire wolf, fox, arctic fox, stag, doe, elk, reindeer, unicorn, forest pony, wild horse, bear, boar, badger, hare, moon rabbit, lynx, panther, griffin, and hippogriff. Castles randomly vary across 20 combinations of architecture and details. Three muted wizard tower designs have a 2.5% chance per widely spaced scenery slot. Each run schedules exactly three distant dragon passes in separate windows (3–6, 11–15, and 21–26 minutes); shorter runs may see fewer. Scenery remains decorative.

Validated complaint thresholds, bobbing for all coin categories, all creature/castle/tower drawing paths, dragon schedule reset, and collectibility of treasure challenges at three speeds in Chromium.

## A different forest every run

Wildlife now has ten regular forest species: wolf, fox, stag, doe, elk, bear, boar, badger, hare, and lynx. Every restart picks a new scenery seed and world starting offset, shuffles the 30 landscape chapters, and chooses a different starting point within the first chapter. Background variety changes independently of score and gameplay distance; transitions remain gradual.

Validated ten animal drawing paths, six distinct restart scenery seeds/starts/orders, smooth chapter boundaries, and score/distance resets in Chromium.

Latest scenery update: ground animals removed. Distant birds and three per-run dragon windows remain. Rare pairs of bats appear in widely spaced sky slots with a 6% chance per slot, substantially less frequently than birds. Checked 150 scenery samples in Chromium without browser errors.

Latest wildlife timing: dragons recur indefinitely. The first is scheduled at 3–8 minutes, then each following pass at a random 5–8 minute interval. Only the last pass and next timestamp are retained, so long runs do not accumulate dragon records. Restart resets this schedule.

Birds now use wider-spaced slots and a 30% appearance chance. Bats use even wider slots with a 6% chance; lone black wolves in the distance use the same slot spacing and chance as bats, with independent selection. All are decorative.

Validated exact dragon timing bounds, no early first pass, twelve repeated passes with valid gaps, restart reset, and 150 scenery samples without browser errors in Chromium.

Latest scenery settings: bats and wolves each have a 15% chance per 1,500-background-pixel slot. Dragons now use scenery placement instead of a timer: 5% per 3,000-pixel slot, retaining animated fire breath. Birds retain 30% per 1,000-pixel slot. Random scenery seeds vary placement each run.

Double jumps have quiet original sound effects in `assets/sounds`, played by `sounds.js`: sword swoosh for Warrior hacks, sparkle chimes for Wizard, spin whoosh for Elf, and paper rustle for World Banker. The Warrior flip has no sword sound. Wizard staff tilts slightly during the effect. Chromium verified all four sound triggers and scenery/animation drawing without browser errors.

## White creatures and temporary testing mode

Foreground trees are rooted in a solid terrain bank instead of appearing above unrelated distant scenery. White dragons with blue fire have a 1% chance per 1,000-pixel sky slot; white wolves with red eyes have a 2% chance per 1,000-pixel scenery slot. These use independent slots from the regular variants. Warrior sound is a quiet metallic sword “schiing.”

Speed stops increasing at 150,000 points (2,670 pixels/second). Temporary invincibility is currently ON: set `const invincible = false` in `game.js` to restore obstacle collisions. Coin collection and scoring continue normally. Validated speed cap, obstacle-contact immunity, grounded terrain, white-creature/fire rendering and rarity sampling in Chromium.

Latest scenery refinements: river crossings reserve clear space from buildings, towers, trees, and small props; bridge height aligns with the river. Colored field strips removed and replaced by eight tiny random fantasy props: treasure chest, rune stone, campfire, sword in stone, mushrooms, lantern shrine, banner, and cairn. Props anchor to the foreground bank. Palette stages now last 80 seconds rather than 90, maintaining smooth transitions and a 40-minute cycle. Warrior audio now has a sharper metallic attack and ringing overtones. Temporary invincibility remains ON.

Validated 200 scenery samples, all eight prop designs, river clearance, and retention of invincibility and the speed cap in Chromium.

Background rollback: restored the layout before river-clearance changes, eliminating the moving exclusion zones that made trees pop in/out. Kept eight tiny fantasy decorations instead of field strips, and palette stages now last 75 seconds. Metallic sword sound and temporary invincibility are retained. Validated restored scenery and all eight props in Chromium.

River-and-bridge crossings now use 8,400-background-pixel spacing instead of 2,800, reducing frequency by a factor of three. Mountains select one of ten subtle, stable shape profiles randomly per scenery slot. The bottom-left Pause/Resume button freezes the entire game and displays PAUSED while music keeps playing; paused time does not count toward gameplay events. Verified frozen game state, continuing music, Space safety, resume, and all ten mountain profiles in Chromium.
