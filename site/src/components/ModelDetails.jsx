import { ArrowLeft, Cpu, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModelDetails = ({ data }) => {
    if (!data) return <div className="glass-panel">Model not found</div>;

    const { model, total_score, date, system, model_details, benchmarks, metrics, judge_model } = data;

    // Fallback VRAM calculation if metrics are missing from root
    const peakVram = metrics?.peak_vram_mb || (benchmarks ? Math.max(...benchmarks.map(b => b.metrics?.peak_vram_mb).filter(v => v)) : 0);
    const avgVram = metrics?.avg_vram_mb || (benchmarks ? (benchmarks.reduce((acc, b) => acc + (b.metrics?.avg_vram_mb || 0), 0) / benchmarks.length) : 0);

    return (
        <div className="model-details">
            <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Leaderboard
            </Link>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {model}
                        </h1>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                            <span>📅 {new Date(date).toLocaleDateString()}</span>
                            <span>⚖️ Judge: {judge_model}</span>
                            <span>📦 {model_details?.parameter_size} • {model_details?.quantization}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: total_score > 50 ? 'var(--success)' : 'var(--warning)', lineHeight: 1 }}>{total_score}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Score</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                            <HardDrive size={18} /> <strong>VRAM Usage</strong>
                        </div>
                        <div>Peak: {peakVram > 0 ? peakVram.toFixed(0) : '-'} MB</div>
                        <div>Avg: {avgVram > 0 ? avgVram.toFixed(0) : '-'} MB</div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                            <HardDrive size={18} /> <strong>Context Window</strong>
                        </div>
                        <div>{model_details?.context_length || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Tested with: {model_details?.context_length || 'N/A'}. Note: VRAM usage and performance depends on context window size. It might have been higher if the context window was larger.
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                            <Cpu size={18} /> <strong>System</strong>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>{system?.gpu}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{system?.cpu}</div>
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Benchmark Breakdown</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {benchmarks?.map((bench, idx) => (
                    <div key={idx} className="glass-panel" style={{ borderLeft: `4px solid ${bench.score >= 8 ? 'var(--success)' : bench.score >= 5 ? 'var(--warning)' : 'var(--danger)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>{bench.name}</h3>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{bench.score}/10</span>
                        </div>

                        {bench.comment && (
                            <p style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', fontStyle: 'italic' }}>
                                "{bench.comment}"
                            </p>
                        )}

                        {bench.issues && bench.issues.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                                    <AlertTriangle size={16} /> Issues
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                    {bench.issues.map((issue, i) => (
                                        <li key={i}>{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Speed: {bench.details?.tokens_per_sec} t/s on {system?.gpu} | Time: {bench.details?.total_time_s}s
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModelDetails;
