import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const Leaderboard = ({ data, onSelectModel, compareList, onToggleCompare }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'total_score', direction: 'desc' });
    const [filterText, setFilterText] = useState('');

    const getPeakVram = (item) => {
        if (item.metrics?.peak_vram_mb) return item.metrics.peak_vram_mb;
        if (item.benchmarks && item.benchmarks.length > 0) {
            const vrams = item.benchmarks.map(b => b.metrics?.peak_vram_mb).filter(v => v);
            return vrams.length > 0 ? Math.max(...vrams) : 0;
        }
        return 0;
    };

    const sortedData = [...data]
        .filter(item =>
            item.model.toLowerCase().includes(filterText.toLowerCase()) ||
            (item.model_details?.family && item.model_details.family.toLowerCase().includes(filterText.toLowerCase()))
        )
        .sort((a, b) => { // Sort Logic Reused 
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            // Handle nested keys like 'metrics.peak_vram_mb'
            if (sortConfig.key.includes('.')) {
                const keys = sortConfig.key.split('.');
                aValue = a;
                bValue = b;
                keys.forEach(k => {
                    aValue = aValue ? aValue[k] : 0;
                    bValue = bValue ? bValue[k] : 0;
                });
            }
            if (sortConfig.key === 'metrics.peak_vram_mb') {
                aValue = getPeakVram(a);
                bValue = getPeakVram(b);
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <div style={{ width: 16 }} />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>🏆 Benchmark Leaderboard</h2>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{
                            padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-dark)',
                            color: 'white'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', width: 40 }}>Compare</th>
                            <th onClick={() => requestSort('model')} style={{ padding: '1rem', cursor: 'pointer' }}>Model <SortIcon column="model" /></th>
                            <th onClick={() => requestSort('total_score')} style={{ padding: '1rem', cursor: 'pointer' }}>Score <SortIcon column="total_score" /></th>
                            <th onClick={() => requestSort('metrics.peak_vram_mb')} style={{ padding: '1rem', cursor: 'pointer' }}>Peak VRAM (MB) <SortIcon column="metrics.peak_vram_mb" /></th>
                            <th onClick={() => requestSort('model_details.parameter_size')} style={{ padding: '1rem', cursor: 'pointer' }}>Size <SortIcon column="model_details.parameter_size" /></th>
                            <th style={{ padding: '1rem' }}>Family</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover-row">
                                <td style={{ padding: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={compareList && compareList.includes(row.filename)}
                                        onChange={() => onToggleCompare && onToggleCompare(row.filename)}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                    <span onClick={() => onSelectModel(row)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                        {row.model}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        background: row.total_score > 50 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: row.total_score > 50 ? 'var(--success)' : 'var(--warning)',
                                        fontWeight: 'bold'
                                    }}>
                                        {row.total_score}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {getPeakVram(row) > 0 ? getPeakVram(row).toFixed(0) : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>{row.model_details?.parameter_size || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {row.model_details?.family || 'Unknown'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
