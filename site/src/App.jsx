import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { LayoutDashboard, BarChart3 } from 'lucide-react'
import Leaderboard from './components/Leaderboard'
import ModelDetails from './components/ModelDetails'
import Compare from './components/Compare'

// Filter/Wrapper for details page
const ModelDetailsWrapper = ({ data }) => {
    const { id } = useParams();
    const model = data.find(d => d.filename === id);
    return <ModelDetails data={model} />;
};

function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [compareList, setCompareList] = useState([]); // IDs (filenames)
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Determine base URL for fetching
        const fetchData = async () => {
            try {
                const response = await fetch('./db.json');
                if (!response.ok) throw new Error('Failed to fetch data');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error("Error loading benchmarks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectModel = (model) => {
        navigate(`/model/${model.filename}`);
    };

    const toggleCompare = (id) => {
        if (compareList.includes(id)) {
            setCompareList(compareList.filter(item => item !== id));
        } else {
            if (compareList.length >= 3) {
                alert("You can duplicate/compare up to 3 models at a time.");
                return;
            }
            setCompareList([...compareList, id]);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading Benchmarks...</div>;

    return (
        <div className="app">
            <nav className="glass-panel" style={{ margin: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    LLMark Site
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className={`btn ${location.pathname === '/' ? '' : 'btn-secondary'}`}><LayoutDashboard size={18} style={{ marginRight: 8 }} /> Leaderboard</button>
                    <button onClick={() => navigate('/compare')} className={`btn ${location.pathname === '/compare' ? '' : 'btn-secondary'}`} style={{ position: 'relative' }}>
                        <BarChart3 size={18} style={{ marginRight: 8 }} />
                        Compare
                        {compareList.length > 0 && (
                            <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                {compareList.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            <div className="container" style={{ paddingBottom: '5rem' }}>
                <Routes>
                    <Route path="/" element={
                        <Leaderboard
                            data={data}
                            onSelectModel={handleSelectModel}
                            compareList={compareList}
                            onToggleCompare={toggleCompare}
                        />
                    } />
                    <Route path="/model/:id" element={<ModelDetailsWrapper data={data} />} />
                    <Route path="/compare" element={
                        <Compare
                            data={data}
                            selectedIds={compareList}
                            onRemove={(id) => setCompareList(compareList.filter(x => x !== id))}
                        />
                    } />
                </Routes>
            </div>
        </div>
    )
}

export default App
