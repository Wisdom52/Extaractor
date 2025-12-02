export interface ExtractedData {
    id: number;
    source_type: string;
    raw_text: string;
    extracted_json: Record<string, any> | null;
    created_at: string;
}

export interface TriggerWord {
    id: number;
    word: string;
    category: string;
    created_at: string;
}

export interface TextIngestRequest {
    text: string;
    source_type: string;
}

export interface TriggerWordCreate {
    word: string;
    category: string;
}
