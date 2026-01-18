import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';

const SidebarSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isOpen ? '0.5rem' : 0, fontWeight: 'bold' }}
            >
                <span>{title}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {isOpen && <div>{children}</div>}
        </div>
    );
};

const CheckboxFilter = ({ options, selected, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
        {options.map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => onChange(opt)}
                    style={{ accentColor: 'var(--accent)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{opt}</span>
            </label>
        ))}
    </div>
);

const RangeFilter = ({ min, max, value, onChange, unit = '' }) => {
    return (
        <div style={{ padding: '0 0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>{value[0]}{unit}</span>
                <span>{value[1]}{unit}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="range" min={min} max={max} value={value[0]}
                    onChange={(e) => {
                        const val = Math.min(Number(e.target.value), value[1]);
                        onChange([val, value[1]]);
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
                <input
                    type="range" min={min} max={max} value={value[1]}
                    onChange={(e) => {
                        const val = Math.max(Number(e.target.value), value[0]);
                        onChange([value[0], val]);
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
            </div>
        </div>
    );
};

const Leaderboard = ({ data, onSelectModel, compareList, onToggleCompare }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'total_score', direction: 'desc' });
    const [filterText, setFilterText] = useState('');

    // Derived Filter content
    const [maxVRAM, setMaxVRAM] = useState(100);
    const [availableFamilies, setAvailableFamilies] = useState([]);
    const [availableGpus, setAvailableGpus] = useState([]);

    // Filter State
    const [scoreRange, setScoreRange] = useState([0, 110]);
    const [vramRange, setVramRange] = useState([0, 100]);
    const [selectedFamilies, setSelectedFamilies] = useState([]);
    const [selectedGpus, setSelectedGpus] = useState([]);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    const getPeakVram = (item) => {
        if (item.metrics?.peak_vram_mb) return item.metrics.peak_vram_mb;
        if (item.benchmarks && item.benchmarks.length > 0) {
            const vrams = item.benchmarks.map(b => b.metrics?.peak_vram_mb).filter(v => v);
            return vrams.length > 0 ? Math.max(...vrams) : 0;
        }
        return 0;
    };

    // Initialize Filters based on Data
    useEffect(() => {
        if (!data || data.length === 0) return;

        // Families
        const families = [...new Set(data.map(d => d.model_details?.family).filter(Boolean))].sort();
        setAvailableFamilies(families);

        // GPUs
        const gpus = new Set();
        data.forEach(d => {
            if (d.gpu_data) {
                d.gpu_data.forEach(g => gpus.add(g.gpu));
            }
        });
        setAvailableGpus([...gpus].sort());

        // Max VRAM
        const maxV = Math.max(...data.map(d => getPeakVram(d) || 0));
        const ceiling = Math.ceil(maxV / 1000) * 1000 + 4000; // details + buffer
        setMaxVRAM(ceiling);
        setVramRange([0, ceiling]);

    }, [data]);

    const toggleFamily = (fam) => {
        setSelectedFamilies(prev =>
            prev.includes(fam) ? prev.filter(f => f !== fam) : [...prev, fam]
        );
    };

    const toggleGpu = (gpu) => {
        setSelectedGpus(prev =>
            prev.includes(gpu) ? prev.filter(g => g !== gpu) : [...prev, gpu]
        );
    };

    const sortedData = useMemo(() => {
        return [...data]
            .filter(item => {
                // Text Search
                const basicMatch = item.model.toLowerCase().includes(filterText.toLowerCase()) ||
                    (item.model_details?.family && item.model_details.family.toLowerCase().includes(filterText.toLowerCase()));
                if (!basicMatch) return false;

                // Score Range
                if (item.total_score < scoreRange[0] || item.total_score > scoreRange[1]) return false;

                // VRAM Range
                const vram = getPeakVram(item);
                if (vram < vramRange[0] || vram > vramRange[1]) return false;

                // Family Filter
                if (selectedFamilies.length > 0) {
                    if (!item.model_details?.family || !selectedFamilies.includes(item.model_details.family)) return false;
                }

                // GPU Filter
                if (selectedGpus.length > 0) {
                    // Check if *any* of the model's tested GPUs match the selection
                    const modelGpus = item.gpu_data?.map(g => g.gpu) || [];
                    const hasMatch = selectedGpus.some(g => modelGpus.includes(g));
                    if (!hasMatch) return false;
                }

                return true;
            })
            .sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                // Handle nested keys
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
                // Handle nulls
                if (aValue === undefined || aValue === null) aValue = 0;
                if (bValue === undefined || bValue === null) bValue = 0;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [data, filterText, sortConfig, scoreRange, vramRange, selectedFamilies, selectedGpus]);


    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <div style={{ width: 16 }} />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const resetFilters = () => {
        setScoreRange([0, 110]);
        setVramRange([0, maxVRAM]);
        setSelectedFamilies([]);
        setSelectedGpus([]);
        setFilterText('');
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', alignItems: 'flex-start' }} className="leaderboard-layout">
            {/* Sidebar Toggle for Mobile */}
            <button
                className="btn btn-secondary mobile-only"
                onClick={() => setShowFilters(!showFilters)}
                style={{ width: '100%', marginBottom: '1rem', display: 'none' }} // Hidden by default, shown via CSS
            >
                <Filter size={16} style={{ marginRight: 8 }} /> Filters
            </button>

            {/* Sidebar */}
            <div className={`glass-panel filter-sidebar ${showFilters ? 'show' : ''}`} style={{ width: '280px', flexShrink: 0, padding: '1.5rem', alignSelf: 'stretch', height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Filters</h3>
                    <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer' }}>Clear All</button>
                </div>

                <SidebarSection title="Total Score">
                    <RangeFilter min={0} max={110} value={scoreRange} onChange={setScoreRange} />
                </SidebarSection>

                <SidebarSection title="VRAM (MB)">
                    <RangeFilter min={0} max={maxVRAM} value={vramRange} onChange={setVramRange} unit="MB" />
                </SidebarSection>

                {availableGpus.length > 0 && (
                    <SidebarSection title="Tested On (GPU)">
                        <CheckboxFilter options={availableGpus} selected={selectedGpus} onChange={toggleGpu} />
                    </SidebarSection>
                )}

                {availableFamilies.length > 0 && (
                    <SidebarSection title="Model Family">
                        <CheckboxFilter options={availableFamilies} selected={selectedFamilies} onChange={toggleFamily} />
                    </SidebarSection>
                )}
            </div>

            {/* Main Content */}
            <div className="glass-panel" style={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}>
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

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Showing {sortedData.length} models
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', width: 40 }}>Compare</th>
                                <th onClick={() => requestSort('model')} style={{ padding: '1rem', cursor: 'pointer', minWidth: '200px' }}>Model <SortIcon column="model" /></th>
                                <th onClick={() => requestSort('total_score')} style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Score <SortIcon column="total_score" /></th>
                                <th onClick={() => requestSort('metrics.peak_vram_mb')} style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Peak VRAM <SortIcon column="metrics.peak_vram_mb" /></th>
                                <th onClick={() => requestSort('model_details.parameter_size')} style={{ padding: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Size <SortIcon column="model_details.parameter_size" /></th>
                                <th style={{ padding: '1rem' }}>Family</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, idx) => (
                                <tr key={row.filename} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover-row">
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={compareList && compareList.includes(row.filename)}
                                            onChange={() => onToggleCompare && onToggleCompare(row.filename)}
                                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
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
                            {sortedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No models match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .leaderboard-layout {
                        flex-direction: column !important;
                    }
                    .mobile-only {
                        display: flex !important;
                    }
                    .filter-sidebar {
                        width: 100% !important;
                        display: none;
                    }
                    .filter-sidebar.show {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
};

export default Leaderboard;
