const canvas = document.getElementById('Battleground');
const ctx = canvas.getContext('2d');
// Sound Z Image
const soundBeamImage = new Image();
soundBeamImage.src = 'sound z.svg';
//Enemy image
const enemyImage =new Image();
enemyImage.src = 'Base.svg';
//Player stats & more!
let knockback=5
let lastAngle=0
let mouseInsideCanvas = true;
let soundBeam = null;
let showImageBar=true;
let playerX = 50;
let playerY = 50;
let flameSelected = 0;
let soundSelected = 0;
let iceSelected = 0;
let gravitySelected = 0;
let xMoveActive = false;
let xMoveTimer = 0;
let xLines = []; // store line objects
let playerHue = 0; // flasy flash
const soundBeams = [];
const playerWidth = 40;
const playerHeight = 40;
const speed = 5;

//Track da keys!
const keys ={};

//Just an annoying gitch fix!
canvas.addEventListener('mouseenter', () => {
  mouseInsideCanvas = true;
});

canvas.addEventListener('mouseleave', () => {
  mouseInsideCanvas = false;
});


// Mouse tracking
let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  // Check if mouse is inside 
  mouseInsideCanvas =
    mouseX >= 0 && mouseX <= canvas.width &&
    mouseY >= 0 && mouseY <= canvas.height;
});

//The actual player image
const playerImage = new Image();
playerImage.src = 'regular.svg';

//Screen resizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
//Toolbar & its contents
const imageBar =[
{ name: 'flame' ,src: 'flame.svg', img: new Image(), x:50, y:20},
{ name: 'sound' ,src: 'backdrop1.svg', img: new Image(), x:120, y:20 },
{ name: 'ice' ,src: 'costume2.svg', img: new Image(), x:190, y:20 },
{ name: 'gravity' ,src: 'costume1.svg', img: new Image(), x:260, y:20 }
]; // Text at the bottom code! (tells what fruit u have)
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (!showImageBar) return;

  imageBar.forEach(item => {
    if (
      clickX >= item.x &&
      clickX <= item.x + 50 &&
      clickY >= item.y &&
      clickY <= item.y + 50
    ) {
      handleImageClick(item.name);
    }
  });
});

