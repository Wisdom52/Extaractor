import { useState } from 'react';
import { api } from '../api';
import type { ExtractedData } from '../types';
import './Ingest.css';

function Ingest() {
    const [text, setText] = useState('');
    // const [sourceType, setSourceType] = useState('mpesa'); // Hardcoded to mpesa
    const [customInstruction, setCustomInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [sessionData, setSessionData] = useState<ExtractedData[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setMessage('Please enter some text');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await api.ingestText({
                text,
                source_type: 'mpesa',
                custom_instruction: customInstruction
            });
            setMessage('✅ Text processed successfully!');
            setText('');
            // Add new result to the top of the session list
            setSessionData(prev => [result, ...prev]);
        } catch (error) {
            setMessage('❌ Failed to process text. Make sure the backend is running.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportSession = (format: 'csv' | 'excel' | 'pdf' | 'word') => {
        if (sessionData.length === 0) return;

        const filename = `session_extraction_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;

        if (format === 'csv') {
            const headers = ['ID', 'Source Type', 'Raw Text', 'Extracted Data', 'Date'];
            const rows = sessionData.map(item => [
                item.id,
                item.source_type,
                `"${item.raw_text.replace(/"/g, '""')}"`,
                `"${JSON.stringify(item.extracted_json).replace(/"/g, '""')}"`,
                item.created_at
            ]);
            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else if (format === 'excel') {
            import('xlsx').then(XLSX => {
                const flattenedData = sessionData.map(item => {
                    // Flatten the extracted JSON to top-level fields
                    const row: any = { ...item.extracted_json };
                    // Add Date metadata
                    row['Date'] = item.created_at;
                    return row;
                });

                const worksheet = XLSX.utils.json_to_sheet(flattenedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Session Data");
                XLSX.writeFile(workbook, `${filename}.xlsx`);
            });
        }
        else if (format === 'pdf') {
            import('jspdf').then(({ default: jsPDF }) => {
                import('jspdf-autotable').then(() => {
                    const doc = new jsPDF();
                    doc.text("Session Extraction Results", 14, 15);

                    const tableData = sessionData.map(item => [
                        item.id,
                        item.source_type,
                        item.created_at,
                        JSON.stringify(item.extracted_json)
                    ]);

                    (doc as any).autoTable({
                        head: [['ID', 'Type', 'Date', 'Extracted Data']],
                        body: tableData,
                        startY: 20,
                    });

                    doc.save(`${filename}.pdf`);
                });
            });
        }
        else if (format === 'word') {
            // Simple HTML to Word export
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
            const footer = "</body></html>";

            let html = header + "<h1>Session Extraction Results</h1>";
            sessionData.forEach(item => {
                html += `<h3>Transaction #${item.id}</h3>`;
                html += `<p><strong>Date:</strong> ${item.created_at}</p>`;
                html += `<p><strong>Raw Text:</strong><br/>${item.raw_text}</p>`;
                html += `<p><strong>Extracted Data:</strong><br/>${JSON.stringify(item.extracted_json)}</p>`;
                html += "<hr/>";
            });
            html += footer;

            const blob = new Blob(['\ufeff', html], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderJsonAsTable = (jsonData: any) => {
        if (!jsonData) return <span className="text-muted">No data</span>;

        // Handle array of objects
        if (Array.isArray(jsonData) && jsonData.length > 0) {
            const keys = Object.keys(jsonData[0]);
            return (
                <div className="nested-table-wrapper">
                    <table className="nested-table">
                        <thead>
                            <tr>
                                {keys.map(key => <th key={key}>{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {jsonData.map((item, idx) => (
                                <tr key={idx}>
                                    {keys.map(key => (
                                        <td key={key}>
                                            {typeof item[key] === 'object'
                                                ? JSON.stringify(item[key])
                                                : String(item[key])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Handle single object
        if (typeof jsonData === 'object' && jsonData !== null) {
            return (
                <div className="nested-table-wrapper">
                    <table className="nested-table">
                        <tbody>
                            {Object.entries(jsonData).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="key-cell">{key}</td>
                                    <td className="value-cell">
                                        {typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return <span>{String(jsonData)}</span>;
    };

    return (
        <div className="page-container full-width">
            <div className="page-header">
                <h1 className="page-title">Ingest Text</h1>
                <p className="page-subtitle">Manually extract data and view results instantly.</p>
            </div>

            <div className="ingest-layout">
                {/* Left Column: Input Form */}
                <div className="ingest-main card">
                    <h2>Input Text</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Source Type removed - defaulting to M-Pesa */}

                        <div className="form-group">
                            <label htmlFor="text" className="form-label">Text Content</label>
                            <textarea
                                id="text"
                                className="form-control"
                                rows={10}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your text here..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="instruction" className="form-label">Custom Instructions (Optional)</label>
                            <textarea
                                id="instruction"
                                className="form-control"
                                rows={3}
                                value={customInstruction}
                                onChange={(e) => setCustomInstruction(e.target.value)}
                                placeholder="e.g., Extract only the Transaction ID and Amount..."
                            />
                        </div>

                        {message && (
                            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                                {message}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                            {loading ? 'Processing...' : 'Extract Data'}
                        </button>
                    </form>
                </div>

                {/* Right Column: Session Results Table */}
                <div className="results-section card">
                    <div className="results-header">
                        <h2>Session Results ({sessionData.length})</h2>
                        {sessionData.length > 0 && (
                            <div className="export-buttons">
                                <button onClick={() => handleExportSession('csv')} className="btn btn-sm btn-outline btn-csv">📊 CSV</button>
                                <button onClick={() => handleExportSession('excel')} className="btn btn-sm btn-outline btn-excel">📗 Excel</button>
                                <button onClick={() => handleExportSession('pdf')} className="btn btn-sm btn-outline btn-pdf">📕 PDF</button>
                                <button onClick={() => handleExportSession('word')} className="btn btn-sm btn-outline btn-word">📘 Word</button>
                            </div>
                        )}
                    </div>

                    {sessionData.length > 0 ? (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Extracted Data</th>
                                        <th>Raw Text</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionData.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <span className={`source-badge ${item.source_type}`}>{item.source_type}</span>
                                            </td>
                                            <td>
                                                {renderJsonAsTable(item.extracted_json)}
                                            </td>
                                            <td className="text-cell" title={item.raw_text}>{item.raw_text}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No data extracted in this session yet.</p>
                            <p className="sub-text">Process some text to see results here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Ingest;
