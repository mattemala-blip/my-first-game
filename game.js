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
  scoreLabel.textContent = goldLabel.textContent = '0';
  state = 'playing';
  overlay.hidden = true;
  canvas.focus({ preventScroll: true });
  document.querySelector('#announcement').textContent = 'Quest started.';
}
function jump() {
  if (state === 'playing' && player.y >= ground - player.height - 1) {
    player.velocity = -650;
    for (let i = 0; i < 8; i++) particles.push({ x: player.x + 15, y: ground, vx: -Math.random() * 100, vy: -Math.random() * 90, life: 0.4, color: '#a9ffe0' });
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
  if (player.y === ground - player.height) player.velocity = 0;
  nextSpawn -= dt;
  if (nextSpawn <= 0) {
    const slime = Math.random() > 0.5;
    obstacles.push({ x: 990, y: ground - (slime ? 34 : 48), width: slime ? 42 : 30, height: slime ? 34 : 48, slime });
    // Coins sit over each obstacle to reward a well-timed jump.
    coins.push({ x: 998, y: ground - 112, width: 22, height: 22 });
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
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#252947'); sky.addColorStop(0.7, '#536481'); sky.addColorStop(1, '#78ac9b');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 960, 480);
  circle(760, 102, 38, '#fff1b8'); circle(775, 90, 35, '#303753');
  for (let i = 0; i < 28; i++) circle((i * 137 + 31) % 960, (i * 43) % 200 + 20, i % 3 === 0 ? 2 : 1, '#d5c9ef');
  for (let layer = 0; layer < 3; layer++) {
    const spacing = 160 - layer * 25;
    const offset = (distance * (0.12 + layer * 0.15)) % spacing;
    for (let i = -1; i < 10; i++) {
      const x = i * spacing - offset;
      const top = 125 + layer * 48 + (i % 3) * 18;
      rect(x + 32, top + 40, 12, ground - top, ['#394761', '#324f60', '#285457'][layer]);
      ctx.fillStyle = ['#394761', '#324f60', '#285457'][layer];
      ctx.beginPath(); ctx.moveTo(x + 38, top); ctx.lineTo(x - 14, top + 145); ctx.lineTo(x + 90, top + 145); ctx.closePath(); ctx.fill();
    }
  }
  rect(0, ground, 960, 92, '#25363d'); rect(0, ground, 960, 8, '#80d6aa'); rect(0, ground + 8, 960, 8, '#40896f');
  for (let i = 0; i < 25; i++) {
    const x = i * 47 - distance % 47;
    rect(x, ground + 28 + i % 3 * 16, 16, 4, '#394c51');
    circle(x + 10, ground - 5, 3, i % 2 ? '#df9bff' : '#ffcb7b');
  }
  for (const coin of coins) { circle(coin.x + 11, coin.y + 11, 12, '#ffcf65'); circle(coin.x + 11, coin.y + 11, 8, '#c98732'); rect(coin.x + 9, coin.y + 5, 4, 12, '#ffe4a0'); }
  for (const o of obstacles) {
    if (o.slime) {
      ctx.fillStyle = '#ef7fbd'; ctx.beginPath(); ctx.ellipse(o.x + 21, o.y + 20, 23, 20, 0, Math.PI, 2 * Math.PI); ctx.lineTo(o.x + 44, ground); ctx.lineTo(o.x - 2, ground); ctx.fill();
      rect(o.x + 10, o.y + 15, 5, 7, '#542b62'); rect(o.x + 27, o.y + 15, 5, 7, '#542b62');
    } else {
      ctx.fillStyle = '#b99aff'; ctx.beginPath(); ctx.moveTo(o.x + 15, o.y); ctx.lineTo(o.x + 30, o.y + 24); ctx.lineTo(o.x + 24, ground); ctx.lineTo(o.x + 3, ground); ctx.lineTo(o.x, o.y + 24); ctx.closePath(); ctx.fill();
      rect(o.x + 12, o.y + 17, 5, 26, '#e5ccff');
    }
  }
  const x = player.x, y = player.y;
  const bob = state === 'playing' && player.velocity === 0 ? Math.sin(elapsed * 20) * 2 : 0;
  circle(x + 18, ground + 3, 18, '#182c3655');
  rect(x + 4, y + 28 + bob, 28, 22, '#8459ce'); rect(x + 8, y + 45, 9, 9, '#322c58'); rect(x + 23, y + 45, 9, 9, '#322c58');
  rect(x + 10, y + 14 + bob, 22, 17, '#ffd3a3'); rect(x + 26, y + 18 + bob, 4, 5, '#273548');
  ctx.fillStyle = '#aa83ee'; ctx.beginPath(); ctx.moveTo(x - 5, y + 15 + bob); ctx.lineTo(x + 14, y - 14 + bob); ctx.lineTo(x + 34, y + 15 + bob); ctx.closePath(); ctx.fill();
  rect(x - 7, y + 13 + bob, 45, 5, '#c6a6ff'); rect(x + 1, y + 32 + bob, 35, 6, '#7ef3c1');
  rect(x + 41, y + 15 + bob, 4, 35, '#d4b178'); circle(x + 43, y + 11 + bob, 7, '#7ef3c1'); circle(x + 43, y + 11 + bob, 3, '#e1fff3');
  for (const p of particles) { ctx.globalAlpha = Math.min(1, p.life * 3); rect(p.x, p.y, 4, 4, p.color); } ctx.globalAlpha = 1;
}
function frame(time) {
  const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.035) : 0;
  previousTime = time;
  if (state === 'playing' && !document.hidden) update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
