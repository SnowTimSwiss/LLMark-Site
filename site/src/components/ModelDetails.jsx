import { ArrowLeft, Cpu, HardDrive, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const ModelDetails = ({ data }) => {
    if (!data) return <div className="glass-panel">Model not found</div>;

    const { model, total_score, date, system, model_details, benchmarks, metrics, judge_model } = data;

    const peakVram = metrics?.peak_vram_mb || 0;
    const avgVram = metrics?.avg_vram_mb || 0;

    // Prepare chart data
    const chartData = benchmarks
        ?.filter(b => b.name !== "Velocity/Speed")
        .map(b => ({
            subject: b.name,
            A: b.score,
            fullMark: 10,
        }));

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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    {/* Performance Overview Chart */}
                    <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Capabilities Radar</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                <Radar
                                    name={model}
                                    dataKey="A"
                                    stroke="var(--accent)"
                                    fill="var(--accent)"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                                <Cpu size={18} /> <strong>Tested Hardware</strong>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {(data.gpu_data || [{ gpu: system?.gpu, cpu: system?.cpu, speed: benchmarks?.find(b => b.name === "Velocity/Speed")?.score, peak_vram: peakVram, avg_vram: avgVram, context_length: model_details?.context_length, vram_total: system?.vram_total_mb }]).map((gpuEntry, idx) => {
                                    const vramBuffer = (gpuEntry.vram_total - gpuEntry.peak_vram) / 1024; // in GB
                                    const isTight = gpuEntry.vram_total && vramBuffer < 1.0;

                                    return (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: isTight ? '1px solid var(--warning)' : 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{gpuEntry.gpu}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{gpuEntry.cpu}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {gpuEntry.context_length && (
                                                        <div style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', color: 'var(--text-secondary)' }}>
                                                            {gpuEntry.context_length} CTX
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{gpuEntry.speed ? `${gpuEntry.speed.toFixed(1)} t/s` : '-'}</span>
                                                <span style={{ color: isTight ? 'var(--warning)' : 'inherit' }}>{gpuEntry.peak_vram > 0 ? `${gpuEntry.peak_vram.toFixed(0)} MB Peak` : '-'}</span>
                                                {gpuEntry.vram_total && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ {(gpuEntry.vram_total / 1024).toFixed(0)}GB</span>}
                                            </div>
                                            {isTight && (
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <AlertTriangle size={12} /> VRAM nearly full. Full GPU offload might be unstable.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Benchmark Breakdown</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {benchmarks?.filter(bench => bench.name !== "Velocity/Speed").map((bench, idx) => (
                    <div key={idx} className="glass-panel" style={{ borderLeft: `4px solid ${bench.score >= 8 ? 'var(--success)' : bench.score >= 5 ? 'var(--warning)' : 'var(--danger)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>{bench.name}</h3>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{bench.score}/10</span>
                        </div>

                        {bench.comment && (
                            <p style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', fontStyle: 'italic', marginTop: '1rem' }}>
                                "{bench.comment}"
                            </p>
                        )}

                        {bench.issues && bench.issues.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', margin: '0 0 0.5rem 0' }}>
                                    <AlertTriangle size={16} /> Issues
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
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
