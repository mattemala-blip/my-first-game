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
let jumpEffect = 0;
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
  jumpEffect = 0;
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
  if (magic) jumpEffect = 0.6;
  const effectColors = { wizard: ['#fff3b0', '#b99aff', '#7ef3c1'], elf: ['#a9d875', '#66b985', '#e0f2ab'], warrior: ['#e6f2ff', '#ffdc7c', '#a7b9d0'], accountant: ['#f5efde', '#89bbdf', '#ffdc7c'] };
  for (let i = 0; i < (magic ? 24 : 8); i++) {
    particles.push({ x: player.x + 17, y: magic ? player.y + 30 : ground,
      vx: (Math.random() - 0.5) * (magic ? 300 : 100), vy: (Math.random() - 0.5) * 180,
      life: magic ? 0.7 : 0.4, color: magic ? effectColors[character][i % 3] : '#a9ffe0', magic, effect: character });
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
  jumpEffect = Math.max(0, jumpEffect - dt);
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
    if (p.magic && p.effect === 'wizard') { rect(p.x - 5, p.y - 1, 10, 2, p.color); rect(p.x - 1, p.y - 5, 2, 10, p.color); }
    else if (p.magic && p.effect === 'elf') { ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(p.x, p.y, 5, 2, p.life * 8, 0, Math.PI * 2); ctx.fill(); }
    else if (p.magic && p.effect === 'accountant') { rect(p.x, p.y, 7, 5, p.color); rect(p.x + 1, p.y + 2, 4, 1, '#50607d'); }
    else rect(p.x, p.y, p.magic ? 7 : 4, 2, p.color);
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
// Solid objects enter from offscreen. Geography and colors morph slowly, never fade.
function polygon(points, color) {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
}
function sceneryItems(spacing, speed, paint) {
  const offset = distance * speed;
  const first = Math.floor(offset / spacing) - 2;
  for (let i = first; i < first + Math.ceil(960 / spacing) + 5; i++) paint(i * spacing - offset, i);
}
function drawLandscape() {
  const land = landscapeAt(distance);
  ctx.globalAlpha = 1;
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, rgb(land.sky)); sky.addColorStop(1, rgb(land.horizon));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 960, 480);
  circle(760, 102, 38, '#fff1b8'); circle(775, 90, 35, rgb(land.sky));
  sceneryItems(360, 0.03, (x, i) => {
    const y = 90 + Math.sin(i * 2) * 25;
    circle(x, y, 18, '#dfe5ed'); circle(x + 22, y - 8, 24, '#dfe5ed'); circle(x + 48, y, 18, '#dfe5ed');
  });
  sceneryItems(280, 0.055, (x, i) => {
    const height = 65 + land.peaks * 125 + (Math.sin(i * 7.3) + 1) * 35;
    polygon([[x - 60, 320], [x + 140, 320 - height], [x + 340, 320]], rgb(land.mountain));
    polygon([[x + 140, 320 - height], [x + 110, 352 - height], [x + 142, 342 - height], [x + 170, 352 - height]], '#e4e5ef');
  });
  // Rolling countryside is opaque and masks the mountain bases.
  const grass = rgb(land.trees.map((v,i) => v + [25,45,0][i]));
  const hills = [[0, 388], [0, 304]];
  for (let x = 0; x <= 980; x += 20) hills.push([x, 295 + Math.sin((x + distance * 0.09) / 180) * 20]);
  hills.push([980,388]); polygon(hills, grass);
  // A broad river winds through the fields, with solid banks and ripples.
  sceneryItems(1700, 0.12, (x, i) => {
    polygon([[x, 306], [x + 28, 306], [x + 140, 335], [x + 75, 362], [x + 230, 388], [x + 110, 388], [x + 10, 364], [x + 75, 338]], '#82cbd3');
    for (let k=0;k<4;k++) rect(x + 35 + k * 16, 336 + k * 11, 27, 2, '#d4f3e5');
    // Wooden bridge.
    rect(x + 28, 353, 103, 8, '#af8058'); rect(x + 28, 346, 103, 3, '#dfb480');
    for(let k=0;k<5;k++) rect(x + 30 + k*24, 346, 3, 17, '#805e48');
  });
  sceneryItems(430, 0.17, (x, i) => {
    const type = ((i % 7) + 7) % 7;
    const y = 335 + Math.sin(i * 2.4) * 10;
    if (type === 0 || type === 4) {
      // Castles and country manors alternate along the road.
      const castle = type === 0;
      rect(x, y - 64, 115, 64, castle ? '#a8b4c4' : '#ecd2a4');
      if (castle) {
        for(let t=0;t<2;t++) { const tx=x-12+t*110; rect(tx,y-95,30,95,'#92a2b7'); for(let k=0;k<3;k++)rect(tx+k*12,y-104,7,12,'#92a2b7'); rect(tx+12,y-81,7,15,'#ffe0a0'); }
      } else polygon([[x-10,y-64],[x+55,y-102],[x+125,y-64]], '#865e79');
      for(let k=0;k<4;k++)rect(x+12+k*26,y-49,9,14,'#ffe5ab');
      rect(x+48,y-27,20,27,'#635776');
    } else if (type === 2 || type === 5) {
      // Villages, cottages, orchards and fences.
      for(let h=0;h<2;h++) { const hx=x+h*60; rect(hx,y-32,48,32,'#f0d7af'); polygon([[hx-6,y-32],[hx+24,y-58],[hx+54,y-32]],h?'#966f91':'#b27468'); rect(hx+7,y-23,10,10,'#83bed2');rect(hx+29,y-21,10,21,'#765948'); }
      rect(x-10,y+10,145,3,'#ecd1a1'); for(let k=0;k<7;k++)rect(x-10+k*24,y+3,3,17,'#ecd1a1');
    } else if(type===3) {
      // Windmill with slowly turning sails.
      polygon([[x,y],[x+12,y-65],[x+40,y-65],[x+52,y]],'#e5d9ba');
      ctx.save();ctx.translate(x+26,y-57);ctx.rotate(elapsed*0.35);for(let k=0;k<4;k++){ctx.rotate(Math.PI/2);rect(0,-3,44,6,'#796552');rect(14,-9,30,6,'#faf0d6');}ctx.restore();
    } else {
      for(let k=0;k<5;k++) rect(x+k*20,y-3,16,5, k%2?'#e1bd70':'#b3c97a');
    }
  });
  sceneryItems(130, 0.24, (x, i) => {
    const variation = (Math.sin(i * 4.7)+1)/2;
    const size = 22 + land.forest*32 + variation*18;
    const base = 359 + Math.sin(i)*12;
    rect(x+19,base-size,8,size,'#86644b');
    if(i%3===0) polygon([[x+23,base-size*2],[x-10,base-15],[x+56,base-15]],rgb(land.trees));
    else { circle(x+23,base-size-16,size*0.6,rgb(land.trees));circle(x+5,base-size-7,size*0.45,rgb(land.trees));circle(x+39,base-size-8,size*0.5,rgb(land.trees)); if(i%4===0) {circle(x+12,base-size-14,3,'#f1aa7a');circle(x+32,base-size-21,3,'#f1aa7a');} }
  });
  sceneryItems(510,0.3,(x,i)=>{
    const sheep=i%2===0, y=372;
    if(sheep){circle(x+12,y-10,12,'#f4eddd');circle(x+26,y-10,6,'#655b61');}
    else {rect(x,y-19,27,14,'#c89a72');rect(x+23,y-28,8,20,'#c89a72');polygon([[x+24,y-27],[x+20,y-36],[x+27,y-32]],'#8b6955');}
    rect(x+4,y-5,3,8,'#655b61');rect(x+20,y-5,3,8,'#655b61');
  });
  sceneryItems(300,0.07,(x,i)=>{
    const y=135+Math.sin(i*3)*32;
    ctx.strokeStyle='#35465a';ctx.lineWidth=2;ctx.beginPath();
    const flap=Math.sin(elapsed*4+i)*5;
    ctx.moveTo(x-8,y-flap);ctx.lineTo(x,y);ctx.lineTo(x+8,y-flap);ctx.stroke();
  });
}
function drawCharacter(x, y, hero) {
  const bob = state === 'playing' && player.velocity === 0 ? Math.sin(elapsed * 20) * 2 : 0;
  y += bob;
  const pose = jumpEffect > 0;
  const motion = Math.sin((0.6 - jumpEffect) / 0.6 * Math.PI);
  circle(x + 18, ground + 3, 18, '#182c3655');
  const outfits = { wizard: '#8459ce', elf: '#52966a', warrior: '#a7b9d0', accountant: '#50607d' };
  rect(x + 4, y + 28, 28, 22, outfits[hero]);
  rect(x + 8, y + 45 - bob, 9, 9, '#322c58'); if (hero === 'elf' && pose) { ctx.save();ctx.translate(x+26,y+43);ctx.rotate(-0.7-0.6*motion);rect(-4,0,9,18,'#322c58');ctx.restore(); } else rect(x + 23, y + 45 - bob, 9, 9, '#322c58');
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
    ctx.save();
    if (pose) { ctx.translate(x+41,y+40);ctx.rotate(-1.8*motion-0.4);ctx.translate(-x-41,-y-40);ctx.strokeStyle='#fff2b6';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+41,y+40,37,-2.2,-0.5);ctx.stroke(); }
    rect(x + 38, y + 9, 6, 31, '#e6f2ff'); rect(x + 32, y + 37, 18, 4, '#ffdc7c'); rect(x + 39, y + 41, 4, 10, '#a37459');
    ctx.restore();
    circle(x + 3, y + 37, 13, '#7c8fa9'); circle(x + 3, y + 37, 8, '#ebc872');
  } else {
    rect(x + 7, y + 7, 28, 9, '#5b3f35'); rect(x + 17, y + 28, 8, 19, '#f4f0e5'); rect(x + 20, y + 31, 3, 14, '#ef8a9e');
    // Two visible pupils inside two lenses.
    rect(x+14,y+19,5,5,'#ffffff');rect(x+26,y+19,5,5,'#ffffff');
    rect(x+16,y+20,2,3,'#192338');rect(x+28,y+20,2,3,'#192338');
    if (pose) { rect(x+31,y+6,7,25,'#50607d');rect(x+30,y,9,9,'#ffd3a3'); }
    ctx.strokeStyle = '#192338'; ctx.lineWidth = 2;
    ctx.strokeRect(x + 12, y + 18, 8, 7); ctx.strokeRect(x + 24, y + 18, 8, 7); rect(x + 20, y + 20, 4, 2, '#192338');
    rect(x + 35, y + 33, 19, 17, '#ba875c'); rect(x + 40, y + 29, 9, 5, '#e3b98c'); rect(x + 43, y + 39, 3, 5, '#ffdc7c');
  }
}
