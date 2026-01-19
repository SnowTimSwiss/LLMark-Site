import { Github, MessageSquare, Download, CheckCircle } from 'lucide-react';

const Contribute = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <h1 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Contribute Benchmarks
                </h1>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Helping the community is easier than ever. Simply run the benchmark tool on your hardware, and it will handle the rest.
                </p>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Download size={24} /> 1. Run Benchmarks
                        </h2>
                        <p>
                            Download and run our lightweight benchmark tool to test models on your system.
                        </p>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', marginTop: '1rem' }}>
                            git clone https://github.com/snowtimswiss/llmark<br />
                            cd llmark<br />
                            start.bat  |  for windows<br />
                            ./start.sh  |  for linux <br />
                        </div>
                    </section>

                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <CheckCircle size={24} /> 2. Automatic Upload
                        </h2>
                        <p>
                            Once the benchmark is complete, the tool will ask for your consent to upload the results. With your approval, the data is sent directly to our database and will appear on the leaderboard!
                        </p>
                    </section>

                    <section style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Github size={24} /> Manual Submission
                        </h2>
                        <p>
                            Prefer to do it manually? You can still submit your benchmark JSON files via a Pull Request to our site repository.
                        </p>
                        <a href="https://github.com/snowtimswiss/LLMark-Site" target="_blank" rel="noopener noreferrer" className="btn" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                            View GitHub Repo
                        </a>
                    </section>

                    <section style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <MessageSquare size={24} /> Questions?
                        </h2>
                        <p>
                            Join our community or open an issue on GitHub if you need help getting started.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Contribute;
