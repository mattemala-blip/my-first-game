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

Every double jump randomly selects an effect: Wizard has 50 combinations (10 palettes × 5 sparkle shapes), Warrior has 8 moves (4 directional slashes and 4 slash/flip combinations), Elf has 5 flip styles, and World Banker has 150 paper-throw combinations (25 document sets × 6 throw styles, with varied counts, sizes, and directions). Papers feature budget/report/GDP/loan/data/plan headings and lines, tables, or charts. Random choices can repeat; these are variations, not a fixed sequence.

Milestone dialogue randomly picks from 24 complaints and avoids immediately repeating the previous line, including across restarts. Grass blades replace the colorful ground dots. The title credit reads “A game by Matteo Malacarne.”

A glowing blue coin appears repeatedly at random intervals of 120–300 seconds of active gameplay and awards 20 gold (1,000 score points). The first appears 2–5 minutes after starting; restarting resets its schedule. Background-tab time does not count.

Validated all 135 effect variants in Chromium, distinct Wizard/paper combinations, random milestone selection, rare-coin spawn branches and reward, credit, mobile controls/layout/restart, and browser-error-free drawing.

Latest refinement: each sheet in a paper throw has a distinct heading, chosen from 25 document subjects. Warrior slashes rotate a fixed-length arm in different directions, with six flips as alternatives. Browser checks rendered all 150 paper combinations and 30 Warrior moves, verified exact page text, and simulated 20 minutes with recurring blue coins and 2–5 minute gaps.

## Purple treasure

One purple coin appears per run at a randomly scheduled time from 5 to 20 minutes of active gameplay. It awards 50,000 bonus points, separate from gold. Missing it does not cause another to spawn. Restarting schedules a new one. Blue coins continue on their independent 2–5 minute schedule. The footer uses matching gold, blue, and purple coin drawings with their point values. Warrior now randomly selects from eight fixed-arm slash/flip moves.

Validated purple timing boundaries, one spawn over a simulated 25-minute run, the exact 50,000-point reward, restart reset, all eight Warrior drawing paths, coin legend, and mobile layout/jumping in Chromium.
