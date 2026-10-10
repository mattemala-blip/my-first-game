// No libraries needed: the entire game is drawn with the Canvas API.
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const goldLabel = document.querySelector('#gold');
const bestLabel = document.querySelector('#best');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start');
const ground = 388;
const player = { x: 155, y: ground - 54, width: 34, height: 54, velocity: 0 };
let state = 'ready';
let character = 'wizard';
let jumps = 0;
let elapsed = 0, distance = 0, gold = 0, score = 0, nextSpawn = 1.5;
let obstacles = [], coins = [], particles = [];
let previousTime = 0;
let best = 0;
try { best = Number(localStorage.getItem('rune-runner-best')) || 0; } catch { /* Storage is optional. */ }
bestLabel.textContent = best;

function startGame() {
  elapsed = distance = gold = score = 0;
  nextSpawn = 1.5;
  obstacles = []; coins = []; particles = [];
  player.y = ground - player.height;
  player.velocity = 0;
  jumps = 0;
  character = document.querySelector('input[name=hero]:checked').value;
  scoreLabel.textContent = goldLabel.textContent = '0';
  state = 'playing';
  overlay.hidden = true;
  canvas.focus({ preventScroll: true });
  document.querySelector('#announcement').textContent = 'Quest started.';
}
function jump() {
  if (state !== 'playing' || jumps >= 2) return;
  jumps++;
  player.velocity = jumps === 2 ? -620 : -650;
  const magic = jumps === 2;
  for (let i = 0; i < (magic ? 24 : 8); i++) {
    particles.push({ x: player.x + 17, y: magic ? player.y + 30 : ground,
      vx: (Math.random() - 0.5) * (magic ? 300 : 100), vy: (Math.random() - 0.5) * 180,
      life: magic ? 0.7 : 0.4, color: magic ? ['#fff3b0', '#b99aff', '#7ef3c1'][i % 3] : '#a9ffe0', magic });
  }
}
function endGame() {
  state = 'over';
  best = Math.max(best, score);
  try { localStorage.setItem('rune-runner-best', String(best)); } catch { /* Still playable without storage. */ }
  bestLabel.textContent = best;
  document.querySelector('#title').textContent = 'Quest complete!';
  document.querySelector('#message').textContent = `You scored ${score} and gathered ${gold} gold. Your best: ${best}. One more adventure?`;
  startButton.textContent = 'Restart quest';
  overlay.hidden = false;
  startButton.focus({ preventScroll: true });
  document.querySelector('#announcement').textContent = `Game over. Score ${score}. Restart quest to play again.`;
}
startButton.addEventListener('click', startGame);
canvas.addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || event.repeat) return;
  if (state !== 'playing' && event.target.closest('.characters')) return;
  event.preventDefault();
  if (state === 'playing') jump(); else startGame();
});
// Ignore time spent in a background tab, so returning never causes a surprise collision.
document.addEventListener('visibilitychange', () => { previousTime = 0; });
function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
function update(dt) {
  elapsed += dt;
  const speed = Math.min(470, 270 + elapsed * 4);
  distance += speed * dt;
  player.velocity += 1700 * dt;
  player.y = Math.min(ground - player.height, player.y + player.velocity * dt);
  if (player.y === ground - player.height) { player.velocity = 0; jumps = 0; }
  nextSpawn -= dt;
  if (nextSpawn <= 0) {
    const slime = Math.random() > 0.5;
    obstacles.push({ x: 990, y: ground - (slime ? 34 : 48), width: slime ? 42 : 30, height: slime ? 34 : 48, slime });
    // Coins sit over each obstacle to reward a well-timed jump.
    coins.push({ x: 998, y: ground - 112, width: 22, height: 22 });
    // Single jumps reach roughly 125px. These sky coins sit above that reach.
    coins.push({ x: 1050, y: ground - 232, width: 22, height: 22, high: true });
    nextSpawn = 1.25 + Math.random() * 0.65;
  }
  for (const obstacle of obstacles) {
    obstacle.x -= speed * dt;
    // A slightly forgiving hitbox makes close jumps feel fair.
    if (overlaps({ x: player.x + 7, y: player.y + 8, width: 20, height: 44 }, obstacle)) { endGame(); return; }
  }
  coins = coins.filter(coin => {
    coin.x -= speed * dt;
    if (overlaps(player, coin)) {
      gold++;
      goldLabel.textContent = gold;
      for (let i = 0; i < 10; i++) particles.push({ x: coin.x, y: coin.y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, life: 0.6, color: '#ffda70' });
      return false;
    }
    return coin.x > -30;
  });
  obstacles = obstacles.filter(obstacle => obstacle.x > -60);
  particles = particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
  score = Math.floor(distance / 12) + gold * 50;
  scoreLabel.textContent = score;
}
function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function circle(x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
function draw() {
  drawLandscape();
  rect(0, ground, 960, 92, '#25363d'); rect(0, ground, 960, 8, '#80d6aa'); rect(0, ground + 8, 960, 8, '#40896f');
  for (let i = 0; i < 25; i++) {
    const x = i * 47 - distance % 47;
    rect(x, ground + 28 + i % 3 * 16, 16, 4, '#394c51');
    circle(x + 10, ground - 5, 3, i % 2 ? '#df9bff' : '#ffcb7b');
  }
  for (const coin of coins) { if (coin.high) { circle(coin.x + 11, coin.y + 11, 17, '#b99aff55'); } circle(coin.x + 11, coin.y + 11, 12, '#ffcf65'); circle(coin.x + 11, coin.y + 11, 8, '#c98732'); rect(coin.x + 9, coin.y + 5, 4, 12, '#ffe4a0'); }
  for (const o of obstacles) {
    if (o.slime) {
      ctx.fillStyle = '#ef7fbd'; ctx.beginPath(); ctx.ellipse(o.x + 21, o.y + 20, 23, 20, 0, Math.PI, 2 * Math.PI); ctx.lineTo(o.x + 44, ground); ctx.lineTo(o.x - 2, ground); ctx.fill();
      rect(o.x + 10, o.y + 15, 5, 7, '#542b62'); rect(o.x + 27, o.y + 15, 5, 7, '#542b62');
    } else {
      ctx.fillStyle = '#b99aff'; ctx.beginPath(); ctx.moveTo(o.x + 15, o.y); ctx.lineTo(o.x + 30, o.y + 24); ctx.lineTo(o.x + 24, ground); ctx.lineTo(o.x + 3, ground); ctx.lineTo(o.x, o.y + 24); ctx.closePath(); ctx.fill();
      rect(o.x + 12, o.y + 17, 5, 26, '#e5ccff');
    }
  }
  drawCharacter(player.x, player.y, character);
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life * 3);
    if (p.magic) { rect(p.x - 5, p.y - 1, 10, 2, p.color); rect(p.x - 1, p.y - 5, 2, 10, p.color); }
    else rect(p.x, p.y, 4, 4, p.color);
  }
  ctx.globalAlpha = 1;
}
function frame(time) {
  const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.035) : 0;
  previousTime = time;
  if (state === 'playing' && !document.hidden) update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Each region lasts about 45–75 seconds. Smooth interpolation avoids scene cuts.
