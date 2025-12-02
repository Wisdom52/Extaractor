import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import type { ExtractedData, TextIngestRequest } from '../types';
import Skeleton from '../components/Skeleton';
import './DataView.css';

function DataView() {
    const [data, setData] = useState<ExtractedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    // const [filter, setFilter] = useState('all');
    const [globalInstruction, setGlobalInstruction] = useState('');

    // M-Pesa Sync State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await api.getData();
            setData(result);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            // Simple line-based parsing (assuming 1 message per line for now)
            // In a real app, you'd have more robust CSV/JSON parsing
            const lines = text.split('\n').filter(line => line.trim().length > 0);

            const batchItems: TextIngestRequest[] = lines.map(line => ({
                text: line.trim(),
                source_type: 'mpesa' // Defaulting to mpesa for bulk upload
            }));

            await processBatch(batchItems);
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processBatch = async (items: TextIngestRequest[]) => {
        setProcessing(true);
        setProgress(0);

        try {
            // Process in chunks of 5 to show progress
            const chunkSize = 5;
            for (let i = 0; i < items.length; i += chunkSize) {
                const chunk = items.slice(i, i + chunkSize);
                await api.ingestBatch(chunk, globalInstruction);
                setProgress(Math.min(100, Math.round(((i + chunkSize) / items.length) * 100)));
            }

            await loadData();
            alert('Batch processing complete!');
        } catch (error) {
            console.error('Batch processing failed:', error);
            alert('Batch processing failed');
        } finally {
            setProcessing(false);
            setProgress(0);
        }
    };

    const handleMpesaSync = async () => {
        if (!startDate || !endDate) {
            alert('Please select a date range');
            return;
        }

        // Simulation of reading messages
        setProcessing(true);
        setProgress(10);

        setTimeout(async () => {
            setProgress(50);
            // Mock data found
            const mockMessages: TextIngestRequest[] = [
                { text: 'QK123456 Confirmed. Ksh1000 sent to John Doe on 02/04/2025', source_type: 'mpesa' },
                { text: 'QK123457 Confirmed. Ksh500 received from Jane Doe on 03/04/2025', source_type: 'mpesa' },
                { text: 'QK123458 Confirmed. Ksh200 paid to KPLC on 03/04/2025', source_type: 'mpesa' },
            ];

            await api.ingestBatch(mockMessages);
            await loadData();
            setProgress(100);
            setProcessing(false);
            alert(`Synced ${mockMessages.length} messages from ${startDate} to ${endDate}`);
        }, 2000);
    };

    const handleExport = async () => {
        try {
            await api.exportCSV();
        } catch (error) {
            console.error('Failed to export:', error);
            alert('Failed to export data');
        }
    };

    const filteredData = data;

    const [selectedItem, setSelectedItem] = useState<ExtractedData | null>(null);

    return (
        <div className="page-container full-width">
            <div className="page-header">
                <h1 className="page-title">Bulk Extraction</h1>
                <p className="page-subtitle">Process multiple messages, upload files, or sync M-Pesa data.</p>
            </div>

            <div className="bulk-actions-grid">
                {/* Global Instructions Card */}
                <div className="action-card card full-span">
                    <div className="card-icon">📝</div>
                    <h3>Global Instructions</h3>
                    <p>Define what to extract for all items in this batch.</p>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={globalInstruction}
                        onChange={(e) => setGlobalInstruction(e.target.value)}
                        placeholder="e.g., Extract Amount and Date only..."
                    />
                </div>

                {/* File Upload Card */}
                <div className="action-card card">
                    <div className="card-icon">📂</div>
                    <h3>Upload File</h3>
                    <p>Upload .txt or .csv files containing multiple messages.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".txt,.csv"
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-primary full-width"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processing}
                    >
                        Select File
                    </button>
                </div>

                {/* M-Pesa Sync Card */}
                <div className="action-card card">
                    <div className="card-icon">📱</div>
                    <h3>M-Pesa Sync</h3>
                    <p>Read messages from your device within a date range.</p>
                    <div className="date-inputs">
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="separator">to</span>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary full-width"
                        onClick={handleMpesaSync}
                        disabled={processing}
                    >
                        Sync Messages
                    </button>
                </div>
            </div>

            {processing && (
                <div className="progress-section card">
                    <h3>Processing Batch...</h3>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p>{progress}% Complete</p>
                </div>
            )}

            <div className="data-section card">
                <div className="data-header-row">
                    <h2>Extracted Results ({filteredData.length})</h2>
                    <div className="header-actions">
                        <div className="filters-row">
                            {/* Filters removed - only M-Pesa supported */}
                        </div>
                        <div className="export-buttons">
                            <button onClick={() => api.exportCSV()} className="btn btn-sm btn-outline btn-csv">📊 CSV</button>
                            <button onClick={() => api.exportExcel()} className="btn btn-sm btn-outline btn-excel">📗 Excel</button>
                            <button onClick={() => api.exportPDF()} className="btn btn-sm btn-outline btn-pdf">📕 PDF</button>
                            <button onClick={() => api.exportWord()} className="btn btn-sm btn-outline btn-word">📘 Word</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Skeleton height="50px" />
                        <Skeleton height="50px" />
                        <Skeleton height="50px" />
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Raw Text</th>
                                    <th>Extracted Data</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map(item => (
                                    <tr key={item.id} onClick={() => setSelectedItem(item)} className="clickable-row">
                                        <td>#{item.id}</td>
                                        <td>
                                            <span className={`source-badge ${item.source_type}`}>{item.source_type}</span>
                                        </td>
                                        <td className="text-cell" title={item.raw_text}>{item.raw_text}</td>
                                        <td className="text-cell">
                                            <span className="view-details-link">View Details...</span>
                                        </td>
                                        <td className="date-cell">{new Date(item.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No data found.</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Transaction Details #{selectedItem.id}</h2>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-group">
                                <label>Date Processed</label>
                                <p>{new Date(selectedItem.created_at).toLocaleString()}</p>
                            </div>
                            <div className="detail-group">
                                <label>Raw Text</label>
                                <p className="raw-text-box">{selectedItem.raw_text}</p>
                            </div>
                            <div className="detail-group">
                                <label>Extracted Data</label>
                                <div className="extracted-data-box">
                                    {selectedItem.extracted_json ? (
                                        <table className="details-table">
                                            <tbody>
                                                {Object.entries(selectedItem.extracted_json).map(([key, value]) => (
                                                    <tr key={key}>
                                                        <td className="key-col">{key}</td>
                                                        <td className="value-col">{String(value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No extracted data available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setSelectedItem(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataView;
