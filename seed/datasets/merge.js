const fs = require('fs');
const path = require('path');

const datasetDir = '/Users/thuan.nv/workspaces/z-dict/seed/datasets';
const outputFile = path.join(datasetDir, 'words.jsonl');

// Get all b* files and sort them
const files = fs.readdirSync(datasetDir)
  .filter(file => file.match(/^b\d+$/))
  .sort();

console.log(`Found files: ${files.join(', ')}`);

const wordSet = new Set(); // Track unique words
const uniqueEntries = []; // Store unique entries

// Process each file
for (const file of files) {
  const filePath = path.join(datasetDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');

  console.log(`Processing ${file}: ${lines.length} lines`);

  for (const line of lines) {
    if (line.trim()) {
      try {
        const entry = JSON.parse(line);
        const word = entry.word;

        if (!wordSet.has(word)) {
          wordSet.add(word);
          uniqueEntries.push(entry);
          console.log(`Added: "${word}" (from ${file})`);
        } else {
          // console.log(`Duplicate found and skipped: "${word}" (from ${file})`);
        }
      } catch (error) {
        console.error(`Error parsing line in ${file}:`, error.message);
      }
    }
  }
}

// Write unique entries to output file
const output = uniqueEntries
  .map(entry => JSON.stringify(entry))
  .join('\n');

fs.writeFileSync(outputFile, output + '\n');

console.log(`\n✅ Merge completed!`);
console.log(`📊 Statistics:`);
console.log(`   - Files processed: ${files.length}`);
console.log(`   - Total entries: ${uniqueEntries.length}`);
console.log(`   - Duplicates removed: ${files.reduce((sum, file) => sum + (require('fs').statSync(path.join(datasetDir, file)).lines || 0), 0) - uniqueEntries.length}`);
console.log(`   - Output file: ${outputFile}`);
