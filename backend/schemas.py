from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class TextIngestRequest(BaseModel):
    text: str
    source_type: str
    custom_instruction: Optional[str] = None

class ExtractedDataResponse(BaseModel):
    id: int
    source_type: str
    raw_text: str
    extracted_json: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class BatchIngestRequest(BaseModel):
    items: List[TextIngestRequest]
    global_instruction: Optional[str] = None

class TriggerWordCreate(BaseModel):
    word: str
    category: str

class TriggerWordResponse(BaseModel):
    id: int
    word: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True
