"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from database.connection import init_db
from api.routes import research, history, websocket

# Load environment variables from backend directory
env_path = backend_dir / '.env'
load_dotenv(env_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    print("🚀 Starting Multi-Agent Research API...")
    
    # Initialize database
    print("📊 Initializing database...")
    init_db()
    print("✅ Database initialized")
    
    # Verify API keys
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    if not aws_key:
        print("⚠️  Warning: AWS_ACCESS_KEY_ID not set")
    if not tavily_key:
        print("⚠️  Warning: TAVILY_API_KEY not set")
    
    if aws_key and tavily_key:
        print("🔑 API keys validated")
    
    print("✅ API ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down API...")


# Create FastAPI app
app = FastAPI(
    title="Multi-Agent Research API",
    description="API for intelligent multi-agent research system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - Allow all frontend ports
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(research.router)
app.include_router(history.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Multi-Agent Research API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "api_keys": {
            "aws": bool(os.getenv("AWS_ACCESS_KEY_ID")),
            "tavily": bool(os.getenv("TAVILY_API_KEY"))
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )