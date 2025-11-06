#!/usr/bin/env node

/**
 * Resize a source icon to all required sizes for PWA and favicon
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceIcon = '/Users/thuan.nv/Downloads/e8a4ec63-d934-4ae3-8161-1062dbf3c6e4.png';
const publicDir = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-64x64.png', size: 64 },
  { name: 'favicon-128x128.png', size: 128 },
  { name: 'favicon-256x256.png', size: 256 },
  { name: 'favicon.png', size: 32 }, // Default favicon
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function resizeIcons() {
  console.log('🎨 Resizing icon to all required sizes...\n');

  // Check if source file exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  // Copy original as 512x512
  const original512Path = path.join(publicDir, 'icon-512x512.png');
  fs.copyFileSync(sourceIcon, original512Path);
  console.log('✓ Copied original as icon-512x512.png');

  // Resize to all other sizes
  for (const { name, size } of sizes) {
    if (name === 'icon-512x512.png') continue; // Already copied

    const outputPath = path.join(publicDir, name);

    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Created ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`✗ Error creating ${name}:`, err.message);
    }
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('📝 Make sure to restart your dev server to see the changes.');
}

resizeIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

