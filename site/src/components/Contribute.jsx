import { Github, MessageSquare, Send } from 'lucide-react';

const Contribute = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <h1 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Contribute Benchmarks
                </h1>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    LLMark is an open-source project. You can help by running benchmarks on your own hardware and sharing the results.
                </p>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Github size={24} /> 1. Use LLMark Software
                        </h2>
                        <p>
                            Download and run our benchmark tool to test models on your system. It automatically generates the JSON files needed for this site.
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', marginTop: '1rem' }}>
                            git clone https://github.com/snowtimswiss/llmark<br />
                            cd llmark<br />
                            python main.py
                        </div>
                    </section>

                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Send size={24} /> 2. Submit Results
                        </h2>
                        <p>
                            Once you have your benchmark JSON files (found in the <code>data/benchmarks</code> folder of the tool), you can submit them via a Pull Request to our site repository.
                        </p>
                        <a href="https://github.com/snowtimswiss/LLMark-Site" target="_blank" rel="noopener noreferrer" className="btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                            Submit on GitHub
                        </a>
                    </section>

                    <section style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <MessageSquare size={24} /> Questions?
                        </h2>
                        <p>
                            Join our community or open an issue on GitHub if you need help getting started with benchmarking.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Contribute;