imageBar.forEach(item => item.img.src = item.src);
//Make toolbar
function drawImageBar() {
  if (!showImageBar) return;

  imageBar.forEach(item => {
    if (item.img.complete) {
      ctx.drawImage(item.img, item.x, item.y, 50, 50);
    }
  });
}
//Smooth movement loop
function gameLoop(){
  // Keep updating position
  if (keys['arrowup'] || keys['w']) playerY -= speed;
  if (keys['arrowdown'] || keys['s']) playerY += speed;
  if (keys['arrowleft'] || keys['a']) playerX -= speed;
  if (keys['arrowright'] || keys['d']) playerX += speed;
if (playerX < 0) playerX = 0;
if (playerY < 0) playerY = 0;
if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
if (playerY + playerHeight > canvas.height) playerY = canvas.height - playerHeight;

  // The background
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  enemies.forEach(enemy => {
  if (enemy.img.complete) {
    ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
  }

  // Draw HP above enemy
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.fillText('HP: ' + enemy.hp, enemy.x, enemy.y - 5);
});
// X move special
if (xMoveActive) {
  // Flash colors
  playerHue = (playerHue + 40) % 360;
if (xMoveActive) {
  // Spawn lines in all directions
  if (xLines.length === 0) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      xLines.push({
        angle,
        distance: 0,
        growing: true
      });
    }
  }

  // Update and draw lines
  ctx.strokeStyle = `hsl(${(Date.now()/10)%360}, 100%, 50%)`; // flashy colors
  ctx.lineWidth = 3;

  xLines.forEach(line => {
    if (line.growing) {
      line.distance += 10;
      if (line.distance > 150) line.growing = false;
    } else {
      line.distance -= 10;
      if (line.distance <= 0) line.distance = 0;
    }

    const startX = playerX + playerWidth / 2;
    const startY = playerY + playerHeight / 2;
    const endX = startX + Math.cos(line.angle) * line.distance;
    const endY = startY + Math.sin(line.angle) * line.distance;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });

  

}

  // Update and draw lines
  ctx.strokeStyle = `hsl(${(Date.now()/10)%360}, 100%, 50%)`; // flashy colors
  ctx.lineWidth = 6;

  xLines.forEach(line => {
    if (line.growing) {
      line.distance += 10;
      if (line.distance > 150) line.growing = false;
    } else {
      line.distance -= 10;
      if (line.distance <= 0) line.growing = true;
    }

    const startX = playerX + playerWidth / 2;
    const startY = playerY + playerHeight / 2;
    const endX = startX + Math.cos(line.angle) * line.distance;
    const endY = startY + Math.sin(line.angle) * line.distance;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
checkXLineCollisions();
  // Countdown
  xMoveTimer--;
  if (xMoveTimer <= 0) {
    xMoveActive = false;
    xLines = [];
  }
}
  





// RAINBOW BARF BEAM
 soundBeams.forEach((beam, index) => {
  if (beam.delay > 0) {
    beam.delay--;
    return;
  }

  beam.distance += 20;
  beam.scale += 0.05;
  beam.alpha -= 0.02;
  beam.hue = (beam.hue + 2) % 360; // COLORS!

  if (beam.alpha <= 0) {
    soundBeams.splice(index, 1);
    return;
  }

  const drawX = beam.x + Math.cos(beam.angle) * beam.distance;
  const drawY = beam.y + Math.sin(beam.angle) * beam.distance;
  const beamLength = 120 * beam.scale;
  const beamWidth = 90 * beam.scale;

  // Draw original image
  ctx.save();
  ctx.globalAlpha = beam.alpha;
  ctx.translate(drawX, drawY);
  ctx.rotate(beam.angle);
  ctx.drawImage(soundBeamImage, 0, -beamWidth / 2, beamLength, beamWidth);

  // Overlay color tint
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = `hsla(${beam.hue}, 100%, 50%, ${beam.alpha})`;
  ctx.fillRect(0, -beamWidth / 2, beamLength, beamWidth);

  ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; // reset blend mode
});
checkBeamCollisions();
 // Calculates what angle player need to face mouse
  let angle = lastAngle; // default to last known angle

if (mouseInsideCanvas) {
  const dx = mouseX - (playerX + playerWidth / 2);
  const dy = mouseY - (playerY + playerHeight / 2);
  angle = Math.atan2(dy, dx);

  // store the latest angle so we can freeze it later
  lastAngle = angle;
}

// Player go weweweweweweweweeeeee!
  if (playerImage.complete) {
    ctx.save();
    ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2);
    ctx.rotate(angle);
    ctx.drawImage(playerImage, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
  
    if (xMoveActive) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `hsla(${playerHue}, 100%, 50%, 0.6)`;
    ctx.fillRect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
    ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

updateEnemies()

  // Text of what fruit u have
ctx.fillStyle = 'black';
ctx.font = '20px Arial';
ctx.fillText('Active Fruit: ' + getActiveFruitName(), 20, canvas.height - 30);


  // makes image bar(again)
drawImageBar();
requestAnimationFrame(gameLoop);
}

function checkBeamCollisions() {
  soundBeams.forEach(beam => {
    enemies.forEach(enemy => {
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height / 2;

      const bx = beam.x + Math.cos(beam.angle) * beam.distance;
      const by = beam.y + Math.sin(beam.angle) * beam.distance;

      const dx = bx - ex;
      const dy = by - ey;
      const dist = Math.sqrt(dx*dx + dy*dy);

      const now = Date.now();

      if (dist < enemy.width / 2) {
        if (now - enemy.lastHitTime > 40) { // limit hits per enemy
          let damage = 4;

          if (isTouchingPlayer(enemy)) {
            damage = 0.5; // touching = reduced damage
          }

          enemy.hp -= damage;
          enemy.hp = Math.round(enemy.hp);
          enemy.hp = Math.max(0, enemy.hp);
          enemy.lastHitTime = now;

          //Knockback effect
          const dxFromPlayer = enemy.x + enemy.width / 2 - (playerX + playerWidth / 2);
          const dyFromPlayer = enemy.y + enemy.height / 2 - (playerY + playerHeight / 2);
          const distFromPlayer = Math.sqrt(dxFromPlayer * dxFromPlayer + dyFromPlayer * dyFromPlayer);

          if (distFromPlayer > 0) {
            enemy.x += (dxFromPlayer / distFromPlayer) * knockback;
            enemy.y += (dyFromPlayer / distFromPlayer) * knockback;
          }
        }
      }
    });
  });
}
function checkXLineCollisions() {
  const now = Date.now();
  enemies.forEach(enemy => {
    const ex = enemy.x + enemy.width / 2;
    const ey = enemy.y + enemy.height / 2;

    xLines.forEach(line => {
      const startX = playerX + playerWidth / 2;
      const startY = playerY + playerHeight / 2;
      const endX = startX + Math.cos(line.angle) * line.distance;
      const endY = startY + Math.sin(line.angle) * line.distance;

      const dx = endX - startX;
      const dy = endY - startY;
      const lengthSq = dx*dx + dy*dy;
      let t = ((ex - startX) * dx + (ey - startY) * dy) / lengthSq;
      t = Math.max(0, Math.min(1, t));
      const closestX = startX + t * dx;
      const closestY = startY + t * dy;
      const dist = Math.sqrt((ex - closestX)**2 + (ey - closestY)**2);

      if (dist < enemy.width/2) {
        // Damage throttled
        if (now - enemy.lastHitTime > 75) {
          enemy.hp -= 15;
          enemy.hp = Math.max(0, enemy.hp);
          enemy.lastHitTime = now;
        }

        // Knockback always on collision
        const dxFromPlayer = ex - (playerX + playerWidth / 2);
        const dyFromPlayer = ey - (playerY + playerHeight / 2);
        const distFromPlayer = Math.sqrt(dxFromPlayer * dxFromPlayer + dyFromPlayer * dyFromPlayer);

        if (distFromPlayer > 0) {
          enemy.x += (dxFromPlayer / distFromPlayer) * (knockback/1.5);
          enemy.y += (dyFromPlayer / distFromPlayer) * (knockback/1.5);
        }
      }
    });
  });
}


//enemy stats!
const enemies=[];
function spawnEnemy(){
  enemies.push({
    x: Math.random()* canvas.width,
    y: Math.random()*canvas.height,
    width:50,
    height:50,
    hp:400,
    maxhp:400,
    speed:2,
    img: enemyImage,
    lastHitTime: 0
  });
}

//Enemy movement
function updateEnemies(){
  enemies.forEach(enemy => {
    const dx= playerX-enemy.x;
    const dy= playerY-enemy.y;
    //Formula for distance here!
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }
  });
}
// Enemy Collision w/player
function isTouchingPlayer(enemy) {
  return (
    enemy.x < playerX + playerWidth &&
    enemy.x + enemy.width > playerX &&
    enemy.y < playerY + playerHeight &&
    enemy.y + enemy.height > playerY
  );
}


