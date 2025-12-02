# Text Extractor

A powerful text extraction and analysis tool that uses local Ollama LLM to process business messages (M-Pesa transactions, product orders) and social media comments. Built with FastAPI, React, TypeScript, and PostgreSQL.

## Features

- 🤖 **AI-Powered Extraction**: Uses Ollama LLM to intelligently extract structured data from unstructured text
- 💰 **M-Pesa Processing**: Extract transaction details from M-Pesa messages
- 📦 **Order Management**: Parse product orders from text messages
- 💬 **Sentiment Analysis**: Analyze social media comments
- 🏷️ **Trigger Words**: Define custom trigger words to categorize and flag data
- 📊 **Export to CSV**: Export all extracted data to spreadsheets
- 🎨 **Modern UI**: Beautiful, responsive interface with premium design

## Prerequisites

- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- Ollama (running locally)

## Installation

### 1. Start Ollama

Make sure Ollama is running on your machine:

```bash
ollama serve
```

Pull a model (e.g., llama3):

```bash
ollama pull llama3
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Setup Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
# Option 1: Using run.py
python run.py

# Option 2: Using uvicorn directly
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Ingest Text**: Navigate to the "Ingest" page and paste your text (M-Pesa message, order, or comment)
2. **View Data**: Check the "Data" page to see all extracted information
3. **Export**: Click "Export to CSV" to download your data
4. **Configure Triggers**: Go to "Settings" to define trigger words for your use case

## Example Texts

### M-Pesa Transaction
```
RK12ABC123 Confirmed. Ksh5,000.00 received from JOHN DOE 254712345678 on 01/12/2024 at 10:30 AM
```

### Product Order
```
New order from Jane Smith: 3x Widget A, 2x Widget B. Contact: 0722123456. Delivery to Nairobi CBD.
```

### Social Media Comment
```
This product is amazing! Best purchase I've made this year. Highly recommend to everyone!
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **AI**: Ollama (Local LLM)
- **Database**: PostgreSQL (Docker)
- **Styling**: Vanilla CSS

## API Endpoints

- `POST /ingest` - Ingest and process text
- `GET /data` - Retrieve all extracted data
- `GET /export/csv` - Export data to CSV
- `POST /trigger-words` - Create trigger word
- `GET /trigger-words` - Get all trigger words
- `DELETE /trigger-words/{id}` - Delete trigger word

## Database Access

Adminer is available at `http://localhost:8080` for database management:
- System: PostgreSQL
- Server: db
- Username: user
- Password: password
- Database: text_extractor

## License

MIT
