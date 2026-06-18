const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'public', 'Logo Trason.png');
const destPath = path.join(__dirname, 'public', 'Logo Trason Cropped.png');

async function processLogo() {
  if (!fs.existsSync(srcPath)) {
    console.error(`Cannot find ${srcPath}`);
    return;
  }

  try {
    const imageBuffer = fs.readFileSync(srcPath);
    
    // Trim the transparent padding
    await sharp(imageBuffer)
      .trim()
      .toFile(destPath);
      
    console.log(`Cropped logo saved to ${destPath}`);
    
    // Also regenerate the icons using the cropped logo so they fill the space!
    const croppedBuffer = fs.readFileSync(destPath);
    
    // 192x192
    await sharp(croppedBuffer)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
    console.log('Created icon-192x192.png');

    // 512x512
    await sharp(croppedBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));
    console.log('Created icon-512x512.png');
    
    // Favicon (32x32)
    await sharp(croppedBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
    console.log('Created favicon.png');
    
  } catch (err) {
    console.error('Error processing logo:', err);
  }
}

processLogo();
