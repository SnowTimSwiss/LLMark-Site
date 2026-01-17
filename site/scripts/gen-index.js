const fs = require('fs');
const path = require('path');

// Adjust paths based on location: site/scripts/gen-index.js
// Data is in: ../../data/benchmarks
// Output is in: ../public/db.json

const BENCHMARKS_DIR = path.join(__dirname, '../../data/benchmarks');
const OUT_FILE = path.join(__dirname, '../public/db.json');

console.log(`Scanning benchmarks in: ${BENCHMARKS_DIR}`);

if (!fs.existsSync(BENCHMARKS_DIR)) {
    console.error("Benchmarks directory not found!");
    process.exit(1);
}

// Ensure public dir exists
const publicDir = path.dirname(OUT_FILE);
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const files = fs.readdirSync(BENCHMARKS_DIR).filter(f => f.endsWith('.json'));
const benchmarks = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(BENCHMARKS_DIR, file), 'utf-8');
        const data = JSON.parse(content);

        // Add metadata
        data.filename = file;

        // Sanitize or normalize if needed
        benchmarks.push(data);
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
    }
});

// Sort by score desc by default
benchmarks.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

fs.writeFileSync(OUT_FILE, JSON.stringify(benchmarks, null, 2));
console.log(`Generated db.json with ${benchmarks.length} entries at ${OUT_FILE}`);
