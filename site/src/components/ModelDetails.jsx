import { ArrowLeft, Cpu, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModelDetails = ({ data }) => {
    if (!data) return <div className="glass-panel">Model not found</div>;

    const { model, total_score, date, system, model_details, benchmarks, metrics, judge_model } = data;

    const peakVram = metrics?.peak_vram_mb || 0;
    const avgVram = metrics?.avg_vram_mb || 0;

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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                            <HardDrive size={18} /> <strong>Context Window</strong>
                        </div>
                        <div>{model_details?.context_length || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Note: VRAM usage and performance depends on context window size.
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                            <Cpu size={18} /> <strong>GPU Performance & VRAM</strong>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {(data.gpu_data || [{ gpu: system?.gpu, cpu: system?.cpu, speed: benchmarks?.find(b => b.name === "Velocity/Speed")?.score, peak_vram: peakVram, avg_vram: avgVram }]).map((gpuEntry, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{gpuEntry.gpu}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{gpuEntry.cpu}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{gpuEntry.speed ? `${gpuEntry.speed.toFixed(1)} t/s` : '-'}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Speed</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{gpuEntry.peak_vram > 0 ? gpuEntry.peak_vram.toFixed(0) : '-'} MB</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Peak VRAM</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Benchmark Breakdown</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {benchmarks?.filter(bench => bench.name !== "Velocity/Speed").map((bench, idx) => (
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModelDetails;
