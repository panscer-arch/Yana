const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const kolobokSprite = new Image();
kolobokSprite.src = "../../assets/sprites/kolobok-sprite.png";
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start");
const crumbsText = document.querySelector("#crumbs");
const fearText = document.querySelector("#fear");
const timeText = document.querySelector("#time");

const keys = new Set();
const world = { width: 960, height: 640 };

let state;
let lastTime = 0;
let rafId = 0;

const rand = (min, max) => Math.random() * (max - min) + min;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function resetGame() {
  state = {
    running: true,
    won: false,
    lost: false,
    elapsed: 0,
    fear: 15,
    pulse: 0,
    player: { x: 138, y: 510, r: 22, speed: 230, angle: 0 },
    crumbs: [],
    enemies: [
      { x: 790, y: 104, r: 27, speed: 96, mood: 0, name: "лиса" },
      { x: 470, y: 330, r: 31, speed: 74, mood: 2.4, name: "тень" },
      { x: 820, y: 515, r: 24, speed: 116, mood: 4.2, name: "шепот" },
    ],
    trees: [],
    oven: null,
    message: "",
  };

  for (let i = 0; i < 9; i += 1) {
    state.crumbs.push({
      x: rand(90, world.width - 90),
      y: rand(90, world.height - 90),
      r: 9,
      glow: rand(0, Math.PI * 2),
      taken: false,
    });
  }

  for (let i = 0; i < 38; i += 1) {
    state.trees.push({
      x: rand(25, world.width - 25),
      y: rand(55, world.height - 25),
      h: rand(34, 84),
      w: rand(9, 18),
      sway: rand(0, Math.PI * 2),
    });
  }

  overlay.classList.add("hidden");
  lastTime = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function finish(message, won) {
  state.running = false;
  state.won = won;
  state.lost = !won;
  overlay.querySelector("h1").textContent = won ? "Печь теплая" : "Песня оборвалась";
  overlay.querySelector("p").textContent = message;
  startButton.textContent = "Еще раз";
  overlay.classList.remove("hidden");
}

function update(dt) {
  state.elapsed += dt;
  state.pulse += dt;
  const player = state.player;
  let vx = 0;
  let vy = 0;

  if (keys.has("ArrowUp") || keys.has("KeyW")) vy -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) vy += 1;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) vx -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) vx += 1;

  if (vx || vy) {
    const len = Math.hypot(vx, vy);
    player.x += (vx / len) * player.speed * dt;
    player.y += (vy / len) * player.speed * dt;
    player.angle += dt * 7.5;
  }

  player.x = clamp(player.x, player.r, world.width - player.r);
  player.y = clamp(player.y, player.r + 42, world.height - player.r);

  for (const enemy of state.enemies) {
    const wobbleX = Math.cos(state.elapsed * 1.7 + enemy.mood) * 80;
    const wobbleY = Math.sin(state.elapsed * 1.1 + enemy.mood) * 58;
    const target = {
      x: player.x + wobbleX,
      y: player.y + wobbleY,
    };
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    enemy.x += (dx / len) * enemy.speed * dt;
    enemy.y += (dy / len) * enemy.speed * dt;

    const closeness = Math.max(0, 1 - dist(player, enemy) / 190);
    state.fear += closeness * 24 * dt;
    if (dist(player, enemy) < player.r + enemy.r - 6) {
      finish(`Колобок встретил ${enemy.name}, а дальше лес стал совсем тихим.`, false);
    }
  }

  for (const crumb of state.crumbs) {
    if (!crumb.taken && dist(player, crumb) < player.r + crumb.r + 4) {
      crumb.taken = true;
      state.fear = Math.max(0, state.fear - 12);
    }
  }

  const collected = state.crumbs.filter((crumb) => crumb.taken).length;
  if (collected === state.crumbs.length && !state.oven) {
    state.oven = { x: world.width - 90, y: world.height - 95, r: 36 };
  }

  if (state.oven && dist(player, state.oven) < player.r + state.oven.r) {
    finish("Колобок вкатывается в тепло. За окном кто-то еще поет, но уже не тебе.", true);
  }

  state.fear += 2.8 * dt;
  if (state.fear >= 100) {
    finish("Страх стал больше леса. Колобок забыл, куда катился.", false);
  }

  updateHud(collected);
}

