# Multi-Agent Research API Backend

FastAPI backend for the multi-agent research system with WebSocket support for real-time updates.

## Features

- ✅ RESTful API for research management
- ✅ WebSocket streaming for real-time progress
- ✅ SQLite database for history storage
- ✅ Quality metrics tracking
- ✅ Background task execution
- ✅ CORS support for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required environment variables:
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `TAVILY_API_KEY` - Your Tavily API key

### 3. Run the Server

```bash
# From the backend directory
python -m backend.api.main

# Or using uvicorn directly
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Research Endpoints

**POST /api/research/start**
Start a new research task
```json
{
  "query": "What is quantum computing?",
  "mode": "enhanced",
  "options": {
    "max_sources": 20,
    "search_depth": "advanced"
  }
}
```

**GET /api/research/{task_id}/status**
Get current status of a research task

**GET /api/research/{task_id}/report**
Get the final research report

**DELETE /api/research/{task_id}/cancel**
Cancel an in-progress research task

### History Endpoints

**GET /api/history**
Get paginated list of research history
- Query params: `page`, `limit`, `sort`, `order`, `search`

**GET /api/history/{task_id}**
Get details of a specific history item

**DELETE /api/history/{task_id}**
Delete a history item

**POST /api/history/{task_id}/rerun**
Re-run a previous research query

### WebSocket

**WS /ws/{task_id}**
Real-time streaming of research progress

Message types:
- `connected` - Connection established
- `status_update` - Status changed
- `agent_update` - Agent progress update
- `quality_update` - Quality metrics update
- `research_complete` - Research finished
- `error` - Error occurred

## Testing the API

### Using cURL

```bash
# Start research
curl -X POST http://localhost:8000/api/research/start \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Python?", "mode": "basic"}'

# Get status
curl http://localhost:8000/api/research/{task_id}/status

# Get report
curl http://localhost:8000/api/research/{task_id}/report
```

### Using Python

```python
import requests
import websocket
import json

# Start research
response = requests.post(
    "http://localhost:8000/api/research/start",
    json={
        "query": "What is quantum computing?",
        "mode": "enhanced"
    }
)
data = response.json()
task_id = data["task_id"]
ws_url = data["websocket_url"]

# Connect to WebSocket for real-time updates
def on_message(ws, message):
    data = json.loads(message)
    print(f"Update: {data['type']}")
    if data['type'] == 'research_complete':
        print("Report:", data['report'][:200])

ws = websocket.WebSocketApp(
    ws_url,
    on_message=on_message
)
ws.run_forever()
```

### Using the Swagger UI

1. Open http://localhost:8000/docs
2. Try out the endpoints interactively
3. View request/response schemas

## Database

The API uses SQLite by default (`research.db`). For production, use PostgreSQL:

```bash
# Set in .env
DATABASE_URL=postgresql://user:password@localhost:5432/research
```

## Project Structure

```
backend/
├── api/
│   ├── main.py              # FastAPI app
│   ├── routes/
│   │   ├── research.py      # Research endpoints
│   │   ├── history.py       # History endpoints
│   │   └── websocket.py     # WebSocket endpoint
│   ├── models/
│   │   ├── request.py       # Request models
│   │   └── response.py      # Response models
│   └── services/
│       └── research_service.py  # Research orchestration
├── database/
│   ├── models.py            # Database models
│   └── connection.py        # Database connection
└── requirements.txt         # Dependencies
```

## Development

### Running Tests

```bash
pytest tests/
```

### Code Quality

```bash
# Format code
black backend/

# Type checking
mypy backend/

# Linting
ruff backend/
```

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://yourdomain.com
```

## Troubleshooting

**Issue**: API keys not found
- Solution: Make sure `.env` file exists and contains valid API keys

**Issue**: Database errors
- Solution: Delete `research.db` and restart the server to recreate

**Issue**: WebSocket connection fails
- Solution: Check CORS settings and ensure WebSocket URL is correct

**Issue**: Slow research execution
- Solution: Use "basic" mode for faster results or reduce `max_sources`

## Next Steps

1. ✅ Backend API complete
2. 🔄 Create frontend (Next.js)
3. 🔄 Add authentication
4. 🔄 Deploy to production

See `WEB_UI_PLAN.md` for complete implementation roadmap.