// Key listeners
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;

  if (key === 'x' && soundSelected) {
  xMoveActive = true;
  xMoveTimer = 80; // lasts ~1 second
   xLines = []; // reset lines
}

if (key === 'z' && soundSelected) {
  const angle = Math.atan2(
    mouseY - (playerY + playerHeight / 2),
    mouseX - (playerX + playerWidth / 2)
  );
// Sound z stats
  for (let i = 0; i < 30; i++) {
    soundBeams.push({
      x: playerX + playerWidth / 2,
      y: playerY + playerHeight / 2,
      angle: angle,
      distance: 0,
      scale: 0.5 + i * 0.03,
      alpha: 1,
      delay: i * 2,
       hue: i * 50
    });
  }
}
// hue hue hue



});
  
document.addEventListener('fullscreenchange', () => {
  resizeCanvas();
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});
// Variables
function handleImageClick(name){
  flameSelected=0;
  soundSelected=0;
  gravitySelected=0;
  iceSelected=0;

  switch (name){
    case 'flame':
      flameSelected=1;
      console.log('Flame fruit activated');
      break;
      case 'sound':
        soundSelected=1;
        console.log('Sound fruit activated')
        break;
        case 'ice':
        iceSelected=1;
        console.log('Ice fruit activated')
        break;
        case 'gravity':
        gravitySelected=1;
        console.log('Gravity fruit activated')
        break;
  }
}
// What fruit you have
function getActiveFruitName() {
  if (flameSelected) return 'Flame';
  if (soundSelected) return 'Sound';
  if (iceSelected) return 'Ice';
  if (gravitySelected) return 'Gravity';
  return 'None';
}
playerImage.onload = () => {
  resizeCanvas();
};

// Main menu & start button
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('mainMenu').style.display = 'none';
  resizeCanvas();
  spawnEnemy();  // self-explainatory(plz say i spelled that right)
  gameLoop();
});

