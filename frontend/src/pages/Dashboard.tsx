import { useEffect, useState } from 'react';
import { api } from '../api';
import type { ExtractedData } from '../types';
import Skeleton from '../components/Skeleton';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        mpesa: 0,
    });
    const [recentData, setRecentData] = useState<ExtractedData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getData();
            setRecentData(data.slice(0, 5));

            const counts = {
                total: data.length,
                mpesa: data.filter(d => d.source_type === 'mpesa').length,
            };
            setStats(counts);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your extracted data and statistics.</p>
            </div>

            <div className="stats-grid">
                {loading ? (
                    <>
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon bg-blue">📊</div>
                            <div className="stat-info">
                                <h3>Total Records</h3>
                                <p className="stat-number">{stats.total}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon bg-green">💰</div>
                            <div className="stat-info">
                                <h3>M-Pesa</h3>
                                <p className="stat-number">{stats.mpesa}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="recent-section">
                <h2>Recent Extractions</h2>
                {loading ? (
                    <div className="recent-list">
                        <Skeleton height="80px" />
                        <Skeleton height="80px" />
                        <Skeleton height="80px" />
                    </div>
                ) : recentData.length > 0 ? (
                    <div className="recent-list">
                        {recentData.map(item => (
                            <div key={item.id} className="recent-item card">
                                <div className="recent-header">
                                    <span className={`source-badge ${item.source_type}`}>{item.source_type}</span>
                                    <span className="recent-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="recent-text">{item.raw_text.substring(0, 100)}...</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state card">
                        <p>No data yet. Start by ingesting some text!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
