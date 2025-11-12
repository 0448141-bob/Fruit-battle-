const canvas = document.getElementById('Battleground');
const ctx = canvas.getContext('2d');
// Sound Z Image
const soundBeamImage = new Image();
soundBeamImage.src = 'sound z.svg';
//Enemy image
const enemyImage =new Image();
enemyImage.src = 'Base.svg';
//Player stats & more!
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
// Border to keep the player in
// Border collision (clamp position)
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

    let damage = 0.5;

const now = Date.now(); // current time in ms

if (dist < enemy.width / 2) {
  // Only apply damage if enough time has passed
  if (now - enemy.lastHitTime > (25)){ // 25ms = 40 hits/sec max
    let damage = 4;

    if (isTouchingPlayer(enemy)) {
      damage = 0.5; // touching = reduced damage
    }

    enemy.hp -= damage;
    enemy.hp = Math.round(enemy.hp);
    enemy.lastHitTime = now; // update last hit time
  }
}

    
    
});
  });
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

 // Calculates what angle player need to face mouse
  let angle = lastAngle; // default to last known angle

if (mouseInsideCanvas) {
  const dx = mouseX - (playerX + playerWidth / 2);
  const dy = mouseY - (playerY + playerHeight / 2);
  angle = Math.atan2(dy, dx);

  // store the latest angle so we can freeze it later
  lastAngle = angle;
}

checkBeamCollisions()

// Player go weweweweweweweweeeeee!
  if (playerImage.complete) {
    ctx.save();
    ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2);
    ctx.rotate(angle);
    ctx.drawImage(playerImage, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
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

playerImage.onload = () => {
  resizeCanvas();
};

// Main menu & start button
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('mainMenu').style.display = 'none';
  resizeCanvas();
  spawnEnemy(); // spawn first enemy when game starts
  gameLoop();
});

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
const soundBeams = [];
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;
if (key === 'z' && soundSelected) {
  const angle = Math.atan2(
    mouseY - (playerY + playerHeight / 2),
    mouseX - (playerX + playerWidth / 2)
  );

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
// Information on what fruit you have
function getActiveFruitName() {
  if (flameSelected) return 'Flame';
  if (soundSelected) return 'Sound';
  if (iceSelected) return 'Ice';
  if (gravitySelected) return 'Gravity';
  return 'None';
}









