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
const modelsMap = new Map(); // modelName -> { versions: { versionNumber -> [data] } }

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(BENCHMARKS_DIR, file), 'utf-8');
        const data = JSON.parse(content);

        let modelName = data.model;

        // Normalize: llama3.1:latest -> llama3.1:8b
        if (modelName.endsWith(':latest')) {
            const size = data.model_details?.parameter_size?.toLowerCase().replace(/[^a-z0-9.]/g, '') || 'latest';
            modelName = modelName.replace(':latest', `:${size}`);
        }

        const versionStr = data.benchmark_version || 'v1';
        const versionNum = parseInt(versionStr.replace('v', '')) || 1;

        if (!modelsMap.has(modelName)) {
            modelsMap.set(modelName, { latestVersion: 0, dataByVersion: {} });
        }

        const modelEntry = modelsMap.get(modelName);
        if (versionNum > modelEntry.latestVersion) {
            modelEntry.latestVersion = versionNum;
        }

        if (!modelEntry.dataByVersion[versionNum]) {
            modelEntry.dataByVersion[versionNum] = [];
        }
        data.filename = file; // Ensure original filename is kept for reference
        modelEntry.dataByVersion[versionNum].push(data);
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
    }
});

const benchmarks = [];

modelsMap.forEach((modelEntry, modelName) => {
    const latestDataList = modelEntry.dataByVersion[modelEntry.latestVersion];
    if (!latestDataList || latestDataList.length === 0) return;

    // Use a sanitized model name as the stable ID for routing
    const modelId = modelName.replace(/[:\/]/g, '-').replace(/[^a-z0-9-_]/gi, '').toLowerCase();

    // Use the first entry as a template for metadata
    const template = latestDataList[0];
    const aggregated = {
        model: modelName,
        benchmark_version: `v${modelEntry.latestVersion}`,
        date: template.date,
        judge_model: template.judge_model,
        model_details: template.model_details,
        filename: modelId, // Stable routing ID
        benchmarks: [],
        metrics: { peak_vram_mb: 0, avg_vram_mb: 0 },
        gpu_data: [], // [{ gpu: string, peak_vram: number, avg_vram: number, speed: number }]
        total_score: 0
    };

    // Aggregate Scores per Benchmark Category
    const categoryScores = {}; // categoryName -> [scores]
    const categoryComments = {}; // categoryName -> [comments]
    const categoryIssues = {}; // categoryName -> [issues]

    latestDataList.forEach(entry => {
        entry.benchmarks?.forEach(b => {
            if (!categoryScores[b.name]) {
                categoryScores[b.name] = [];
                categoryComments[b.name] = [];
                categoryIssues[b.name] = [];
            }
            categoryScores[b.name].push(b.score);
            if (b.comment) categoryComments[b.name].push(b.comment);
            if (b.issues) categoryIssues[b.name].push(...b.issues);
        });

        // Collect GPU Speed/Metrics
        const speedBench = entry.benchmarks?.find(b => b.name === "Velocity/Speed");
        const gpuName = entry.system?.gpu || "Unknown GPU";

        // Find or create GPU entry
        let gpuEntry = aggregated.gpu_data.find(g => g.gpu === gpuName);
        if (!gpuEntry) {
            gpuEntry = {
                gpu: gpuName,
                cpu: entry.system?.cpu,
                peak_vram: 0,
                avg_vram: 0,
                speed: 0,
                count: 0,
                speeds: []
            };
            aggregated.gpu_data.push(gpuEntry);
        }

        gpuEntry.count++;
        if (speedBench?.details?.tokens_per_sec) {
            gpuEntry.speeds.push(speedBench.details.tokens_per_sec);
        }

        // VRAM from root metrics if available, else from benchmarks
        const peak = entry.metrics?.peak_vram_mb || (entry.benchmarks ? Math.max(...entry.benchmarks.map(b => b.metrics?.peak_vram_mb).filter(v => v)) : 0);
        const avg = entry.metrics?.avg_vram_mb || (entry.benchmarks ? (entry.benchmarks.reduce((acc, b) => acc + (b.metrics?.avg_vram_mb || 0), 0) / entry.benchmarks.length) : 0);

        gpuEntry.peak_vram = Math.max(gpuEntry.peak_vram, peak);
        gpuEntry.avg_vram = (gpuEntry.avg_vram * (gpuEntry.count - 1) + avg) / gpuEntry.count;
    });

    // Finalize GPU speeds (average if multiple per same GPU)
    aggregated.gpu_data.forEach(g => {
        if (g.speeds.length > 0) {
            g.speed = g.speeds.reduce((a, b) => a + b, 0) / g.speeds.length;
        }
        delete g.speeds;
        delete g.count;
    });

    // Finalize Categories
    Object.keys(categoryScores).forEach(catName => {
        const scores = categoryScores[catName];
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Don't show "Velocity/Speed" as a regular category if it's handled via gpu_data
        // (Actually keep it for backward compatibility but maybe filtered in UI)

        aggregated.benchmarks.push({
            name: catName,
            score: parseFloat(avgScore.toFixed(2)),
            comment: categoryComments[catName].length > 0 ? categoryComments[catName][0] : null, // Just take first comment for now
            issues: [...new Set(categoryIssues[catName])] // Unique issues
        });
    });

    // Calculate Total Score (Average of all entry total_scores)
    const totalScores = latestDataList.map(d => d.total_score || 0);
    aggregated.total_score = Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length);

    // Global VRAM metrics (Average of all peak/avg across all GPUs for main leaderboard)
    if (aggregated.gpu_data.length > 0) {
        aggregated.metrics.peak_vram_mb = Math.max(...aggregated.gpu_data.map(g => g.peak_vram));
        aggregated.metrics.avg_vram_mb = aggregated.gpu_data.reduce((a, b) => a + b.avg_vram, 0) / aggregated.gpu_data.length;
    }

    benchmarks.push(aggregated);
});

// Sort by score desc by default
benchmarks.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

fs.writeFileSync(OUT_FILE, JSON.stringify(benchmarks, null, 2));
console.log(`Generated db.json with ${benchmarks.length} entries at ${OUT_FILE}`);

