// Ensure DOM is ready before we touch elements
document.addEventListener('DOMContentLoaded', () => {
  // 1) Grab DOM elements
  const canvas = document.getElementById('Battleground');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startButton');
  const mainMenu = document.getElementById('mainMenu');

  if (!canvas || !ctx) {
    console.error('Canvas or 2D context not found. Check <canvas id="Battleground"> in HTML.');
    return;
  }
  if (!startBtn || !mainMenu) {
    console.error('Start button or main menu not found. Check HTML IDs.');
    return;
  }

  // 2) Globals (put ALL globals here; declare each ONCE)
  const soundBeamImage = new Image(); soundBeamImage.src = 'sound z.svg';
  const enemyImage = new Image(); enemyImage.src = 'Base.svg';
  const playerImage = new Image(); playerImage.src = 'regular.svg';
  const bigCircleImage = new Image(); bigCircleImage.src = 'sound x.svg';

  let knockback = 5, lastAngle = 0;
  let mouseInsideCanvas = true, showImageBar = true;
  let playerX = 50, playerY = 50;
  let flameSelected = 0, soundSelected = 0, iceSelected = 0, gravitySelected = 0;
  const playerWidth = 40, playerHeight = 40, speed = 5;

  const keys = {};
  let mouseX = 0, mouseY = 0;

  const enemies = [];
  const soundBeams = [];
  let orbitCircles = [];
  let attackCircle = null;

  const imageBar = [
    { name: 'flame', src: 'flame.svg', img: new Image(), x: 50, y: 20 },
    { name: 'sound', src: 'backdrop1.svg', img: new Image(), x: 120, y: 20 },
    { name: 'ice', src: 'costume2.svg', img: new Image(), x: 190, y: 20 },
    { name: 'gravity', src: 'costume1.svg', img: new Image(), x: 260, y: 20 }
  ];
  imageBar.forEach(item => item.img.src = item.src);

  // 3) Helpers and game functions
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  function handleImageClick(name) {
    flameSelected = soundSelected = iceSelected = gravitySelected = 0;
    if (name === 'flame') flameSelected = 1;
    if (name === 'sound') soundSelected = 1;
    if (name === 'ice') iceSelected = 1;
    if (name === 'gravity') gravitySelected = 1;
  }

  function getActiveFruitName() {
    if (flameSelected) return 'Flame';
    if (soundSelected) return 'Sound';
    if (iceSelected) return 'Ice';
    if (gravitySelected) return 'Gravity';
    return 'None';
  }

  function spawnEnemy() {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      width: 50, height: 50,
      hp: 400, maxhp: 400,
      speed: 2, img: enemyImage,
      lastHitTime: 0, stunTime: 0
    });
  }

  function updateEnemies() {
    enemies.forEach(enemy => {
      if (enemy.stunTime > 0) { enemy.stunTime -= 16; return; }
      const dx = playerX - enemy.x, dy = playerY - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 0) { enemy.x += (dx/dist) * enemy.speed; enemy.y += (dy/dist) * enemy.speed; }
    });
  }

  function isTouchingPlayer(enemy) {
    return enemy.x < playerX + playerWidth &&
           enemy.x + enemy.width > playerX &&
           enemy.y < playerY + playerHeight &&
           enemy.y + enemy.height > playerY;
  }

  function checkBeamCollisions() {
    soundBeams.forEach(beam => {
      enemies.forEach(enemy => {
        const ex = enemy.x + enemy.width / 2;
        const ey = enemy.y + enemy.height / 2;
        const bx = beam.x + Math.cos(beam.angle) * beam.distance;
        const by = beam.y + Math.sin(beam.angle) * beam.distance;
        const dx = bx - ex, dy = by - ey;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const now = Date.now();
        if (dist < enemy.width / 2 && now - enemy.lastHitTime > 25) {
          let damage = 4;
          if (isTouchingPlayer(enemy)) damage = 0.5;
          enemy.hp = Math.max(0, Math.round(enemy.hp - damage));
          enemy.lastHitTime = now;
          const dxP = ex - (playerX + playerWidth / 2);
          const dyP = ey - (playerY + playerHeight / 2);
          const dP = Math.sqrt(dxP*dxP + dyP*dyP);
          if (dP > 0) { enemy.x += (dxP/dP) * knockback; enemy.y += (dyP/dP) * knockback; }
          enemy.stunTime = 500;
        }
      });
    });
  }

  // Sound Z beams add function (optional)
  function addSoundZBeamBurst(angle) {
    for (let i = 0; i < 30; i++) {
      soundBeams.push({
        x: playerX + playerWidth / 2,
        y: playerY + playerHeight / 2,
        angle,
        distance: 0,
        scale: 0.5 + i * 0.03,
        alpha: 1,
        delay: i * 2,
        hue: i * 50
      });
    }
  }

  // Orbit move setup
  function startOrbitMove() {
    orbitCircles.length = 0;
    for (let i = 0; i < 4; i++) {
      orbitCircles.push({
        angle: (Math.PI / 2) * i,
        radius: 60,
        size: 20,
        hue: i * 90,
        phase: 1
      });
    }
  }

  // Big circle image + perimeter lines
  function spawnAttackCircle(x, y) {
    attackCircle = { x, y, size: 100, img: bigCircleImage, hue: 0, life: 600 };
  }
  function drawAttackCircle() {
    if (!attackCircle) return;
    if (attackCircle.img.complete) {
      ctx.save();
      ctx.translate(attackCircle.x, attackCircle.y);
      ctx.drawImage(
        attackCircle.img,
        -attackCircle.size / 2,
        -attackCircle.size / 2,
        attackCircle.size,
        attackCircle.size
      );
      ctx.restore();
    }
    ctx.strokeStyle = `hsl(${attackCircle.hue}, 100%, 50%)`;
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 / 12) * i;
      const lx = attackCircle.x + Math.cos(a) * (attackCircle.size / 2);
      const ly = attackCircle.y + Math.sin(a) * (attackCircle.size / 2);
      ctx.beginPath(); ctx.moveTo(attackCircle.x, attackCircle.y); ctx.lineTo(lx, ly); ctx.stroke();
    }
    attackCircle.hue = (attackCircle.hue + 2) % 360;
    attackCircle.life -= 16;
    if (attackCircle.life <= 0) attackCircle = null;
  }

  function drawImageBar() {
    if (!showImageBar) return;
    imageBar.forEach(item => { if (item.img.complete) ctx.drawImage(item.img, item.x, item.y, 50, 50); });
  }

  // 4) Event listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseInsideCanvas = mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height;
  });
  canvas.addEventListener('mouseenter', () => { mouseInsideCanvas = true; });
  canvas.addEventListener('mouseleave', () => { mouseInsideCanvas = false; });

  canvas.addEventListener('click', (e) => {
    if (!showImageBar) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left, clickY = e.clientY - rect.top;
    imageBar.forEach(item => {
      if (clickX >= item.x && clickX <= item.x + 50 && clickY >= item.y && clickY <= item.y + 50) {
        handleImageClick(item.name);
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase(); keys[key] = true;
    if (key === 'z' && soundSelected) {
      const ang = Math.atan2(mouseY - (playerY + playerHeight / 2), mouseX - (playerX + playerWidth / 2));
      addSoundZBeamBurst(ang);
    }
    if (key === 'x' && soundSelected) {
      startOrbitMove();
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  // 5) Game loop
  function gameLoop() {
    // Movement
    if (keys['arrowup'] || keys['w']) playerY -= speed;
    if (keys['arrowdown'] || keys['s']) playerY += speed;
    if (keys['arrowleft'] || keys['a']) playerX -= speed;
    if (keys['arrowright'] || keys['d']) playerX += speed;

    // Clamp
    if (playerX < 0) playerX = 0;
    if (playerY < 0) playerY = 0;
    if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
    if (playerY + playerHeight > canvas.height) playerY = canvas.height - playerHeight;

    // Background
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.img.complete) ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = 'black'; ctx.font = '14px Arial';
      ctx.fillText('HP: ' + enemy.hp, enemy.x, enemy.y - 5);
    });

    // Orbiting rainbow circles
    orbitCircles.forEach((circle, index) => {
      const cx = playerX + playerWidth/2 + Math.cos(circle.angle) * circle.radius;
      const cy = playerY + playerHeight/2 + Math.sin(circle.angle) * circle.radius;

      if (circle.phase === 1) {
        circle.angle += 0.05;
        circle.hue = (circle.hue + 2) % 360;
        ctx.fillStyle = `hsl(${circle.hue}, 100%, 50%)`;
        ctx.beginPath(); ctx.arc(cx, cy, circle.size, 0, Math.PI*2); ctx.fill();
        circle.radius -= 0.5;
        circle.size = Math.max(5, circle.size - 0.1);
        if (circle.radius <= 20) circle.phase = 2;
      }

      if (circle.phase === 2) {
        const dx = mouseX - cx, dy = mouseY - cy;
        circle.angle = Math.atan2(dy, dx);
        circle.radius += 2;
        circle.size += 0.2;
        ctx.fillStyle = `hsl(${circle.hue}, 100%, 50%)`;
        ctx.beginPath(); ctx.arc(cx, cy, circle.size, 0, Math.PI*2); ctx.fill();
        if (circle.size > 30) {
          orbitCircles.splice(index, 1);
          if (orbitCircles.length === 0) spawnAttackCircle(mouseX, mouseY);
        }
      }
    });

    // Big circle image attack
    drawAttackCircle();

    // Sound Z beams simulation & draw
    soundBeams.forEach((beam, index) => {
      if (beam.delay > 0) { beam.delay--; return; }
      beam.distance += 20; beam.scale += 0.05; beam.alpha -= 0.02;
      beam.hue = (beam.hue + 2) % 360;
      if (beam.alpha <= 0) { soundBeams.splice(index, 1); return; }
      const drawX = beam.x + Math.cos(beam.angle) * beam.distance;
      const drawY = beam.y + Math.sin(beam.angle) * beam.distance;
      const beamLength = 120 * beam.scale, beamWidth = 90 * beam.scale;
      ctx.save(); ctx.globalAlpha = beam.alpha; ctx.translate(drawX, drawY); ctx.rotate(beam.angle);
      ctx.drawImage(soundBeamImage, 0, -beamWidth / 2, beamLength, beamWidth);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `hsla(${beam.hue}, 100%, 50%, ${beam.alpha})`;
      ctx.fillRect(0, -beamWidth / 2, beamLength, beamWidth);
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
    });

    // Player aim angle
    let angle = lastAngle;
    if (mouseInsideCanvas) {
      const dx = mouseX - (playerX + playerWidth / 2);
      const dy = mouseY - (playerY + playerHeight / 2);
      angle = Math.atan2(dy, dx); lastAngle = angle;
    }

    // Collisions
    checkBeamCollisions();

    // Player draw
    if (playerImage.complete) {
      ctx.save();
      ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2);
      ctx.rotate(angle);
      ctx.drawImage(playerImage, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
      ctx.restore();
    }

    // Update enemies
    updateEnemies();

    // UI text and toolbar
    ctx.fillStyle = 'black'; ctx.font = '20px Arial';
    ctx.fillText('Active Fruit: ' + getActiveFruitName(), 20, canvas.height - 30);
    drawImageBar();

    requestAnimationFrame(gameLoop);
  }

  // 6) Start button
  playerImage.onload = () => { resizeCanvas(); };
  startBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    resizeCanvas();
    spawnEnemy();
    gameLoop();
  });

  // Initial resize
  resizeCanvas();
});