function updateHud(collected) {
  crumbsText.textContent = `${collected} / ${state.crumbs.length}`;
  fearText.textContent = `${Math.round(clamp(state.fear, 0, 100))}%`;
  const total = Math.floor(state.elapsed);
  timeText.textContent = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, world.height);
  sky.addColorStop(0, "#10182a");
  sky.addColorStop(.45, "#172414");
  sky.addColorStop(1, "#07090b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, world.width, world.height);

  const moon = ctx.createRadialGradient(770, 96, 0, 770, 96, 92);
  moon.addColorStop(0, "rgba(255, 231, 158, .95)");
  moon.addColorStop(.45, "rgba(255, 231, 158, .38)");
  moon.addColorStop(1, "rgba(255, 231, 158, 0)");
  ctx.fillStyle = moon;
  ctx.fillRect(620, 0, 250, 220);

  const gradient = ctx.createRadialGradient(480, 360, 80, 480, 360, 620);
  gradient.addColorStop(0, "rgba(69, 78, 43, .62)");
  gradient.addColorStop(0.62, "rgba(10, 16, 16, .62)");
  gradient.addColorStop(1, "rgba(3, 4, 5, .8)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.strokeStyle = "rgba(206, 169, 98, 0.12)";
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(0, 568);
  ctx.bezierCurveTo(220, 505, 306, 456, 446, 382);
  ctx.bezierCurveTo(610, 296, 674, 210, 960, 174);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 214, 130, .2)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 580);
  ctx.bezierCurveTo(230, 520, 315, 470, 455, 398);
  ctx.bezierCurveTo(620, 312, 684, 228, 960, 190);
  ctx.stroke();

  for (const tree of state.trees) {
    const sway = Math.sin(state.elapsed * 1.8 + tree.sway) * 3;
    ctx.fillStyle = "rgba(15, 26, 20, 0.9)";
    ctx.fillRect(tree.x - tree.w / 2, tree.y, tree.w, tree.h);
    ctx.fillStyle = "rgba(7, 17, 14, 0.94)";
    ctx.beginPath();
    ctx.moveTo(tree.x + sway, tree.y - tree.h * 0.62);
    ctx.lineTo(tree.x - tree.h * 0.36 + sway, tree.y + tree.h * 0.28);
    ctx.lineTo(tree.x + tree.h * 0.36 + sway, tree.y + tree.h * 0.28);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCrumbs() {
  for (const crumb of state.crumbs) {
    if (crumb.taken) continue;
    const glow = 0.55 + Math.sin(state.pulse * 5 + crumb.glow) * 0.25;
    ctx.shadowColor = `rgba(255, 214, 130, ${glow})`;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffd46e";
    ctx.beginPath();
    ctx.arc(crumb.x, crumb.y, crumb.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawOven() {
  if (!state.oven) return;
  const oven = state.oven;
  ctx.shadowColor = "rgba(255, 142, 73, 0.85)";
  ctx.shadowBlur = 34;
  ctx.fillStyle = "#9d4936";
  ctx.fillRect(oven.x - 42, oven.y - 18, 84, 48);
  ctx.beginPath();
  ctx.arc(oven.x, oven.y - 18, 42, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#ffb45e";
  ctx.beginPath();
  ctx.arc(oven.x, oven.y + 5, 18, Math.PI, 0);
  ctx.lineTo(oven.x + 18, oven.y + 24);
  ctx.lineTo(oven.x - 18, oven.y + 24);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(Math.sin(state.elapsed * 2 + enemy.mood) * 0.12);
    ctx.shadowColor = "rgba(190, 34, 54, 0.55)";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "rgba(16, 12, 15, 0.96)";
    ctx.beginPath();
    ctx.ellipse(0, 0, enemy.r * 0.92, enemy.r * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f04a42";
    ctx.beginPath();
    ctx.arc(-8, -5, 3.8, 0, Math.PI * 2);
    ctx.arc(8, -5, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

function drawPlayer() {
  const player = state.player;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  if (kolobokSprite.complete && kolobokSprite.naturalWidth > 0) {
    ctx.shadowColor = "rgba(255, 202, 97, 0.55)";
    ctx.shadowBlur = 18;
    const bounce = Math.sin(state.elapsed * 10) * 3;
    const squash = 1 + Math.sin(state.elapsed * 10) * .04;
    ctx.scale(squash, 1 / squash);
    ctx.drawImage(kolobokSprite, -36, -36 + bounce, 72, 54);
    ctx.restore();
    ctx.shadowBlur = 0;
    return;
  }
  ctx.shadowColor = "rgba(255, 202, 97, 0.55)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#d99532";
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1c26a";
  ctx.beginPath();
  ctx.arc(-6, -8, 4, 0, Math.PI * 2);
  ctx.arc(8, -8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4f250d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(1, 4, 9, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawVignette() {
  const fear = clamp(state.fear / 100, 0, 1);
  const gradient = ctx.createRadialGradient(
    state.player.x,
    state.player.y,
    90 - fear * 40,
    state.player.x,
    state.player.y,
    520 - fear * 180,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.72, `rgba(0, 0, 0, ${0.42 + fear * 0.18})`);
  gradient.addColorStop(1, `rgba(12, 0, 2, ${0.82 + fear * 0.16})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, world.width, world.height);
}

function draw() {
  drawBackground();
  drawOven();
  drawCrumbs();
  drawEnemies();
  drawPlayer();
  drawVignette();
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  if (state.running) {
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }
}

startButton.addEventListener("click", resetGame);

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

for (const button of document.querySelectorAll(".touch-controls button")) {
  const map = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  };
  const code = map[button.dataset.dir];
  button.addEventListener("pointerdown", () => keys.add(code));
  button.addEventListener("pointerup", () => keys.delete(code));
  button.addEventListener("pointerleave", () => keys.delete(code));
}

drawBackground();
drawCrumbs();
drawPlayer();
