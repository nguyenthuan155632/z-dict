#!/usr/bin/env node

/**
 * Generate a professional favicon for Z-Dict
 * Creates a modern, clean design with the 'Z' letter on a gradient background
 */

const fs = require('fs');
const path = require('path');

// Create an SVG with better design
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient background for modern look -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow for depth -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="96" ry="96" fill="url(#bgGradient)"/>
  
  <!-- Book icon base (simplified) -->
  <g transform="translate(256, 256)">
    <!-- Left book page -->
    <path d="M -80 -100 L -80 100 L -5 110 L -5 -90 Z" 
          fill="rgba(255,255,255,0.15)" 
          stroke="rgba(255,255,255,0.3)" 
          stroke-width="2"/>
    
    <!-- Right book page -->
    <path d="M 5 -90 L 5 110 L 80 100 L 80 -100 Z" 
          fill="rgba(255,255,255,0.15)" 
          stroke="rgba(255,255,255,0.3)" 
          stroke-width="2"/>
    
    <!-- Book spine -->
    <rect x="-5" y="-100" width="10" height="210" 
          fill="rgba(255,255,255,0.25)"/>
    
    <!-- Letter 'Z' - main feature -->
    <text x="0" y="30" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="180" 
          font-weight="900" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="middle"
          filter="url(#shadow)"
          style="letter-spacing: -0.05em;">Z</text>
  </g>
  
  <!-- Subtle shine effect on top -->
  <ellipse cx="256" cy="120" rx="200" ry="80" 
           fill="rgba(255,255,255,0.1)" 
           opacity="0.6"/>
</svg>`;

// Save the main favicon.svg
const faviconSvgPath = path.join(__dirname, '../public/favicon.svg');
fs.writeFileSync(faviconSvgPath, svg);
console.log('✓ Created favicon.svg');

// For PNG generation, we'll use a simpler approach with sharp if available
// Otherwise, provide instructions for manual conversion
try {
  const sharp = require('sharp');

  const sizes = [16, 32, 48, 64, 128, 256];

  Promise.all(
    sizes.map(async (size) => {
      const outputPath = path.join(__dirname, `../public/favicon-${size}x${size}.png`);
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Created favicon-${size}x${size}.png`);
    })
  ).then(() => {
    // Create the main favicon.png (32x32 is standard)
    const mainFaviconPath = path.join(__dirname, '../public/favicon.png');
    return sharp(Buffer.from(svg))
      .resize(32, 32)
      .png()
      .toFile(mainFaviconPath);
  }).then(() => {
    console.log('✓ Created favicon.png (32x32)');
    console.log('\n✅ All favicons generated successfully!');
  }).catch((err) => {
    console.error('Error generating PNG favicons:', err.message);
    console.log('\n⚠️  Install sharp for PNG generation: npm install sharp --save-dev');
  });

} catch (err) {
  console.log('\n⚠️  Sharp not available. Installing it now...');
  console.log('Run: npm install sharp --save-dev');
  console.log('Then run this script again to generate PNG favicons.');
}

