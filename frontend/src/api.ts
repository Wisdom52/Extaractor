import type { ExtractedData, TriggerWord, TextIngestRequest, TriggerWordCreate } from './types';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
    // Text ingestion
    ingestText: async (data: TextIngestRequest): Promise<ExtractedData> => {
        const response = await fetch(`${API_BASE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to ingest text');
        return response.json();
    },

    ingestBatch: async (items: TextIngestRequest[], global_instruction?: string): Promise<ExtractedData[]> => {
        const response = await fetch(`${API_BASE_URL}/ingest/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, global_instruction }),
        });
        if (!response.ok) throw new Error('Failed to ingest batch');
        return response.json();
    },

    // Get all extracted data
    getData: async (): Promise<ExtractedData[]> => {
        const response = await fetch(`${API_BASE_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
    },

    // Export to CSV
    exportCSV: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/export/csv`);
        if (!response.ok) throw new Error('Failed to export CSV');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_data.csv';
        a.click();
    },

    // Trigger words
    getTriggerWords: async (): Promise<TriggerWord[]> => {
        const response = await fetch(`${API_BASE_URL}/trigger-words`);
        if (!response.ok) throw new Error('Failed to fetch trigger words');
        return response.json();
    },

    createTriggerWord: async (data: TriggerWordCreate): Promise<TriggerWord> => {
        const response = await fetch(`${API_BASE_URL}/trigger-words`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create trigger word');
        return response.json();
    },

    deleteTriggerWord: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/trigger-words/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete trigger word');
    },
};
