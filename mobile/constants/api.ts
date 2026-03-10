import Constants from 'expo-constants';
import { ExtractedData, TriggerWord, TextIngestRequest, TriggerWordCreate } from '../types';

// const getBaseUrl = () => {
//     // If running in Expo Go on physical device, we need the LAN IP.
//     // Constants.expoConfig.hostUri contains the IP:PORT of the packager.
//     const debuggerHost = Constants.expoConfig?.hostUri;
//     const localhost = debuggerHost?.split(':')[0];

//     if (!localhost) {
//         // Fallback for simulator or if hostUri is missing
//         return 'http://10.0.2.2:8000'; // Android Emulator localhost
//         // return 'http://localhost:8000'; // iOS Simulator
//     }

//     return `http://${localhost}:8000`;
// };

const getBaseUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL;
};


const API_BASE_URL = getBaseUrl();

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
