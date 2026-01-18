import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare = ({ data, selectedIds, onRemove }) => {
    const models = data.filter(d => selectedIds.includes(d.filename));

    // Consitent row heights
    const H_HEADER = '160px';
    const H_SCORE = '80px';
    const H_ROW = '60px';
    const H_BENCH = 'auto'; // Flex grow with min height
    const MIN_H_BENCH = '80px';

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
            <div style={{ display: 'flex', gap: '0', minWidth: 'min-content' }}>
                {/* Labels Column */}
                <div style={{ minWidth: '200px', flexShrink: 0, background: 'rgba(15, 23, 42, 0.95)', position: 'sticky', left: 0, zIndex: 10, borderRight: '1px solid var(--border)' }}>
                    <div style={{ height: H_HEADER }}></div> {/* Spacer for model headers */}
                    <div className="compare-row-header" style={{ height: H_SCORE }}>Total Score</div>
                    <div className="compare-row-header" style={{ height: H_ROW }}>Peak VRAM</div>
                    <div className="compare-row-header" style={{ height: H_ROW }}>Avg VRAM</div>
                    <div className="compare-row-header" style={{ height: H_ROW }}>Parameter Size</div>
                    <div className="compare-row-header" style={{ height: H_ROW }}>Quantization</div>
                    <div className="compare-row-header" style={{ height: H_ROW }}>Judge</div>
                    {/* Detailed Benchmarks */}
                    {models[0]?.benchmarks?.map((b, i) => (
                        <div key={i} className="compare-row-header" style={{ height: H_BENCH, minHeight: MIN_H_BENCH }}>
                            {b.name}
                        </div>
                    ))}
                </div>

                {/* Model Columns */}
                {models.map(model => (
                    <div key={model.filename} className="compare-col" style={{ minWidth: '300px', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', position: 'relative', height: H_HEADER, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
                            <button
                                onClick={() => onRemove(model.filename)}
                                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                            <h3 style={{ margin: '0 0 0.5rem 0', wordWrap: 'break-word' }}>{model.model}</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(model.date).toLocaleDateString()}</div>
                        </div>

                        <div className="compare-row score-row" style={{ height: H_SCORE, fontSize: '1.5rem', fontWeight: 'bold', color: model.total_score > 50 ? 'var(--success)' : 'var(--warning)' }}>
                            {model.total_score}
                        </div>
                        <div className="compare-row" style={{ height: H_ROW }}>{model.metrics?.peak_vram_mb?.toFixed(0)} MB</div>
                        <div className="compare-row" style={{ height: H_ROW }}>{model.metrics?.avg_vram_mb?.toFixed(0)} MB</div>
                        <div className="compare-row" style={{ height: H_ROW }}>{model.model_details?.parameter_size || '-'}</div>
                        <div className="compare-row" style={{ height: H_ROW }}>{model.model_details?.quantization || '-'}</div>
                        <div className="compare-row" style={{ height: H_ROW, fontSize: '0.8rem' }}>{model.judge_model}</div>
                        {model.benchmarks?.map((b, i) => (
                            <div key={i} className="compare-row" style={{ height: H_BENCH, minHeight: MIN_H_BENCH, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 500 }}>{b.score}/10</span>
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
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
        }
        .compare-row-header {
            padding: 0 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
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
