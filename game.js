// No libraries needed: the entire game is drawn with the Canvas API.
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const goldLabel = document.querySelector('#gold');
const bestLabel = document.querySelector('#best');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const pauseScreen = document.querySelector('#pause-screen');
const ground = 388;
const player = { x: 155, y: ground - 54, width: 34, height: 54, velocity: 0 };
let state = 'ready';
let character = 'wizard';
let jumps = 0;
let jumpEffect = 0;
let scenerySeed = 0, sceneryStart = 0, paletteStart = 0;
let regionOrder = Array.from({length:30}, (_,i)=>i);
let lastCommentInterval = 0, speech = '', speechTime = 0;
const complaints = [
  'This is going too fast!', 'Could we slow down a little?', 'My boots have no brakes!',
  'Was that a tree or a blur?', 'I’m getting tired!', 'My legs have filed a complaint!',
  'Even heroes need a nap!', 'I need a sitting-down quest!', 'So much running…',
  'Who made this road so long?', 'I should have brought a horse!', 'Another mile? Really?',
  'Are we done yet?', 'Is the finish line imaginary?', 'Are we nearly there… yet?',
  'Can we stop for a snack?', 'My boots need a holiday!', 'I miss standing still!',
  'This quest needs more benches!', 'Running was not in the contract!', 'Is that another hill?',
  'I’m running out of heroic energy!', 'Can someone carry me?', 'Next time, we teleport!'
];
let previousComplaint = '';
let effectVariant = 0;
let nextBlueTime = 0;
let purpleTime = 0, purpleSpawned = false, bonusScore = 0;
function purpleDelay() { return 480 + Math.random() * 720; }
const paperHeadings = ['BUDGET','REPORT','GDP','LOANS','DATA','PLAN','AUDIT','GRANTS','TRADE','CLIMATE','HEALTH','SCHOOLS','ROADS','WATER','ENERGY','GROWTH','JOBS','BONDS','TAX','FORECAST','POVERTY','FUNDS','RISKS','SAVINGS','PROJECT'];
function blueInterval() { return 60 + Math.random() * 120; }
const variantCounts = { wizard: 50, warrior: 8, elf: 5, accountant: 150 };
// Explicit combinations give exactly the requested number of distinct effects.
const wizardPalettes = [
  ['#fff3b0','#ffc76e'], ['#cbb4ff','#936eff'], ['#84ffe0','#35ceb8'],
  ['#ffa6db','#ec64ae'], ['#9edcff','#579cff'], ['#ffbd99','#ff805b'],
  ['#ddff9c','#9acf52'], ['#ffffff','#c0d4ee'], ['#ffdf71','#e9ac35'], ['#d5afff','#ff9cc9']
];
function chooseVariant(hero) { return Math.floor(Math.random() * variantCounts[hero]); }
function chooseComplaint() {
  const choices = complaints.filter(line => line !== previousComplaint);
  previousComplaint = choices[Math.floor(Math.random() * choices.length)];
  return previousComplaint;
}

let elapsed = 0, distance = 0, gold = 0, score = 0, nextSpawn = 1.5;
let obstacles = [], coins = [], particles = [];
let previousTime = 0;
let best = 0;
try { best = Number(localStorage.getItem('rune-runner-best')) || 0; } catch { /* Storage is optional. */ }
bestLabel.textContent = best;

