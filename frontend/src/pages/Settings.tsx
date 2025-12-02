import { useEffect, useState } from 'react';
import { api } from '../api';
import type { TriggerWord } from '../types';
import Skeleton from '../components/Skeleton';
import './Settings.css';

function Settings() {
    const [triggerWords, setTriggerWords] = useState<TriggerWord[]>([]);
    const [newWord, setNewWord] = useState('');
    const [category, setCategory] = useState('urgent');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadTriggerWords();
    }, []);

    const loadTriggerWords = async () => {
        try {
            const words = await api.getTriggerWords();
            setTriggerWords(words);
        } catch (error) {
            console.error('Failed to load trigger words:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWord.trim()) return;

        setAdding(true);
        try {
            await api.createTriggerWord({ word: newWord, category });
            setNewWord('');
            setCategory('urgent');
            await loadTriggerWords();
        } catch (error) {
            console.error('Failed to add trigger word:', error);
            alert('Failed to add trigger word');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this trigger word?')) return;

        try {
            await api.deleteTriggerWord(id);
            await loadTriggerWords();
        } catch (error) {
            console.error('Failed to delete trigger word:', error);
            alert('Failed to delete trigger word');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure trigger words to automatically categorize extracted data.</p>
            </div>

            <div className="settings-layout">
                <div className="settings-card card">
                    <h2>Add New Trigger</h2>
                    <form onSubmit={handleAdd} className="trigger-form">
                        <div className="form-group">
                            <label htmlFor="word" className="form-label">Trigger Word</label>
                            <input
                                id="word"
                                type="text"
                                className="form-control"
                                value={newWord}
                                onChange={(e) => setNewWord(e.target.value)}
                                placeholder="e.g., urgent, spam, positive"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                className="form-control"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="urgent">Urgent</option>
                                <option value="spam">Spam</option>
                                <option value="positive">Positive</option>
                                <option value="negative">Negative</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary full-width" disabled={adding}>
                            {adding ? 'Adding...' : '+ Add Trigger'}
                        </button>
                    </form>
                </div>

                <div className="triggers-list-container">
                    <h2>Active Triggers</h2>
                    {loading ? (
                        <div className="trigger-list">
                            <Skeleton height="60px" />
                            <Skeleton height="60px" />
                            <Skeleton height="60px" />
                        </div>
                    ) : triggerWords.length > 0 ? (
                        <div className="trigger-list">
                            {triggerWords.map(trigger => (
                                <div key={trigger.id} className="trigger-item card">
                                    <div className="trigger-info">
                                        <span className="trigger-word">{trigger.word}</span>
                                        <span className={`category-badge ${trigger.category}`}>
                                            {trigger.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(trigger.id)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state card">
                            <p>No trigger words defined yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