const regions = [
  { sky: [37, 41, 71], horizon: [120, 172, 155], trees: [40, 84, 87], mountain: [62, 77, 108], forest: 1, peaks: 0.2, castle: 0 },
  { sky: [87, 73, 123], horizon: [231, 177, 155], trees: [92, 106, 86], mountain: [129, 115, 147], forest: 0.45, peaks: 0.7, castle: 0.4 },
  { sky: [46, 93, 139], horizon: [170, 217, 229], trees: [55, 102, 116], mountain: [102, 144, 178], forest: 0.15, peaks: 1, castle: 0.1 },
  { sky: [108, 66, 103], horizon: [249, 191, 134], trees: [105, 103, 81], mountain: [137, 108, 132], forest: 0.35, peaks: 0.4, castle: 1 },
  { sky: [30, 42, 76], horizon: [95, 149, 158], trees: [40, 90, 91], mountain: [61, 85, 120], forest: 0.85, peaks: 0.6, castle: 0.3 }
];
function landscapeAt(travel) {
  const progress = travel / 22000;
  const index = Math.floor(progress) % regions.length;
  const fraction = progress % 1;
  const blend = fraction * fraction * (3 - 2 * fraction);
  const a = regions[index], b = regions[(index + 1) % regions.length];
  const result = {};
  for (const key of Object.keys(a)) result[key] = Array.isArray(a[key])
    ? a[key].map((value, i) => value + (b[key][i] - value) * blend)
    : a[key] + (b[key] - a[key]) * blend;
  return result;
}
function rgb(color) { return `rgb(${color.map(Math.round).join(',')})`; }
function drawLandscape() {
  const land = landscapeAt(distance);
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, rgb(land.sky)); sky.addColorStop(1, rgb(land.horizon));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 960, 480);
  circle(760, 102, 38, '#fff1b8'); circle(775, 90, 35, rgb(land.sky));
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 28; i++) circle((i * 137 + 31) % 960, (i * 43) % 200 + 20, i % 3 === 0 ? 2 : 1, '#ede1ff');
  ctx.globalAlpha = 0.3 + land.peaks * 0.7;
  const mountainOffset = distance * 0.055;
  for (let i = Math.floor(mountainOffset / 280) - 1; i < Math.floor(mountainOffset / 280) + 5; i++) {
    const x = i * 280 - mountainOffset;
    const height = 110 + (Math.sin(i * 7.3) + 1) * 55;
    ctx.fillStyle = rgb(land.mountain);
    ctx.beginPath(); ctx.moveTo(x - 60, ground); ctx.lineTo(x + 140, ground - height); ctx.lineTo(x + 340, ground); ctx.fill();
    ctx.fillStyle = '#e4e5ef'; ctx.beginPath(); ctx.moveTo(x + 140, ground - height); ctx.lineTo(x + 100, ground - height + 42); ctx.lineTo(x + 150, ground - height + 31); ctx.lineTo(x + 180, ground - height + 42); ctx.fill();
  }
  ctx.globalAlpha = land.castle;
  const castleOffset = distance * 0.085;
  for (let i = Math.floor(castleOffset / 1100); i <= Math.floor(castleOffset / 1100) + 1; i++) {
    const x = i * 1100 + 520 - castleOffset;
    const stone = rgb(land.mountain.map(v => v + 25));
    rect(x, 255, 150, 133, stone);
    for (let t = 0; t < 3; t++) {
      const towerX = x - 22 + t * 84;
      rect(towerX, 220, 40, 168, stone);
      for (let tooth = 0; tooth < 3; tooth++) rect(towerX + tooth * 15, 210, 10, 14, stone);
      rect(towerX + 16, 238, 7, 16, '#ffe6a1');
      rect(towerX + 18, 187, 3, 25, stone);
      ctx.fillStyle = '#df91ba'; ctx.beginPath(); ctx.moveTo(towerX + 21, 187); ctx.lineTo(towerX + 45, 194); ctx.lineTo(towerX + 21, 202); ctx.fill();
    }
    rect(x + 60, 335, 26, 53, '#32425c');
  }
  for (let layer = 0; layer < 3; layer++) {
    ctx.globalAlpha = land.forest * (0.6 + layer * 0.2);
    const spacing = 160 - layer * 25, offset = distance * (0.12 + layer * 0.15);
    for (let i = Math.floor(offset / spacing) - 1; i < Math.floor(offset / spacing) + 10; i++) {
      const x = i * spacing - offset, top = 125 + layer * 48 + (Math.sin(i * 3.7) + 1) * 18;
      const color = rgb(land.trees.map(v => v + (2 - layer) * 8));
      rect(x + 32, top + 40, 12, ground - top, color);
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + 38, top); ctx.lineTo(x - 14, top + 145); ctx.lineTo(x + 90, top + 145); ctx.closePath(); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
function drawCharacter(x, y, hero) {
  const bob = state === 'playing' && player.velocity === 0 ? Math.sin(elapsed * 20) * 2 : 0;
  y += bob;
  circle(x + 18, ground + 3, 18, '#182c3655');
  const outfits = { wizard: '#8459ce', elf: '#52966a', warrior: '#a7b9d0', accountant: '#50607d' };
  rect(x + 4, y + 28, 28, 22, outfits[hero]);
  rect(x + 8, y + 45 - bob, 9, 9, '#322c58'); rect(x + 23, y + 45 - bob, 9, 9, '#322c58');
  rect(x + 10, y + 14, 22, 17, '#ffd3a3'); rect(x + 26, y + 18, 4, 5, '#273548');
  if (hero === 'wizard') {
    ctx.fillStyle = '#aa83ee'; ctx.beginPath(); ctx.moveTo(x - 5, y + 15); ctx.lineTo(x + 14, y - 14); ctx.lineTo(x + 34, y + 15); ctx.closePath(); ctx.fill();
    rect(x - 7, y + 13, 45, 5, '#c6a6ff'); rect(x + 1, y + 32, 35, 6, '#7ef3c1');
    rect(x + 41, y + 15, 4, 35, '#d4b178'); circle(x + 43, y + 11, 7, '#7ef3c1'); circle(x + 43, y + 11, 3, '#e1fff3');
  } else if (hero === 'elf') {
    rect(x + 7, y + 8, 27, 9, '#e2c078');
    ctx.fillStyle = '#ffd3a3'; ctx.beginPath(); ctx.moveTo(x + 7, y + 18); ctx.lineTo(x - 3, y + 10); ctx.lineTo(x + 7, y + 25); ctx.fill();
    rect(x + 6, y + 36, 28, 4, '#a7d77b');
    ctx.strokeStyle = '#e6c48f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 34, y + 29, 19, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 34, y + 10); ctx.lineTo(x + 34, y + 48); ctx.stroke();
    rect(x + 29, y + 28, 29, 2, '#f7e6bd');
  } else if (hero === 'warrior') {
    rect(x + 5, y + 6, 31, 12, '#cedae8'); rect(x + 8, y + 17, 6, 12, '#8798b2'); rect(x + 20, y - 3, 7, 10, '#e5809d');
    rect(x + 38, y + 9, 6, 31, '#e6f2ff'); rect(x + 32, y + 37, 18, 4, '#ffdc7c'); rect(x + 39, y + 41, 4, 10, '#a37459');
    circle(x + 3, y + 37, 13, '#7c8fa9'); circle(x + 3, y + 37, 8, '#ebc872');
  } else {
    rect(x + 7, y + 7, 28, 9, '#5b3f35'); rect(x + 17, y + 28, 8, 19, '#f4f0e5'); rect(x + 20, y + 31, 3, 14, '#ef8a9e');
    ctx.strokeStyle = '#192338'; ctx.lineWidth = 2;
    ctx.strokeRect(x + 12, y + 18, 8, 7); ctx.strokeRect(x + 24, y + 18, 8, 7); rect(x + 20, y + 20, 4, 2, '#192338');
    rect(x + 35, y + 33, 19, 17, '#ba875c'); rect(x + 40, y + 29, 9, 5, '#e3b98c'); rect(x + 43, y + 39, 3, 5, '#ffdc7c');
  }
}
