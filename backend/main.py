from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import models
import database
import schemas
from database import engine, get_db
from ollama_service import extract_data

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Text Extractor API")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Text Extractor API is running"}

@app.post("/ingest", response_model=schemas.ExtractedDataResponse)
def ingest_text(request: schemas.TextIngestRequest, db: Session = Depends(get_db)):
    extracted_info = extract_data(request.text, request.source_type, request.custom_instruction)
    
    db_item = models.ExtractedData(
        source_type=request.source_type,
        raw_text=request.text,
        extracted_json=extracted_info
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@app.post("/ingest/batch", response_model=List[schemas.ExtractedDataResponse])
def ingest_text_batch(batch: schemas.BatchIngestRequest, db: Session = Depends(get_db)):
    results = []
    for item in batch.items:
        # 1. Extract data using Ollama
        extracted_json = ollama_service.extract_data(item.text, item.source_type)
        
        # 2. Save to DB
        db_item = models.ExtractedData(
            source_type=item.source_type,
            raw_text=item.text,
            extracted_json=extracted_json
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # 3. Check for trigger words (simplified for batch)
        # In a real app, you might want to optimize this to not query for every item
        triggers = db.query(models.TriggerWord).all()
        for trigger in triggers:
            if trigger.word.lower() in item.text.lower():
                # Logic to tag or alert (currently just logging/printing in this scope)
                print(f"Trigger found: {trigger.word} in batch item {db_item.id}")
                
        results.append(db_item)
        
    return results

@app.get("/data", response_model=List[schemas.ExtractedDataResponse])
def get_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    data = db.query(models.ExtractedData).offset(skip).limit(limit).all()
    return data

@app.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    data = db.query(models.ExtractedData).all()
    
    records = []
    for item in data:
        record = {
            "id": item.id,
            "source_type": item.source_type,
            "raw_text": item.raw_text,
            "created_at": item.created_at
        }
        if item.extracted_json:
            record.update(item.extracted_json)
        records.append(record)
    
    df = pd.DataFrame(records)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=extracted_data.csv"
    return response

@app.get("/export/excel")
def export_excel(db: Session = Depends(get_db)):
    data = db.query(models.ExtractedData).all()
    
    records = []
    for item in data:
        # Start with extracted fields as the base
        if item.extracted_json and isinstance(item.extracted_json, dict):
            record = dict(item.extracted_json)
        else:
            record = {}
            
        # Add only essential metadata
        # record['id'] = item.id
        if item.created_at:
            record['Date'] = item.created_at.replace(tzinfo=None)
            
        records.append(record)
    
    df = pd.DataFrame(records)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    
    stream.seek(0)
    response = StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers["Content-Disposition"] = "attachment; filename=extracted_data.xlsx"
    return response

@app.get("/export/word")
def export_word(db: Session = Depends(get_db)):
    from docx import Document
    
    data = db.query(models.ExtractedData).all()
    document = Document()
    document.add_heading('Extracted Data Report', 0)
    
    for item in data:
        document.add_heading(f'Transaction #{item.id}', level=1)
        document.add_paragraph(f"Date: {item.created_at}")
        document.add_paragraph(f"Type: {item.source_type}")
        document.add_paragraph("Raw Text:", style='Intense Quote')
        document.add_paragraph(item.raw_text)
        
        if item.extracted_json:
            document.add_heading('Extracted Details:', level=2)
            for key, value in item.extracted_json.items():
                document.add_paragraph(f"{key}: {value}", style='List Bullet')
        
        document.add_page_break()
        
    stream = io.BytesIO()
    document.save(stream)
    stream.seek(0)
    
    response = StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    response.headers["Content-Disposition"] = "attachment; filename=extracted_data.docx"
    return response

@app.get("/export/pdf")
def export_pdf(db: Session = Depends(get_db)):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    
    data = db.query(models.ExtractedData).all()
    stream = io.BytesIO()
    c = canvas.Canvas(stream, pagesize=letter)
    width, height = letter
    y = height - 50
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Extracted Data Report")
    y -= 30
    
    c.setFont("Helvetica", 10)
    
    for item in data:
        if y < 100:
            c.showPage()
            y = height - 50
            
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, f"Transaction #{item.id} - {item.created_at}")
        y -= 20
        
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Type: {item.source_type}")
        y -= 15
        
        # Wrap raw text simply
        text_lines = item.raw_text.split('\n')
        c.setFillColor(colors.darkgrey)
        for line in text_lines:
            c.drawString(50, y, line[:100]) # Simple truncation
            y -= 12
        c.setFillColor(colors.black)
        y -= 10
        
        if item.extracted_json:
            for key, value in item.extracted_json.items():
                c.drawString(70, y, f"{key}: {str(value)}")
                y -= 12
        
        y -= 20
        c.line(50, y, width-50, y)
        y -= 20
        
    c.save()
    stream.seek(0)
    
    response = StreamingResponse(stream, media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=extracted_data.pdf"
    return response

# Trigger Words endpoints
@app.post("/trigger-words", response_model=schemas.TriggerWordResponse)
def create_trigger_word(trigger: schemas.TriggerWordCreate, db: Session = Depends(get_db)):
    db_trigger = models.TriggerWord(word=trigger.word, category=trigger.category)
    db.add(db_trigger)
    db.commit()
    db.refresh(db_trigger)
    return db_trigger

@app.get("/trigger-words", response_model=List[schemas.TriggerWordResponse])
def get_trigger_words(db: Session = Depends(get_db)):
    return db.query(models.TriggerWord).all()

@app.delete("/trigger-words/{trigger_id}")
def delete_trigger_word(trigger_id: int, db: Session = Depends(get_db)):
    trigger = db.query(models.TriggerWord).filter(models.TriggerWord.id == trigger_id).first()
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger word not found")
    db.delete(trigger)
    db.commit()
    return {"message": "Trigger word deleted"}
