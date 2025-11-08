const canvas = document.getElementById('Battleground');
const ctx = canvas.getContext('2d');
//Player stats & more!
let showImageBar=true;
let playerX = 70;
let playerY = 70;
const playerWidth = 40;
const playerHeight = 40;
const speed = 5;
//Track da keys!
const keys ={};

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
const imageBar =[
{ src: 'flame.svg', img: new Image(), x:50, y:20},
{ src: 'backdrop1.svg', img: new Image(), x:120, y:20 },
{ src: 'costume2.svg', img: new Image(), x:190, y:20 },
{ src: 'costume1.svg', img: new Image(), x:260, y:20 }
];
imageBar.forEach(item => item.img.src = item.src);
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


  // The background
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player if it's loaded
  if (playerImage.complete) {
    ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
  }
drawImageBar();
requestAnimationFrame(gameLoop);
}
playerImage.onload = () => {
  resizeCanvas();
  gameLoop();
};
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('mainMenu').style.display = 'none';
  resizeCanvas();
  gameLoop();
});// 6 7!



// Key listeners
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;

  if (key === 'b') {
    showImageBar = !showImageBar;
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});








