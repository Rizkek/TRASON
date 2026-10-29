// Regenerates every favicon, PWA icon, push badge and the Open Graph image from the TR mark.
// Run after changing public/logo-trason.png: `node scripts/generate-brand-assets.mjs`.
import sharp from 'sharp';

const SOURCE = 'public/logo-trason.png';
// Dark theme --color-background; also the manifest background_color, so splash and icon match.
const BACKGROUND = '#0B0F14';
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function fitLogo(box) {
  return sharp(SOURCE).resize(box, box, { fit: 'contain', background: TRANSPARENT }).png().toBuffer();
}

async function canvas(width, height, logoBox, background, file) {
  const logo = await fitLogo(logoBox);
  await sharp({ create: { width, height, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(file);
}

// Android draws the badge from the alpha channel only, so it must be a white silhouette.
async function badge(size, file) {
  const shape = await sharp({ create: { width: size, height: size, channels: 4, background: TRANSPARENT } })
    .composite([{ input: await fitLogo(Math.round(size * 0.8)), gravity: 'center' }])
    .png()
    .toBuffer();
  const alpha = await sharp(shape).extractChannel('alpha').toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: '#FFFFFF' } })
    .joinChannel(alpha)
    .png()
    .toFile(file);
}

const jobs = [
  // Browser tab: transparent so it sits on light and dark tab strips.
  canvas(48, 48, 44, TRANSPARENT, 'public/favicon.png'),
  // "any" icons: launcher and install dialogs, logo at ~62% of the tile.
  canvas(192, 192, 120, BACKGROUND, 'public/icon-192x192.png'),
  canvas(512, 512, 320, BACKGROUND, 'public/icon-512x512.png'),
  // Maskable: the platform may crop to a circle of 80% diameter, so keep the mark inside 50%.
  canvas(192, 192, 96, BACKGROUND, 'public/icon-maskable-192x192.png'),
  canvas(512, 512, 256, BACKGROUND, 'public/icon-maskable-512x512.png'),
  canvas(180, 180, 112, BACKGROUND, 'public/apple-touch-icon.png'),
  badge(72, 'public/badge-72x72.png'),
  canvas(1200, 630, 300, BACKGROUND, 'public/og-image.png'),
];

await Promise.all(jobs);
console.log(`Generated ${jobs.length} brand assets from ${SOURCE}`);
