# Rune Runner

A colorful, endless fantasy runner made with plain HTML, CSS, and JavaScript. No build tools, downloads, accounts, API keys, or backend are required to play.

## Play

Open `index.html` in your browser and click **Start quest** (or press Space).

- Press **Space**, click the game, or tap it on your phone to jump.
- Jump over pink slimes and purple crystals. Touching an obstacle ends the quest.
- Collect gold during jumps: each coin adds 50 points. Running also adds points.
- The game gradually speeds up. Try to beat your best score!
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

Change the starting speed (`270`), maximum speed (`470`), jump velocity (`-650`), or gravity (`1700`) in `game.js` to adjust difficulty. Graphics are drawn with Canvas, so there are no missing image assets or external fonts.

## Validation

Tested in headless Chromium: starting, Space/click/tap jumps, coin collection and score, obstacle collision, game-over screen, restart, high-score persistence, natural obstacle spawning, and mobile layout. JavaScript syntax also passed `node --check game.js`.
