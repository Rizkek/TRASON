const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');

async function processLogo() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
    console.log('Created icon-192x192.png');

    // 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));
    console.log('Created icon-512x512.png');
    
    // Favicon (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
    console.log('Created favicon.png');
    
  } catch (err) {
    console.error('Error processing logo:', err);
  }
}

processLogo();
