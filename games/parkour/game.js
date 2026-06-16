const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const sparkleSprite = new Image();
sparkleSprite.src = "../../assets/sprites/sparkle-unicorn.png";
const overlay = document.querySelector("#overlay");
const title = document.querySelector("#title");
const text = document.querySelector("#text");
const start = document.querySelector("#start");
const hud = {
  level: document.querySelector("#level"),
  coins: document.querySelector("#coins"),
  lives: document.querySelector("#lives"),
  time: document.querySelector("#time"),
  speed: document.querySelector("#speed"),
};

const W = 960;
const H = 640;
const keys = new Set();
let jumpQueued = false;
let dashQueued = false;
let timer = 0;
let raf = 0;
let last = 0;
let state = makeLevel(1);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const rect = (p = state.p) => ({ x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 });

const levelNames = {
  1: "Искорка: Паркур",
  2: "Искорка: Dash",
  3: "Искорка: Лица",
  4: "Искорка: Лава и Веревки",
  5: "Искорка: Ледяной Склон",
};

function makeLevel(n) {
  const base = {
    n,
    running: false,
    t: 0,
    cam: 0,
    angle: 0,
    shake: 0,
    width: n === 5 ? 4500 : n === 4 ? 4300 : n === 2 ? 4100 : n === 3 ? 3400 : 3600,
    checkpoint: { x: 90, y: 450 },
    p: { x: 90, y: 450, r: 22, vx: n === 2 ? 335 : 0, vy: 0, a: 0, ground: false, coyote: 0, dash: 0, lives: n === 2 ? 5 : n === 4 ? 4 : n === 5 ? 4 : 3, rope: null },
    coins: [],
    platforms: [],
    hazards: [],
    ropes: [],
    beast: null,
  };
  if (n === 1) {
    base.coins = [[420,380],[725,286],[1035,206],[1385,332],[1775,232],[2195,388],[2660,254],[3195,160]].map(c);
    base.platforms = [[-80,548,420,62,"ground"],[420,486,170,28,"roof"],[670,404,145,28,"roof"],[940,326,132,28,"tiny"],[1195,460,190,28,"spring"],[1515,390,122,28,"tiny"],[1740,320,160,28,"roof"],[2048,496,220,28,"ground"],[2365,424,125,28,"tiny"],[2610,344,150,28,"roof"],[2880,270,120,28,"tiny"],[3150,220,190,28,"spring"],[3410,500,260,72,"finish"]].map(pf);
    base.hazards = [[355,575,220,48,"pit"],[840,604,330,36,"jam"],[1410,604,250,36,"spikes"],[1915,604,290,36,"pit"],[2495,604,300,36,"jam"],[3050,604,280,36,"spikes"]].map(hz);
  }
  if (n === 2) {
    base.coins = [[450,415],[840,360],[1280,420],[1710,310],[2130,395],[2600,260],[3190,385],[3780,330]].map(c);
    base.platforms = [[-80,548,780,56,"ground"],[780,500,320,30,"dash"],[1160,548,520,56,"ground"],[1770,455,300,30,"dash"],[2140,548,560,56,"ground"],[2780,410,310,30,"gravity"],[3190,548,470,56,"ground"],[3710,500,280,30,"dash"],[3880,548,520,72,"finish"]].map(pf);
    base.hazards = [[555,510,38,38,"spike"],[990,604,54,28,"pit"],[1400,510,38,38,"spike"],[2058,604,62,28,"pit"],[2380,510,38,38,"spike"],[3115,604,70,28,"pit"],[3410,510,38,38,"spike"]].map(hz);
  }
  if (n === 3) {
    base.coins = [[360,390],[720,285],[1110,410],[1530,245],[1980,390],[2440,270],[2920,380]].map(c);
    base.platforms = [[-80,548,430,62,"ground"],[430,475,220,30,"face"],[730,382,190,30,"face"],[1060,505,260,30,"face"],[1440,350,220,30,"spring"],[1810,505,290,30,"face"],[2260,405,230,30,"face"],[2700,505,260,30,"face"],[3100,500,340,72,"finish"]].map(pf);
    base.hazards = [[520,430,54,54,"face"],[930,492,58,58,"face"],[1320,520,58,58,"banana"],[1700,298,62,62,"face"],[2140,520,66,58,"banana"],[2555,356,62,62,"face"],[2980,520,70,58,"banana"]].map(hz);
  }
  if (n === 4) {
    base.coins = [[430,330],[830,205],[1240,380],[1660,250],[2130,170],[2580,350],[3150,250],[3740,180]].map(c);
    base.platforms = [[-80,548,430,62,"ground"],[470,470,170,28,"rock"],[760,360,170,28,"rock"],[1110,505,210,28,"rock"],[1500,410,160,28,"rock"],[1900,310,170,28,"rock"],[2380,480,190,28,"rock"],[2820,390,170,28,"rock"],[3260,305,180,28,"rock"],[3660,470,190,28,"rock"],[4020,510,300,72,"finish"]].map(pf);
    base.hazards = [[680,590,330,80,"lava"],[1330,590,420,80,"lava"],[2180,590,420,80,"lava"],[3060,590,380,80,"lava"]].map(hz);
    base.ropes = [{x:690,y:170,h:260},{x:1385,y:150,h:290},{x:2210,y:105,h:315},{x:3100,y:120,h:285},{x:3840,y:165,h:255}];
    base.beast = { x: -180, y: 505, r: 42 };
  }
  if (n === 5) {
    base.coins = [[410,380],[840,310],[1280,245],[1760,355],[2190,210],[2630,320],[3200,235],[3820,310]].map(c);
    base.platforms = [[-80,548,520,62,"ice"],[560,500,300,26,"ice"],[980,430,260,26,"ice"],[1390,520,330,26,"ice"],[1840,380,250,26,"ice"],[2250,470,310,26,"ice"],[2700,340,240,26,"ice"],[3140,510,330,26,"ice"],[3630,405,260,26,"ice"],[4080,500,430,72,"finish"]].map(pf);
    base.hazards = [[470,590,260,45,"icePit"],[1260,590,300,45,"icePit"],[1720,500,54,40,"snowSpike"],[2500,590,330,45,"icePit"],[3010,470,54,40,"snowSpike"],[3520,590,300,45,"icePit"],[3920,365,54,40,"snowSpike"]].map(hz);
  }
  return base;
}