function startGame() {
  elapsed = distance = gold = score = 0;
  scenerySeed = (scenerySeed + 1 + Math.floor(Math.random()*1000000)) % 1000000000;
  sceneryStart = Math.random()*300000;
  paletteStart = Math.random()*75;
  regionOrder = Array.from({length:30},(_,i)=>i);
  for(let i=regionOrder.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [regionOrder[i],regionOrder[j]]=[regionOrder[j],regionOrder[i]];
  }
  nextSpawn = 1.5;
  nextBlueTime = 120 + Math.random() * 60;
  purpleTime = purpleDelay(); purpleSpawned = false; bonusScore = 0;
  obstacles = []; coins = []; particles = [];
  player.y = ground - player.height;
  player.velocity = 0;
  jumps = 0;
  jumpEffect = 0;
  lastCommentInterval = 0; speech = ''; speechTime = 0;
  character = document.querySelector('input[name=hero]:checked').value;
  scoreLabel.textContent = goldLabel.textContent = '0';
  state = 'playing';
  overlay.hidden = true;
  pauseButton.hidden = false;
  pauseButton.textContent = 'Ⅱ Pause';
  pauseButton.setAttribute('aria-pressed', 'false');
  pauseScreen.hidden = true;
  canvas.focus({ preventScroll: true });
  document.querySelector('#announcement').textContent = 'Quest started.';
}
function jump() {
  if (state !== 'playing' || jumps >= 2) return;
  jumps++;
  player.velocity = jumps === 2 ? -620 : -650;
  const magic = jumps === 2;
  if (!magic) return;
  jumpEffect = 0.6;
  effectVariant = chooseVariant(character);
  window.playJumpSound?.(character, effectVariant);
  const throwStyle = effectVariant % 6;
  const documentSet = Math.floor(effectVariant / 6);
  const count = character === 'wizard' ? 24 : character === 'accountant' ? 3 + throwStyle % 5 : 0;
  for (let i = 0; i < count; i++) {
    const paper = character === 'accountant';
    particles.push({ x: player.x + 20, y: player.y + 20,
      vx: paper ? (throwStyle - 2.5) * 40 + (Math.random() - 0.5) * 80 : (Math.random() - 0.5) * 240,
      vy: paper ? -180 - Math.random() * 160 : (Math.random() - 0.5) * 180,
      life: paper ? 1.2 : 0.7, color: wizardPalettes[Math.floor(effectVariant / 5) % 10][i % 2],
      magic: true, effect: character, shape: effectVariant % 5,
      size: paper ? (0.8 + (throwStyle % 3) * 0.2) * 0.85 : 1,
      document: (documentSet + i) % paperHeadings.length, rotation: Math.random() * Math.PI });
  }
}
function endGame() {
  state = 'over';
  pauseButton.hidden = true;
  pauseScreen.hidden = true;
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
function togglePause() {
  if (state !== 'playing' && state !== 'paused') return;
  const paused = state === 'playing';
  state = paused ? 'paused' : 'playing';
  previousTime = 0;
  pauseScreen.hidden = !paused;
  pauseButton.textContent = paused ? '▶ Resume' : 'Ⅱ Pause';
  pauseButton.setAttribute('aria-pressed', String(paused));
  document.querySelector('#announcement').textContent = paused ? 'Game paused.' : 'Quest resumed.';
  if (!paused) canvas.focus({ preventScroll: true });
}
pauseButton.addEventListener('click', togglePause);
startButton.addEventListener('click', startGame);
canvas.addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || event.repeat) return;
  if (event.target === pauseButton) return;
  if (state !== 'playing' && event.target.closest('.characters')) return;
  event.preventDefault();
  if (state === 'playing') jump(); else if (state !== 'paused') startGame();
});
// Ignore time spent in a background tab, so returning never causes a surprise collision.
document.addEventListener('visibilitychange', () => { previousTime = 0; });
function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
// Speed steps depend on this run's score, including collected gold.
function speedForScore(points) { return 270 + Math.floor(Math.min(points,150000) / 500) * 8; }
const obstacleKinds = ['slime','crystal','spikes','mushroom','skull','stump','chest','gargoyle','cauldron','thorn'];
const obstacleSizes = [0.75, 1, 1.25];
function makeObstacle(x, kind = obstacleKinds[Math.floor(Math.random()*obstacleKinds.length)]) {
  const size = obstacleSizes[Math.floor(Math.random()*obstacleSizes.length)];
  const slime = kind === 'slime';
  const height = (slime ? 34 : 48) * size;
  return {x,y:ground-height,width:(slime?42:30)*size,height,slime,kind,size};
}
function spawnPattern(speed) {
  const count = Math.random() < 0.35 ? 2 : 1;
  const startX = 990 + Math.random()*140;
  let x = startX;
  for(let i=0;i<count;i++) {
    const obstacle=makeObstacle(x);
    obstacles.push(obstacle);
    x += obstacle.width + 18 + Math.random()*20;
  }
  const coinCount = Math.random()<0.2 ? 0 : 1+Math.floor(Math.random()*5);
  let coinX = startX - 70 + Math.random()*160;
  for(let i=0;i<coinCount;i++) {
    const level = Math.floor(Math.random()*3);
    const height = [100,165,230][level] + (Math.random()-0.5)*14;
    coins.push({x:coinX,y:ground-height,width:22,height:22,high:level===2,level});
    coinX += 30 + Math.random()*22;
  }
  nextSpawn = 1.2 + Math.random()*1.25 + (x-startX)/speed;
}
function update(dt) {
  elapsed += dt;
  if (elapsed >= nextBlueTime) {
    spawnTreasureChallenge('blue');
    nextBlueTime = elapsed + blueInterval();
  }
  if (!purpleSpawned && elapsed >= purpleTime) {
    spawnTreasureChallenge('purple');
    purpleSpawned = true;
  }
  jumpEffect = Math.max(0, jumpEffect - dt);
  speechTime = Math.max(0, speechTime - dt);
  const speed = speedForScore(score);
  distance += speed * dt;
  player.velocity += 1700 * dt;
  player.y = Math.min(ground - player.height, player.y + player.velocity * dt);
  if (player.y === ground - player.height) { player.velocity = 0; jumps = 0; }
  // Leave a clear approach before a scheduled treasure challenge.
  const untilTreasure = Math.min(nextBlueTime - elapsed, purpleSpawned ? Infinity : purpleTime - elapsed);
  if (untilTreasure > 0 && untilTreasure < 3) nextSpawn = Math.max(nextSpawn, 3);
  nextSpawn -= dt;
  if (nextSpawn <= 0) {
    spawnPattern(speed);

  }
  for (const obstacle of obstacles) {
    obstacle.x -= speed * dt;
    // A slightly forgiving hitbox makes close jumps feel fair.
    if (overlaps({ x: player.x + 7, y: player.y + 8, width: 20, height: 44 }, obstacle)) { endGame(); return; }
  }
  coins = coins.filter(coin => {
    coin.x -= speed * dt;
    {
      if (coin.baseY === undefined) { coin.baseY = coin.y; coin.bobPhase = coin.x / 90; }
      coin.y = coin.baseY + Math.sin(elapsed * 6 + coin.bobPhase) * 2.5;
    }
    if (overlaps(player, coin)) {
      if (coin.purple) bonusScore += 50000;
      else gold += coin.blue ? 20 : 1;
      goldLabel.textContent = gold;
      for (let i = 0; i < 10; i++) particles.push({ x: coin.x, y: coin.y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, life: 0.6, color: coin.purple ? '#d9a3ff' : coin.blue ? '#76dfff' : '#ffda70' });
      return false;
    }
    return coin.x > -30;
  });
  obstacles = obstacles.filter(obstacle => obstacle.x > -60);
  particles = particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.effect === 'accountant') p.vy += 420 * dt; p.life -= dt; return p.life > 0; });
  score = Math.floor(distance / 12) + gold * 50 + bonusScore;
  scoreLabel.textContent = score;
  const commentInterval = complaintCountAt(elapsed);
  if (commentInterval > lastCommentInterval) {
    lastCommentInterval = commentInterval;
    speech = chooseComplaint();
    speechTime = 4;
    document.querySelector('#announcement').textContent = speech;
  }
}
function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function circle(x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
function draw() {
  drawLandscape();
  rect(0, ground, 960, 92, '#25363d'); rect(0, ground, 960, 8, '#80d6aa'); rect(0, ground + 8, 960, 8, '#40896f');
  for (let i = 0; i < 25; i++) {
    const x = i * 47 - distance % 47;
    rect(x, ground + 28 + i % 3 * 16, 16, 4, '#394c51');

  }
  drawGrass();
  for (const coin of coins) {
    if (coin.blue || coin.purple) { ctx.save();ctx.shadowColor=coin.purple?'#bb69ff':'#58caff';ctx.shadowBlur=18;circle(coin.x+11,coin.y+11,14,coin.purple?'#d9a3ff':'#78ddff');ctx.restore(); }

    circle(coin.x+11,coin.y+11,12,coin.purple?'#d9a3ff':coin.blue?'#78ddff':'#ffcf65');
    circle(coin.x+11,coin.y+11,8,coin.purple?'#8a45bb':coin.blue?'#297ac5':'#c98732');
    if(coin.purple){ctx.font='bold 8px system-ui';ctx.fillStyle='#fff0ff';ctx.fillText('★',coin.x+7,coin.y+14);}
    else if(coin.blue) rect(coin.x+9,coin.y+5,4,12,'#d8f6ff');
    else rect(coin.x+9,coin.y+5,4,12,'#ffe4a0');
  }
  for (const o of obstacles) drawObstacle(o);
  drawCharacter(player.x, player.y, character);
  drawSpeech();
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life * 3);
    if (p.magic && p.effect === 'wizard') drawSparkle(p);
    else if (p.magic && p.effect === 'accountant') drawPaper(p);
    else rect(p.x, p.y, p.magic ? 7 : 4, 2, p.color);
  }
  ctx.globalAlpha = 1;
}
function frame(time) {
  const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.035) : 0;
  previousTime = time;
  if (state === 'playing' && !document.hidden) update(dt);
  if (state !== 'paused') draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Thirty distinct 75-second chapters: no palette cycle within 20 minutes.
