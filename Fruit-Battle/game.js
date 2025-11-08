const canvas = document.getElementById('Battleground');
const ctx = canvas.getContext('2d');

// Create the image once, globally
const playerImage = new Image();
playerImage.src = 'regular.svg';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Draw background
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player image if it's loaded
  if (playerImage.complete) {
    ctx.drawImage(playerImage, 70, 70, 40, 40);
  }
}

// Only draw after image is loaded
playerImage.onload = () => {
  resizeCanvas(); // Initial draw
  window.addEventListener('resize', resizeCanvas); // Redraw on resize
};


