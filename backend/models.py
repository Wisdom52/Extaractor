from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class ExtractedData(Base):
    __tablename__ = "extracted_data"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, index=True) # e.g., "mpesa", "order", "comment"
    raw_text = Column(Text)
    extracted_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TriggerWord(Base):
    __tablename__ = "trigger_words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True)
    category = Column(String) # e.g., "urgent", "spam", "positive", "negative"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