// Scenery hashes world positions rather than repeating a short list of props.
function sceneryNoise(index, salt = 0) {
  const value = Math.sin(index * 127.1 + salt * 311.7 + scenerySeed * 0.731) * 43758.5453;
  return value - Math.floor(value);
}
const regions = Array.from({ length: 30 }, (_, i) => {
  if (i === 0) return { sky: [18,21,39], horizon: [59,88,93], trees: [24,56,61], mountain: [39,48,73], forest: 1, peaks: 0.2, castle: 0 };
  return { sky: [16 + sceneryNoise(i,1)*24, 19 + sceneryNoise(i,2)*19, 35 + sceneryNoise(i,3)*30],
    horizon: [45 + sceneryNoise(i,4)*45, 60 + sceneryNoise(i,5)*40, 77 + sceneryNoise(i,6)*45],
    trees: [17 + sceneryNoise(i,7)*20, 35 + sceneryNoise(i,8)*25, 42 + sceneryNoise(i,9)*25],
    mountain: [45 + sceneryNoise(i,10)*35, 55 + sceneryNoise(i,11)*30, 85 + sceneryNoise(i,12)*40],
    forest: 0.3 + sceneryNoise(i,13)*0.7, peaks: sceneryNoise(i,14), castle: sceneryNoise(i,15) };
});
function landscapeAt(seconds) {
  const progress = (seconds + paletteStart) / 75;
  const index = Math.floor(progress) % regions.length;
  const fraction = progress % 1;
  const blend = fraction * fraction * (3 - 2 * fraction);
  const a = regions[regionOrder[index]], b = regions[regionOrder[(index + 1) % regions.length]];
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
  const offset = (distance + sceneryStart) * speed;
  const first = Math.floor(offset / spacing) - 2;
  for (let i = first; i < first + Math.ceil(960 / spacing) + 5; i++) paint(i * spacing - offset, i);
}
function drawLandscape() {
  const land = landscapeAt(elapsed);
  ctx.globalAlpha = 1;
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, rgb(land.sky)); sky.addColorStop(1, rgb(land.horizon));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 960, 480);
  for (let i=0;i<36;i++) circle(sceneryNoise(i,19)*960,sceneryNoise(i,20)*210, i%4===0?2:1,'#d5c9ef');
  circle(760, 102, 38, '#fff1b8'); circle(775, 90, 35, rgb(land.sky));
  sceneryItems(360, 0.03, (x, i) => {
    const y = 90 + Math.sin(i * 2) * 25;
    circle(x, y, 18, rgb(land.mountain.map(v=>v+25))); circle(x + 22, y - 8, 24, rgb(land.mountain.map(v=>v+25))); circle(x + 48, y, 18, rgb(land.mountain.map(v=>v+25)));
  });
  sceneryItems(280, 0.055, (x, i) => {
    const height = 65 + land.peaks * 125 + (Math.sin(i * 7.3) + 1) * 35;
    polygon([[x - 60, 320], [x + 140, 320 - height], [x + 340, 320]], rgb(land.mountain));
    polygon([[x + 140, 320 - height], [x + 110, 352 - height], [x + 142, 342 - height], [x + 170, 352 - height]], '#e4e5ef');
  });
  // Rolling countryside is opaque and masks the mountain bases.
  const grass = rgb(land.trees.map((v,i) => v + [0,12,0][i]));
  const hills = [[0, 388], [0, 304]];
  for (let x = 0; x <= 980; x += 20) hills.push([x, 295 + Math.sin((x + (distance + sceneryStart) * 0.09) / 180) * 20]);
  hills.push([980,388]); polygon(hills, grass);
  sceneryItems(110, 0.13, (x,i)=>{
    const base = 324, height = 75 + sceneryNoise(i,40)*80;
    const color = rgb(land.trees.map(v=>v+8));
    rect(x+27,base-height,7,height,color);
    polygon([[x+30,base-height-25],[x-9,base-10],[x+69,base-10]],color);
  });
  // A broad river winds through the fields, with solid banks and ripples.
  sceneryItems(8400, 0.09, (x, i) => {
    polygon([[x, 306], [x + 28, 306], [x + 140, 335], [x + 75, 362], [x + 230, 388], [x + 110, 388], [x + 10, 364], [x + 75, 338]], '#53868d');
    for (let k=0;k<4;k++) rect(x + 35 + k * 16, 336 + k * 11, 27, 2, '#8caea7');
    // Wooden bridge.
    rect(x + 28, 353, 103, 8, '#af8058'); rect(x + 28, 346, 103, 3, '#dfb480');
    for(let k=0;k<5;k++) rect(x + 30 + k*24, 346, 3, 17, '#805e48');
  });
  sceneryItems(1100, 0.12, (x, i) => {
    const type = Math.floor(sceneryNoise(i,21) * 7);
    const y = 335 + Math.sin(i * 2.4) * 10;
    ctx.save();ctx.translate(x,y);ctx.scale(0.75,0.75);ctx.translate(-x,-y);
    if (type === 0 || type === 4) {
      if(type===0) drawCastle(x,y,Math.floor(sceneryNoise(i,70)*20),land);
      else {rect(x,y-60,90,60,'#747d8d');polygon([[x-8,y-60],[x+45,y-88],[x+98,y-60]],'#675c75');rect(x+37,y-25,16,25,'#44495f');}
    } else if (type === 2 || type === 5) {
      // Villages, cottages, orchards and fences.
      for(let h=0;h<2;h++) { const hx=x+h*60; rect(hx,y-32,48,32,'#747d8d'); polygon([[hx-6,y-32],[hx+24,y-58],[hx+54,y-32]],h?'#966f91':'#b27468'); rect(hx+7,y-23,10,10,'#6f8d99');rect(hx+29,y-21,10,21,'#765948'); }
      rect(x-10,y+10,145,3,'#ecd1a1'); for(let k=0;k<7;k++)rect(x-10+k*24,y+3,3,17,'#ecd1a1');
    } else if(type===3) {
      // Windmill with slowly turning sails.
      polygon([[x,y],[x+12,y-65],[x+40,y-65],[x+52,y]],'#8e928a');
      ctx.save();ctx.translate(x+26,y-57);ctx.rotate(elapsed*0.35);for(let k=0;k<4;k++){ctx.rotate(Math.PI/2);rect(0,-3,44,6,'#796552');rect(14,-9,30,6,'#aba99a');}ctx.restore();
    }
    ctx.restore();
  });
  sceneryItems(900,0.1,(x,i)=>{
    if(sceneryNoise(i,72)<0.025) drawWizardTower(x,326,Math.floor(sceneryNoise(i,73)*3));
  });
  sceneryItems(1000,0.06,(x,i)=>{
    if(sceneryNoise(i,87)<0.01)drawDragon(x,105+sceneryNoise(i,88)*40,elapsed+i,true);
  });
  sceneryItems(1000,0.06,(x,i)=>{
    if(sceneryNoise(i,85)<0.05)drawDragon(x,95+sceneryNoise(i,86)*50,elapsed+i);
  });
  // Widely separated slots with a low chance make bats much rarer than birds.
  sceneryItems(1000,0.08,(x,i)=>{
    if(sceneryNoise(i,81)>0.3)return;
    const y=145+sceneryNoise(i,82)*55,flap=Math.sin(elapsed*6+i)*4;
    const color='#4b5268';
    for(let b=0;b<2;b++){
      const bx=x+b*18,by=y+b*7;
      ctx.save();ctx.translate(bx,by);ctx.scale(0.75,0.75);ctx.translate(-bx,-by);
      polygon([[bx,by],[bx-12,by-7-flap],[bx-9,by+3],[bx-5,by],[bx,by+5],[bx+5,by],[bx+9,by+3],[bx+12,by-7-flap]],color);
      circle(bx,by,3,color);ctx.restore();
    }
  });
  sceneryItems(1000,0.08,(x,i)=>{
    if(sceneryNoise(i,84)>0.3)return;
    drawWolf(x,330);
  });
  // A solid foreground bank grounds the trees and hides distant scenery bases.
  const bank = [[0,ground],[0,forestFloorAt(0)]];
  for(let x=0;x<=980;x+=20)bank.push([x,forestFloorAt(x)]);
  bank.push([980,ground]);polygon(bank,rgb(land.trees.map(v=>v+5)));
  sceneryItems(85, 0.22, (x, i) => {
    const variation = (Math.sin(i * 4.7)+1)/2;
    const size = 42 + land.forest*45 + variation*24;
    const base = forestFloorAt(x+23)+5;
    polygon([[x+15,base+2],[x+19,base-12],[x+27,base-12],[x+32,base+2]],'#725544');
    rect(x+19,base-size,8,size,'#86644b');
    if(sceneryNoise(i,22)<0.72) polygon([[x+23,base-size*2],[x-10,base-15],[x+56,base-15]],rgb(land.trees));
    else { circle(x+23,base-size-16,size*0.6,rgb(land.trees));circle(x+5,base-size-7,size*0.45,rgb(land.trees));circle(x+39,base-size-8,size*0.5,rgb(land.trees)); if(i%4===0) {circle(x+12,base-size-14,3,'#f1aa7a');circle(x+32,base-size-21,3,'#f1aa7a');} }
  });
  sceneryItems(650,0.22,(x,i)=>{
    if(sceneryNoise(i,92)<0.65)drawTinyProp(x,forestFloorAt(x)+3,Math.floor(sceneryNoise(i,93)*8));
  });
  sceneryItems(1000,0.08,(x,i)=>{
    if(sceneryNoise(i,89)<0.02)drawWolf(x,forestFloorAt(x)+3,true);
  });
  sceneryItems(1000,0.06,(x,i)=>{
    if(sceneryNoise(i,83)>0.6)return;
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
  ctx.save();
  // Fit each standing silhouette, including equipment, into the same 60×68 box.
  const bounds = {
    wizard: { left: -7, width: 57, height: 68 },
    elf: { left: -3, width: 61, height: 46 },
    warrior: { left: -10, width: 60, height: 57 },
    accountant: { left: 4, width: 50, height: 47 }
  }[hero];
  ctx.translate(x - 12, y + 54);
  ctx.scale((60 / bounds.width) * (hero === 'warrior' ? 1.05 : 1), (68 / bounds.height) * (hero === 'wizard' || hero === 'warrior' ? 1.05 : 1));
  ctx.translate(-x - bounds.left, -y - 54);
  if (hero === 'elf' && pose) {
    const progress=1-jumpEffect/0.6;ctx.translate(x+22,y+27);
    const turns=[1,-1,2,-2,1];ctx.rotate(progress*Math.PI*2*turns[effectVariant]);
    if(effectVariant===4)ctx.scale(Math.max(0.2,Math.abs(Math.cos(progress*Math.PI*2))),1);
    ctx.translate(-x-22,-y-27);
  }
  if (hero === 'warrior' && pose && effectVariant === 7) {
    const progress=1-jumpEffect/0.6;
    ctx.translate(x+22,y+27);ctx.rotate(progress*Math.PI*2);ctx.translate(-x-22,-y-27);
  }
  const outfits = { wizard: '#8459ce', elf: '#52966a', warrior: '#a7b9d0', accountant: '#50607d' };
  rect(x + 4, y + 28, 28, 22, outfits[hero]);
  rect(x + 8, y + 45 - bob, 9, 9, '#322c58');rect(x + 23, y + 45 - bob, 9, 9, '#322c58');
  rect(x + 10, y + 14, 22, 17, '#ffd3a3'); rect(x + 26, y + 18, 4, 5, '#273548');
  if (hero === 'wizard') {
    ctx.fillStyle = '#aa83ee'; ctx.beginPath(); ctx.moveTo(x - 5, y + 15); ctx.lineTo(x + 14, y - 14); ctx.lineTo(x + 34, y + 15); ctx.closePath(); ctx.fill();
    rect(x - 7, y + 13, 45, 5, '#c6a6ff'); rect(x + 1, y + 32, 35, 6, '#7ef3c1');
    ctx.save();ctx.translate(x+43,y+42);ctx.rotate(pose?Math.sin((1-jumpEffect/0.6)*Math.PI)*-0.22:0);ctx.translate(-x-43,-y-42);
    rect(x + 41, y + 15, 4, 35, '#d4b178'); circle(x + 43, y + 11, 7, '#7ef3c1'); circle(x + 43, y + 11, 3, '#e1fff3');ctx.restore();
  } else if (hero === 'elf') {
    rect(x + 7, y + 8, 27, 9, '#e2c078');
    ctx.fillStyle = '#ffd3a3'; ctx.beginPath(); ctx.moveTo(x + 7, y + 18); ctx.lineTo(x - 3, y + 10); ctx.lineTo(x + 7, y + 25); ctx.fill();
    rect(x + 6, y + 36, 28, 4, '#a7d77b');
    ctx.strokeStyle = '#e6c48f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 34, y + 29, 19, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 34, y + 10); ctx.lineTo(x + 34, y + 48); ctx.stroke();
    rect(x + 29, y + 28, 29, 2, '#f7e6bd');
  } else if (hero === 'warrior') {
    // Steel Viking helmet with two curved ivory horns.
    rect(x + 5, y + 6, 31, 12, '#cedae8');
    rect(x + 8, y + 17, 6, 12, '#8798b2');
    polygon([[x+7,y+11],[x-1,y+7],[x-4,y-3],[x+2,y+1],[x+5,y+6],[x+12,y+7]],'#eee0bd');
    polygon([[x+30,y+11],[x+38,y+7],[x+41,y-3],[x+35,y+1],[x+32,y+6],[x+25,y+7]],'#eee0bd');
    rect(x+19,y+6,4,12,'#8798b2');
    // Seven directional sword hacks and one forward flip.
    const move = warriorMove(effectVariant, jumpEffect);
    const armAngle = pose ? move.sword : 0;
    const grip = warriorGrip(x, y, armAngle);
    ctx.strokeStyle='#a7b9d0';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+30,y+32);ctx.lineTo(grip.x,grip.y);ctx.stroke();
    ctx.save();ctx.translate(x+30,y+32);ctx.rotate(armAngle);ctx.translate(11,8);
    rect(-3,-34,6,31,'#e6f2ff');rect(-9,-6,18,4,'#ffdc7c');rect(-2,-2,4,10,'#a37459');ctx.restore();
    ctx.save();ctx.translate(x+8,y+30);ctx.rotate(pose?move.shield:0);ctx.translate(-5,7);
    circle(0,0,13,'#7c8fa9');circle(0,0,8,'#ebc872');ctx.restore();
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
  ctx.restore();
}

function drawSpeech() {
  if (speechTime <= 0) return;
  ctx.font = 'bold 15px system-ui';
  const width = Math.min(440, ctx.measureText(speech).width + 28);
  const x = Math.max(8, Math.min(950-width, player.x-25));
  const y = Math.max(85, player.y-58);
  ctx.fillStyle = '#fff7df'; ctx.beginPath();ctx.roundRect(x,y,width,38,10);ctx.fill();
  polygon([[x+36,y+37],[x+44,y+47],[x+52,y+37]],'#fff7df');
  ctx.fillStyle = '#33324b';ctx.fillText(speech,x+14,y+24,width-28);
}
function drawObstacle(o) {
  const size=o.size || 1;
  ctx.save();ctx.translate(o.x,ground);ctx.scale(size,size);ctx.translate(-o.x,-ground);
  drawObstacleArt({...o,y:ground-(o.slime?34:48)});
  ctx.restore();
}
function drawObstacleArt(o) {
  const x=o.x,y=o.y, kind=o.kind || (o.slime?'slime':'crystal');
  if(kind==='slime') { ctx.fillStyle='#c66cbd';ctx.beginPath();ctx.ellipse(x+21,y+20,23,20,0,Math.PI,2*Math.PI);ctx.lineTo(x+44,ground);ctx.lineTo(x-2,ground);ctx.fill();rect(x+10,y+15,5,7,'#392642');rect(x+27,y+15,5,7,'#392642'); }
  else if(kind==='crystal'){polygon([[x+15,y],[x+30,y+24],[x+24,ground],[x+3,ground],[x,y+24]],'#b99aff');rect(x+12,y+17,5,26,'#e5ccff');}
  else if(kind==='spikes'){for(let i=0;i<3;i++)polygon([[x+i*10,ground],[x+i*10+5,y+5],[x+i*10+10,ground]],'#a9bccb');}
  else if(kind==='mushroom'){rect(x+10,y+20,12,28,'#dfc9af');circle(x+15,y+16,17,'#be5e85');rect(x-2,y+16,34,5,'#be5e85');circle(x+7,y+9,3,'#f1d2cb');circle(x+23,y+14,3,'#f1d2cb');}
  else if(kind==='skull'){circle(x+15,y+20,18,'#e0d7bd');rect(x+3,y+24,24,24,'#e0d7bd');circle(x+8,y+19,5,'#42384d');circle(x+22,y+19,5,'#42384d');for(let i=0;i<3;i++)rect(x+7+i*7,y+37,3,11,'#655a68');}
  else if(kind==='stump'){rect(x,y+6,30,42,'#805d61');rect(x+4,y+6,22,5,'#c69c7d');rect(x+5,y+18,3,25,'#553f50');polygon([[x,y+20],[x-9,y+8],[x,y+10]],'#805d61');}
  else if(kind==='chest'){rect(x,y+9,30,39,'#8a6678');rect(x,y+9,30,8,'#dfba73');rect(x,y+40,30,5,'#dfba73');rect(x+13,y+25,6,10,'#f9d990');}
  else if(kind==='gargoyle'){polygon([[x+7,y+24],[x-8,y+7],[x+5,y+9],[x+15,y],[x+25,y+9],[x+38,y+7],[x+24,y+26],[x+28,ground],[x+2,ground]],'#8790a8');rect(x+6,y+14,5,4,'#e7a1bd');rect(x+20,y+14,5,4,'#e7a1bd');}
  else if(kind==='cauldron'){circle(x+15,y+29,18,'#555473');rect(x-3,y+14,36,6,'#8993ac');rect(x+3,y+14,24,3,'#90e4b5');circle(x+10,y+7,4,'#90e4b5');circle(x+24,y+2,3,'#90e4b5');rect(x+3,y+40,5,8,'#555473');rect(x+23,y+40,5,8,'#555473');}
  else {for(let i=0;i<3;i++){polygon([[x+i*10,ground],[x+i*10+4,y+3],[x+i*10+10,ground]],'#637b69');polygon([[x+i*10+4,y+20],[x+i*10-5,y+12],[x+i*10+4,y+30]],'#90a178');}}
}

function drawSparkle(p) {
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*4);ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=2;
  if(p.shape===0){rect(-6,-1,12,2,p.color);rect(-1,-6,2,12,p.color);}
  else if(p.shape===1)polygon([[0,-7],[4,0],[0,7],[-4,0]],p.color);
  else if(p.shape===2){ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.stroke();}
  else if(p.shape===3){const points=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?3:7;points.push([Math.sin(a)*r,Math.cos(a)*r]);}polygon(points,p.color);}
  else polygon([[0,-6],[6,5],[-6,5]],p.color);
  ctx.restore();
}
function drawPaper(p) {
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation+p.life*4);ctx.scale(p.size,p.size);
  rect(-10,-13,20,26,'#fff9e9');polygon([[4,-13],[10,-7],[4,-7]],'#b6c8d6');
  ctx.fillStyle='#657c98';ctx.font='bold 5px system-ui';
  ctx.font='bold 4px system-ui';ctx.fillText(paperHeadings[p.document],-8,-5,16);
  if(p.document%3===0){for(let i=0;i<3;i++)rect(-6+i*5,8-i*3,3,3+i*3,'#657c98');}
  else if(p.document%3===1){for(let i=0;i<3;i++)rect(-6,1+i*4,12-i*2,1,'#657c98');}
  else {ctx.strokeStyle='#657c98';ctx.lineWidth=0.7;ctx.strokeRect(-6,0,12,9);rect(-6,4,12,1,'#657c98');rect(-1,0,1,9,'#657c98');}
  ctx.restore();
}
function drawGrass() {
  const offset=distance,first=Math.floor(offset/16)-1;
  for(let i=first;i<first+63;i++){
    const x=i*16-offset,height=3+sceneryNoise(i,61)*9,lean=sceneryNoise(i,62)*7-3;
    polygon([[x-2,ground+1],[x+lean,ground-height],[x+2,ground+1]],i%2?'#578f72':'#72aa83');
  }
}

