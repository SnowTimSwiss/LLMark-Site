import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust paths based on location: site/scripts/gen-index.js
// Data is in: ../../data/benchmarks
// Output is in: ../public/db.json

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // Aggregate VRAM metrics from benchmarks if missing from root
        if (data.benchmarks && data.benchmarks.length > 0) {
            const peakVrams = data.benchmarks
                .map(b => b.metrics?.peak_vram_mb)
                .filter(v => v !== undefined && v !== null);
            const avgVrams = data.benchmarks
                .map(b => b.metrics?.avg_vram_mb)
                .filter(v => v !== undefined && v !== null);

            if (!data.metrics) data.metrics = {};

            if (peakVrams.length > 0) {
                data.metrics.peak_vram_mb = Math.max(...peakVrams);
            }
            if (avgVrams.length > 0) {
                const sum = avgVrams.reduce((a, b) => a + b, 0);
                data.metrics.avg_vram_mb = sum / avgVrams.length;
            }
        }

        benchmarks.push(data);
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
    }
});

// Sort by score desc by default
benchmarks.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

fs.writeFileSync(OUT_FILE, JSON.stringify(benchmarks, null, 2));
console.log(`Generated db.json with ${benchmarks.length} entries at ${OUT_FILE}`);