function c([x, y]) { return { x, y, taken: false }; }
function pf([x, y, w, h, kind]) { return { x, y, w, h, kind }; }
function hz([x, y, w, h, kind]) { return { x, y, w, h, kind }; }

function startLevel(n) {
  state = makeLevel(n);
  state.running = true;
  overlay.classList.add("hidden");
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

function transition(next, message) {
  state.running = false;
  title.textContent = next ? `Уровень ${next} запускается` : "Искорка прошла всё";
  text.textContent = message;
  start.textContent = next ? "Погнали дальше" : "С начала";
  start.onclick = () => next ? startLevel(next) : showMenu();
  overlay.classList.remove("hidden");
  setTimeout(() => next ? startLevel(next) : showMenu(), 1700);
}

function lose(message) {
  state.running = false;
  title.textContent = "Попытка сгорела";
  text.textContent = message;
  start.textContent = "Заново";
  start.onclick = () => startLevel(state.n);
  overlay.classList.remove("hidden");
}

function respawn() {
  const p = state.p;
  p.lives -= 1;
  state.shake = .45;
  if (p.lives < 0) return lose("Искорка не вывезла. Еще раз, но уже спокойнее.");
  p.x = state.checkpoint.x;
  p.y = state.checkpoint.y;
  p.vx = state.n === 2 ? 335 : 0;
  p.vy = 0;
  p.rope = null;
}

function update(dt) {
  state.t += dt;
  const p = state.p;
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const up = keys.has("ArrowUp") || keys.has("KeyW");
  const down = keys.has("ArrowDown") || keys.has("KeyS");
  state.shake = Math.max(0, state.shake - dt);

  if (state.n === 2) {
    p.vx = 335 + Math.sin(state.t * 2) * 18 + state.cam / 260;
  } else {
    const accel = state.n === 5 ? (p.ground ? 780 : 640) : p.ground ? 2300 : 1450;
    const max = state.n === 5 ? (down ? 640 : 560) : down ? 510 : 420;
    if (left) p.vx -= accel * dt;
    if (right) p.vx += accel * dt;
    if (!left && !right) p.vx *= state.n === 5 ? (p.ground ? .985 : .997) : (p.ground ? .84 : .97);
    p.vx = clamp(p.vx, -max, max);
  }

  const nearRope = state.ropes.find(r => Math.abs(p.x - r.x) < 28 && p.y > r.y && p.y < r.y + r.h);
  if (state.n === 4 && nearRope && (up || down)) {
    p.rope = nearRope;
    p.x += (nearRope.x - p.x) * Math.min(1, dt * 12);
    p.vx *= .88;
    p.vy = up ? -235 : down ? 185 : 0;
    if (jumpQueued) {
      p.vx = right ? 520 : left ? -520 : 380;
      p.vy = -520;
      p.rope = null;
      jumpQueued = false;
    }
  } else {
    p.rope = null;
    if (jumpQueued && (p.ground || p.coyote > 0)) {
      p.vy = state.n === 2 ? -735 : state.n === 4 ? -660 : state.n === 5 ? -710 : -690;
      p.ground = false;
      p.coyote = 0;
    }
    jumpQueued = false;
    if ((dashQueued || keys.has("ShiftLeft") || keys.has("ShiftRight")) && p.dash <= 0 && state.n !== 2) {
      const dir = left && !right ? -1 : 1;
      p.vx = dir * (state.n === 4 ? 690 : state.n === 5 ? 840 : 760);
      p.vy = Math.min(p.vy, -120);
      p.dash = .8;
      state.shake = .16;
    }
    p.vy += (state.n === 4 ? 1460 : state.n === 5 ? 1420 : 1520) * dt;
  }
  dashQueued = false;
  p.dash = Math.max(0, p.dash - dt);
  p.vy = Math.min(p.vy, 980);
  p.coyote = Math.max(0, p.coyote - dt);

  const oldY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.ground = false;

  for (const platform of state.platforms) {
    if (!hit(rect(), platform)) continue;
    if (oldY + p.r <= platform.y + 10 && p.vy >= 0) {
      p.y = platform.y - p.r;
      p.vy = platform.kind === "spring" || platform.kind === "gravity" ? -800 : 0;
      p.ground = platform.kind !== "spring" && platform.kind !== "gravity";
      p.coyote = .11;
    } else if (state.n === 2) {
      respawn();
    } else {
      p.x += p.x < platform.x ? -8 : 8;
      p.vx *= -.25;
    }
  }

  p.x = clamp(p.x, p.r, state.width - p.r);
  if (p.y > H + 120) respawn();

  const pr = rect();
  for (const h of state.hazards) {
    const bob = h.kind === "face" ? Math.sin(state.t * 4 + h.x) * 18 : 0;
    if (hit(pr, { ...h, y: h.y + bob })) respawn();
  }

  if (state.n === 4) {
    const lavaY = 585 + Math.sin(state.t * 2.6) * 10;
    if (p.y + p.r > lavaY) respawn();
    state.beast.x += (p.x - 205 - state.beast.x) * Math.min(1, dt * .75);
    if (p.x - state.beast.x < 86 && Math.abs(p.y - state.beast.y) < 82) respawn();
  }

  for (const coin of state.coins) {
    if (!coin.taken && Math.hypot(p.x - coin.x, p.y - coin.y) < p.r + 18) {
      coin.taken = true;
      state.shake = .08;
    }
  }
  if (p.x > state.checkpoint.x + 900) state.checkpoint = { x: p.x - 80, y: p.y };

  const finishX = state.n === 1 ? 3495 : state.n === 2 ? 3980 : state.n === 3 ? 3240 : state.n === 4 ? 4150 : 4380;
  if (p.x > finishX) {
    if (state.n < 5) transition(state.n + 1, `Уровень ${state.n} пройден. Следующий включается сам.`);
    else transition(0, "Пятый ледяной уровень пройден. Искорка удержалась на скользком льду.");
  }

  state.cam += (clamp(p.x - W * .34, 0, state.width - W) - state.cam) * Math.min(1, dt * 7);
  state.angle += ((Math.sin(state.t * (state.n === 2 ? 7 : 2.4)) * .035 + clamp(p.vx / 4600, -.08, .08)) - state.angle) * Math.min(1, dt * 5);
  p.a += p.vx * dt * .022;
  updateHud();
}

function updateHud() {
  hud.level.textContent = state.n;
  hud.coins.textContent = `${state.coins.filter(c => c.taken).length}/${state.coins.length}`;
  hud.lives.textContent = Math.max(0, state.p.lives);
  hud.time.textContent = `${state.t.toFixed(1)}с`;
  hud.speed.textContent = `L${state.n} ${Math.round(Math.abs(state.p.vx))}`;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(state.angle + (state.shake ? Math.sin(state.t * 70) * state.shake * .1 : 0));
  ctx.translate(-W / 2 - state.cam, -H / 2);
  drawBackground();
  state.ropes.forEach(drawRope);
  state.hazards.forEach(drawHazard);
  state.platforms.forEach(drawPlatform);
  state.coins.forEach((coin, i) => drawCoin(coin, i));
  if (state.beast) drawBeast(state.beast);
  drawPlayer();
  ctx.restore();
  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.fillRect(0, H - 46, W, 46);
  ctx.fillStyle = "#fff4df";
  ctx.font = "800 16px Inter, system-ui";
  ctx.textAlign = "center";
  ctx.fillText(
    state.n === 4
      ? "L4: убегай от зверя, лезь по веревкам, не трогай лаву"
      : state.n === 5
        ? "L5: лед скользкий. Торможение долгое, рывок опасный, прыгай заранее"
        : "Прыжок: W/↑/Space   Рывок: S/↓/Shift",
    W / 2,
    H - 17,
  );
}

function drawBackground() {
  const colors = {
    1: ["#7bd7ff", "#b9edff", "#8edb78"],
    2: ["#6e4bff", "#f28fd8", "#2d1954"],
    3: ["#ffbd66", "#ffd986", "#7754c8"],
    4: ["#351018", "#8b2430", "#1a0d13"],
    5: ["#d9fbff", "#79c8f2", "#154069"],
  }[state.n];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, colors[0]); g.addColorStop(.55, colors[1]); g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(-200, -160, state.width + 400, H + 360);

  ctx.save();
  ctx.globalAlpha = state.n === 4 ? .34 : .88;
  ctx.fillStyle = state.n === 5 ? "#f7fdff" : "#fff7c8";
  ctx.beginPath();
  ctx.arc(state.cam + 790, 96, state.n === 4 ? 50 : 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let x = -120; x < state.width + 300; x += 520) {
    drawCloud(x + Math.sin(state.t + x) * 18, 105 + (x % 3) * 22, state.n === 4 ? .25 : .72);
  }

  ctx.fillStyle = state.n === 4 ? "rgba(255,92,54,.22)" : state.n === 5 ? "rgba(255,255,255,.38)" : "rgba(255,225,106,.22)";
  for (let x = 80; x < state.width + 200; x += 340) {
    ctx.save();
    ctx.translate(x, 110 + Math.sin(state.t * 1.8 + x) * 24);
    ctx.rotate(state.t * 0.18 + x * 0.01);
    ctx.fillRect(-26, -26, 52, 52);
    ctx.restore();
  }
  for (let x = -100; x < state.width + 300; x += 230) {
    ctx.fillStyle = state.n === 4 ? "#321516" : state.n === 5 ? "rgba(225,250,255,.34)" : "rgba(38,118,73,.16)";
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 150, 360 + Math.sin(x) * 60);
    ctx.lineTo(x + 320, H);
    ctx.fill();
  }
  if (state.n === 4) {
    const y = 585 + Math.sin(state.t * 2.6) * 10;
    ctx.fillStyle = "#ff3d2f";
    ctx.fillRect(-200, y, state.width + 400, 120);
    ctx.fillStyle = "rgba(255,225,106,.45)";
    for (let x = -100; x < state.width + 200; x += 95) ctx.fillRect(x, y + Math.sin(state.t * 3 + x) * 9, 58, 8);
  }
  if (state.n === 5) {
    ctx.fillStyle = "rgba(255,255,255,.42)";
    for (let x = -80; x < state.width + 200; x += 150) {
      ctx.beginPath();
      ctx.arc(x, 120 + Math.sin(state.t * 2 + x) * 80, 3, 0, Math.PI * 2);
      ctx.arc(x + 44, 210 + Math.sin(state.t * 1.6 + x) * 70, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCloud(x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 54, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 38, y + 8, 44, 17, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 38, y + 10, 36, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 2, y - 6, 32, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlatform(p) {
  const map = {
    ground: ["#9a6038", "#63c96f"], roof: ["#80624c", "#f0bd77"], tiny: ["#2e9e91", "#5de1cc"],
    spring: ["#9b37a8", "#f26cff"], dash: ["#252c58", "#5de1cc"], gravity: ["#572c86", "#ffe16a"],
    face: ["#663399", "#ffe16a"], rock: ["#382b2b", "#8f6b58"], ice: ["#5ec8f2", "#e8fbff"], finish: ["#b78d26", "#ffe16a"],
  }[p.kind] || ["#555", "#aaa"];
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = map[0];
  roundRect(p.x, p.y, p.w, p.h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = map[1];
  roundRect(p.x, p.y, p.w, Math.min(14, p.h), 9);
  ctx.fill();
  if (p.kind === "finish") {
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "900 22px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("ФИНИШ", p.x + p.w / 2, p.y - 14);
  }
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawHazard(h) {
  if (h.kind === "face") return drawFace(h.x + h.w / 2, h.y + h.h / 2 + Math.sin(state.t * 4 + h.x) * 18, h.w / 2, h.x);
  if (h.kind === "banana") {
    ctx.strokeStyle = "#ffe16a"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(h.x + h.w / 2, h.y + 18, 30, .2, Math.PI * .95); ctx.stroke(); return;
  }
  if (h.kind === "spike") {
    ctx.fillStyle = "#ff3d57"; ctx.beginPath(); ctx.moveTo(h.x, h.y + h.h); ctx.lineTo(h.x + h.w / 2, h.y); ctx.lineTo(h.x + h.w, h.y + h.h); ctx.fill(); return;
  }
  if (h.kind === "snowSpike") {
    ctx.fillStyle = "#e8fbff"; ctx.beginPath(); ctx.moveTo(h.x, h.y + h.h); ctx.lineTo(h.x + h.w / 2, h.y); ctx.lineTo(h.x + h.w, h.y + h.h); ctx.fill();
    ctx.strokeStyle = "#69c9ef"; ctx.lineWidth = 3; ctx.stroke(); return;
  }
  if (h.kind === "spikes") {
    ctx.fillStyle = "#ff3d57"; for (let x = h.x; x < h.x + h.w; x += 28) { ctx.beginPath(); ctx.moveTo(x, h.y + h.h); ctx.lineTo(x + 14, h.y); ctx.lineTo(x + 28, h.y + h.h); ctx.fill(); } return;
  }
  if (h.kind === "icePit") { ctx.fillStyle = "#0a335c"; ctx.fillRect(h.x, h.y, h.w, h.h); ctx.fillStyle = "rgba(232,251,255,.28)"; ctx.fillRect(h.x + 10, h.y + 8, h.w - 20, 5); return; }
  if (h.kind !== "lava") { ctx.fillStyle = h.kind === "jam" ? "#bc2359" : "#080911"; ctx.fillRect(h.x, h.y, h.w, h.h); }
}

function drawRope(r) {
  ctx.strokeStyle = "#d8ad73"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.h); ctx.stroke();
  ctx.fillStyle = "#ffe16a"; ctx.beginPath(); ctx.arc(r.x, r.y, 10, 0, Math.PI * 2); ctx.fill();
}

function drawCoin(c, i) {
  if (c.taken) return;
  ctx.save(); ctx.translate(c.x, c.y + Math.sin(state.t * 5 + i) * 5); ctx.rotate(Math.sin(state.t * 3 + i) * .15);
  ctx.fillStyle = "#ffe16a"; ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5b320e"; ctx.font = "900 14px Inter, system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(state.n === 2 ? "GD" : state.n === 3 ? "ха" : state.n === 4 ? "!" : state.n === 5 ? "ice" : "мем", 0, 1); ctx.restore();
}

function drawPlayer() {
  const p = state.p;
  const dir = p.vx < -20 ? -1 : 1;
  const step = Math.sin(p.a * 2.1);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.sin(p.a) * 0.06);
  ctx.scale(dir, 1);

  if (sparkleSprite.complete && sparkleSprite.naturalWidth > 0) {
    ctx.shadowColor = "rgba(255, 114, 173, .38)";
    ctx.shadowBlur = 18;
    ctx.drawImage(sparkleSprite, -68, -64 + Math.sin(p.a * 1.3) * 2, 128, 86);
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  ctx.shadowColor = "rgba(255, 114, 173, .42)";
  ctx.shadowBlur = 16;

  const body = ctx.createLinearGradient(-28, -24, 28, 24);
  body.addColorStop(0, "#ffffff");
  body.addColorStop(.55, "#fff7ff");
  body.addColorStop(1, "#eadcff");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-4, 3, 30, 18, -0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(45, 29, 90, .75)";
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.quadraticCurveTo(-22, -34, -42, -16);
  ctx.quadraticCurveTo(-27, -14, -15, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(24, -14, 18, 17, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(18, -29);
  ctx.lineTo(12, -50);
  ctx.lineTo(30, -33);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff0f7";
  ctx.beginPath();
  ctx.moveTo(34, -30);
  ctx.lineTo(43, -49);
  ctx.lineTo(47, -27);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const horn = ctx.createLinearGradient(28, -38, 36, -64);
  horn.addColorStop(0, "#fff6a7");
  horn.addColorStop(1, "#ffb233");
  ctx.fillStyle = horn;
  ctx.beginPath();
  ctx.moveTo(26, -31);
  ctx.lineTo(32, -61);
  ctx.lineTo(40, -31);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(110,72,16,.45)";
  ctx.stroke();

  drawMane();
  drawTail(step);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(45, 29, 90, .72)";
  ctx.lineWidth = 4;
  for (const leg of [
    [-20, 15, -22, 30 + step * 3],
    [-5, 16, -2, 31 - step * 2],
    [9, 15, 8, 31 + step * 2],
    [21, 12, 25, 28 - step * 3],
  ]) {
    ctx.beginPath();
    ctx.moveTo(leg[0], leg[1]);
    ctx.lineTo(leg[2], leg[3]);
    ctx.stroke();
    ctx.fillStyle = "#5f48c9";
    ctx.fillRect(leg[2] - 5, leg[3] - 1, 10, 5);
  }

  ctx.fillStyle = "#45aaf2";
  ctx.beginPath();
  ctx.arc(31, -16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(29, -18, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(45,29,90,.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(33, -7, 7, .25, Math.PI - .05);
  ctx.stroke();

  ctx.fillStyle = "#ff72ad";
  ctx.beginPath();
  ctx.arc(41, -11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMane() {
  const colors = ["#ff72ad", "#ffd45c", "#42c995", "#54b8ff", "#8e67ff"];
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  colors.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(10 + index * 4, -26 - index * 1.5);
    ctx.quadraticCurveTo(3 + index * 2, -18 + index * 2, 7 - index, -7 + index * 3);
    ctx.stroke();
  });
}

function drawTail(step) {
  const colors = ["#ff72ad", "#ffd45c", "#42c995", "#54b8ff", "#8e67ff"];
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  colors.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.quadraticCurveTo(-52 - index * 2, -18 + index * 7 + step * 2, -65, -3 + index * 5);
    ctx.stroke();
  });
}

function drawFace(x, y, r, mood = 0) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = mood % 2 ? "#5de1cc" : "#ffe16a";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1b1b25";
  ctx.beginPath(); ctx.arc(-r * .32, -r * .2, r * .12, 0, Math.PI * 2); ctx.arc(r * .32, -r * .2, r * .12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1b1b25"; ctx.lineWidth = Math.max(3, r * .12); ctx.beginPath(); ctx.arc(0, r * .08, r * .42, .1, Math.PI - .1); ctx.stroke(); ctx.restore();
}

function drawBeast(b) {
  ctx.save(); ctx.translate(b.x, b.y + Math.sin(state.t * 8) * 8);
  ctx.fillStyle = "#171015"; ctx.beginPath(); ctx.ellipse(0, 0, 58, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff3d57"; ctx.beginPath(); ctx.arc(-18, -10, 5, 0, Math.PI * 2); ctx.arc(16, -10, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#171015"; ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(-28, -62); ctx.lineTo(-10, -28); ctx.moveTo(18, -28); ctx.lineTo(35, -62); ctx.lineTo(43, -20); ctx.fill(); ctx.restore();
}

function loop(now) {
  const dt = Math.min(.033, (now - last) / 1000);
  last = now;
  if (state.running) { update(dt); draw(); raf = requestAnimationFrame(loop); }
}

function showMenu() {
  state = makeLevel(1);
  title.textContent = levelNames[1];
  text.textContent = "Сначала паркур. Потом Dash. Потом смешные лица. Потом лава и зверь. А дальше пятый ледяной уровень со скольжением.";
  start.textContent = "Начать";
  start.onclick = () => startLevel(1);
  overlay.classList.remove("hidden");
  updateHud(); draw();
}

function action(code) {
  if (["ArrowUp", "KeyW", "Space"].includes(code)) jumpQueued = true;
  if (["ArrowDown", "KeyS", "ShiftLeft", "ShiftRight"].includes(code)) dashQueued = true;
}

window.addEventListener("keydown", e => {
  if (!keys.has(e.code)) action(e.code);
  keys.add(e.code);
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","ShiftLeft","ShiftRight"].includes(e.code)) e.preventDefault();
});
window.addEventListener("keyup", e => keys.delete(e.code));
document.querySelectorAll(".touch button").forEach(button => {
  const code = button.dataset.key;
  button.addEventListener("pointerdown", () => { keys.add(code); action(code); });
  button.addEventListener("pointerup", () => keys.delete(code));
  button.addEventListener("pointerleave", () => keys.delete(code));
});

showMenu();