function warriorMove(variant, remaining) {
  const progress = 1 - remaining / 0.6;
  const direction = [0.5, -0.65, 1.2, -1.3, 1.9, -2.0, 2.6, 0][variant];
  const swing = Math.sin(progress * Math.PI);
  return { sword: direction * swing, shield: (variant % 7 - 3) * swing * 0.4 };
}
function warriorGrip(x, y, angle) {
  // The arm always has the same length; only its angle changes.
  return { x: x + 30 + 11 * Math.cos(angle) - 8 * Math.sin(angle), y: y + 32 + 11 * Math.sin(angle) + 8 * Math.cos(angle) };
}

// Offsets are measured in travel seconds, so challenges scale with running speed.
const treasureChallenges = {
  blue: [
    { height: 205, offsets: [-0.24] },
    { height: 220, offsets: [-0.32, 0.23] },
    { height: 190, offsets: [-0.18, -0.08] },
    { height: 235, offsets: [-0.36] }
  ],
  purple: [
    { height: 267, offsets: [-0.30, 0.20] },
    { height: 275, offsets: [-0.38, -0.24, 0.24] },
    { height: 263, offsets: [-0.23, 0.13, 0.25] },
    { height: 278, offsets: [-0.34, 0.27] }
  ]
};
function spawnTreasureChallenge(type) {
  const options=treasureChallenges[type];
  const challenge=Math.floor(Math.random()*options.length);
  const layout=options[challenge], speed=speedForScore(score), coinX=Math.max(930,player.x+speed*1.8);
  coins.push({x:coinX,y:ground-layout.height,width:22,height:22,[type]:true,challenge});
  const kinds=['spikes','thorn','gargoyle','crystal'];
  for(const offset of layout.offsets) obstacles.push({...makeObstacle(coinX+offset*speed,kinds[Math.floor(Math.random()*kinds.length)]),treasure:true});
  nextSpawn=Math.max(nextSpawn,2.2);
}

