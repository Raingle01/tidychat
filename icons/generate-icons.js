/**
 * Generate PNG icons using Node.js (Green Theme)
 * Run: node generate-icons.js
 * 
 * If you don't have the 'canvas' package, open generate-icons.html in a browser instead.
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas package if available
let createCanvas;
try {
  createCanvas = require('canvas').createCanvas;
} catch (e) {
  console.log('canvas package not found.');
  console.log('Please either:');
  console.log('  1. Run: npm install canvas && node generate-icons.js');
  console.log('  2. Or open generate-icons.html in a browser to download icons manually');
  process.exit(0);
}

function drawIcon(ctx, size) {
  // Background with green gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#10b981');
  gradient.addColorStop(1, '#059669');

  // Rounded rectangle
  const radius = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw collapse/expand icon
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = size / 2;
  const topY = size * 0.22;
  const bottomY = size * 0.78;
  const midTopY = size * 0.38;
  const midBottomY = size * 0.62;
  const arrowWidth = size * 0.16;

  // Top arrow (pointing up)
  ctx.beginPath();
  ctx.moveTo(cx - arrowWidth, midTopY);
  ctx.lineTo(cx, topY);
  ctx.lineTo(cx + arrowWidth, midTopY);
  ctx.stroke();

  // Bottom arrow (pointing down)
  ctx.beginPath();
  ctx.moveTo(cx - arrowWidth, midBottomY);
  ctx.lineTo(cx, bottomY);
  ctx.lineTo(cx + arrowWidth, midBottomY);
  ctx.stroke();

  // Center line
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, bottomY);
  ctx.stroke();
}

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawIcon(ctx, size);

  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filename}`);
}

// Generate all sizes
generateIcon(16, 'icon16.png');
generateIcon(48, 'icon48.png');
generateIcon(128, 'icon128.png');

console.log('All green icons generated successfully!');
