import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare = ({ data, selectedIds, onRemove }) => {
    const models = data.filter(d => selectedIds.includes(d.filename));

    if (models.length === 0) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>No models selected</h2>
                <p>Go to the Leaderboard to select models for comparison.</p>
                <Link to="/" className="btn">Go to Leaderboard</Link>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', minWidth: 'min-content' }}>
                {/* Labels Column */}
                <div style={{ minWidth: '200px', flexShrink: 0 }}>
                    <div style={{ height: '144px' }}></div> {/* Spacer for model headers */}
                    <div className="compare-row-header">Total Score</div>
                    <div className="compare-row-header">Peak VRAM</div>
                    <div className="compare-row-header">Avg VRAM</div>
                    <div className="compare-row-header">Parameter Size</div>
                    <div className="compare-row-header">Quantization</div>
                    <div className="compare-row-header">Judge</div>
                    {/* Detailed Benchmarks */}
                    {models[0]?.benchmarks?.map((b, i) => (
                        <div key={i} className="compare-row-header" style={{ height: 'auto', minHeight: '60px', paddingTop: '10px' }}>
                            {b.name}
                        </div>
                    ))}
                </div>

                {/* Model Columns */}
                {models.map(model => (
                    <div key={model.filename} className="glass-panel" style={{ minWidth: '300px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', position: 'relative', height: '144px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                            <button
                                onClick={() => onRemove(model.filename)}
                                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                            <h3 style={{ margin: '0 0 0.5rem 0', paddingRight: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.model}</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(model.date).toLocaleDateString()}</div>
                        </div>

                        <div className="compare-row score-row" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: model.total_score > 50 ? 'var(--success)' : 'var(--warning)' }}>
                            {model.total_score}
                        </div>
                        <div className="compare-row">{model.metrics?.peak_vram_mb?.toFixed(0)} MB</div>
                        <div className="compare-row">{model.metrics?.avg_vram_mb?.toFixed(0)} MB</div>
                        <div className="compare-row">{model.model_details?.parameter_size || '-'}</div>
                        <div className="compare-row">{model.model_details?.quantization || '-'}</div>
                        <div className="compare-row" style={{ fontSize: '0.8rem' }}>{model.judge_model}</div>

                        {model.benchmarks?.map((b, i) => (
                            <div key={i} className="compare-row" style={{ height: 'auto', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 500 }}>{b.score}/10</span>
                                    {b.details?.tokens_per_sec && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.details.tokens_per_sec} t/s</span>
                                    )}
                                </div>
                                {b.issues?.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <AlertTriangle size={12} /> {b.issues.length} issues
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <style>{`
        .compare-row {
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
        }
        .compare-row-header {
            padding: 1rem;
            border-bottom: 1px solid transparent;
            display: flex;
            align-items: center;
            font-weight: bold;
            color: var(--text-secondary);
            justify-content: flex-end;
            text-align: right;
        }
      `}</style>
        </div>
    );
};

export default Compare;