function complaintCountAt(seconds) {
  return seconds < 180 ? 0 : seconds < 360 ? 1 : 2 + Math.floor((seconds-360)/120);
}
function drawCastle(x,y,variant,land) {
 const family=Math.floor(variant/5),detail=variant%5;
 const stone=rgb(land.mountain.map(v=>v+18+family*3)),roof=['#635775','#586776','#6c5966','#526b70'][family];
 const width=85+detail*7;
 rect(x,y-48-detail*3,width,48+detail*3,stone);
 const count=2+family;
 for(let t=0;t<count;t++){
  const tx=x-7+t*(width-8)/(count-1),height=65+detail*5+(t%2)*9;
  rect(tx,y-height,18, height,stone);
  if(family===1||family===3)polygon([[tx-4,y-height],[tx+9,y-height-17-detail*2],[tx+22,y-height]],roof);
  else for(let k=0;k<3;k++)rect(tx+k*7,y-height-6,4,8,stone);
  rect(tx+6,y-height+12,5,10,'#a5a597');
 }
 for(let k=0;k<3+detail;k++)rect(x+10+k*15,y-35,5,7,'#a5a597');
 rect(x+width/2-8,y-23,16,23,'#41465c');
 if(family===2){rect(x-18,y-7,width+35,7,stone);rect(x-10,y-18,5,18,stone);}
 if(detail%2===0){rect(x+width/2,y-80,2,15,stone);polygon([[x+width/2+2,y-80],[x+width/2+15,y-75],[x+width/2+2,y-70]],roof);}
}
function drawWizardTower(x,y,type) {
 ctx.save();ctx.translate(x,y);ctx.scale(0.7,0.7);
 const stone=['#657084','#72687e','#596e78'][type];
 polygon([[0,0],[7,-85-type*8],[29,-85-type*8],[36,0]],stone);
 polygon([[-3,-82-type*8],[18,-119-type*9],[40,-82-type*8]],'#51475f');
 for(let i=0;i<3;i++)rect(15,-25-i*23,6,9,'#a8aeaa');
 if(type===1) {rect(-9,-50,55,5,stone);rect(-7,-63,3,14,stone);rect(42,-63,3,14,stone);}
 if(type===2) {circle(18,-122,5,'#9baab1');rect(-7,-18,50,6,stone);}
 ctx.restore();
}
function drawDragon(x,y,age,white=false) {
  const flap=Math.sin(age*2)*13,color=white?'#d8e2ed':'#46556b';
  // Short, flickering fire-breath bursts; scenery only, never a hazard.
  const breath = age % 6;
  if (breath > 0.6 && breath < 2.9) {
    const strength = Math.sin((breath-0.6)/2.3*Math.PI);
    const reach = 18 + strength*30 + Math.sin(age*24)*3;
    const mouthX=x+31,mouthY=y-3;
    polygon([[mouthX,mouthY-2],[mouthX+reach*0.55,mouthY-8*strength],[mouthX+reach,mouthY-3],[mouthX+reach*0.8,mouthY+3],[mouthX+reach,mouthY+7],[mouthX+reach*0.4,mouthY+6*strength],[mouthX,mouthY+2]],white?'#589cdd':'#ce7950');
    polygon([[mouthX,mouthY-1],[mouthX+reach*0.7,mouthY-2],[mouthX+reach*0.5,mouthY+3],[mouthX,mouthY+1]],white?'#a2efff':'#f2c579');
  }

  polygon([[x-22,y],[x+17,y-3],[x+27,y-9],[x+33,y-4],[x+22,y+4],[x-18,y+6],[x-38,y+2]],color);
  polygon([[x-5,y],[x-26,y-24-flap],[x+2,y-13],[x+22,y-24-flap],[x+12,y+2]],color);
}

function forestFloorAt(x) { return 350 + Math.sin((x+(distance+sceneryStart)*0.22)/180)*7; }
function drawWolf(x,y,white=false) {
    const color=white?'#d3dde2':'#222f3a';
    ctx.save();ctx.translate(x,y);ctx.scale(0.4875,0.4875);
    polygon([[-18,-10],[-12,-21],[12,-24],[25,-33],[33,-30],[42,-24],[32,-18],[21,-17],[17,-4],[-9,-4]],color);
    polygon([[27,-31],[25,-42],[34,-32]],color);
    polygon([[-13,-17],[-34,-30],[-27,-14],[-15,-7]],color);
    for(const leg of [-10,3,16,25])rect(leg,-9,3,15,color);
    circle(34,-28,1,white?'#ed4455':'#77878b');ctx.restore();
}

function drawTinyProp(x,y,type) {
 ctx.save();ctx.translate(x,y);
 // Small, muted decorations; they are never gameplay obstacles.
 if(type===0){rect(-8,-11,16,11,'#795c55');rect(-9,-12,18,4,'#aaa082');rect(-1,-8,3,4,'#c1ac78');}
 else if(type===1){polygon([[-8,0],[-10,-14],[-4,-21],[7,-18],[10,0]],'#747d87');rect(-3,-14,6,1,'#a0aaa4');rect(-1,-16,1,8,'#a0aaa4');}
 else if(type===2){rect(-9,-3,18,3,'#775b4b');polygon([[-5,-4],[0,-17],[6,-5]],'#be865d');polygon([[-2,-5],[1,-12],[3,-5]],'#d7b67b');}
 else if(type===3){rect(-1,-16,2,16,'#9ca7af');rect(-6,-9,12,2,'#93877d');polygon([[-9,0],[-6,-7],[5,-6],[9,0]],'#68717d');}
 else if(type===4){for(let k=0;k<3;k++){rect(-8+k*7,-9,2,9,'#948475');circle(-7+k*7,-10,5,'#887487');}}
 else if(type===5){rect(-7,-15,14,15,'#747d86');rect(-8,-17,16,3,'#89929a');rect(-4,-12,8,7,'#a2a591');}
 else if(type===6){rect(-1,-21,2,21,'#8a735e');polygon([[-1,-21],[12,-18],[-1,-12]],'#756379');}
 else {circle(0,-6,7,'#7b807c');rect(-7,-5,14,5,'#7b807c');rect(-3,-9,6,3,'#a6a38d');}
 ctx.restore();
}
