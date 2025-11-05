// Simple icon generator for PWA
// This creates basic SVG icons that can be replaced with proper designs later

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">📚</text>
</svg>`;
};

const publicDir = path.join(__dirname, '..', 'public');

// Create icons
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Save as SVG (browsers can use SVG as PNG in manifest)
  fs.writeFileSync(
    path.join(publicDir, svgFilename),
    svg
  );
  
  console.log(`✓ Created ${svgFilename}`);
});

// Create favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(
  path.join(publicDir, 'favicon.svg'),
  faviconSVG
);

console.log('✓ Created favicon.svg');
console.log('\n📝 Note: SVG icons created. For production, convert to PNG using:');
console.log('   - Online tool: https://svgtopng.com/');
console.log('   - Or use sharp/imagemagick for batch conversion');

