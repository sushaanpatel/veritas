"""Response models for the API."""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel
from datetime import datetime


class QualityMetrics(BaseModel):
    """Quality metrics for research."""
    source_diversity: float
    content_depth: float
    fact_confidence: float
    citation_coverage: float
    overall_quality: float


class ResearchMetadata(BaseModel):
    """Metadata about a research task."""
    query: str
    mode: Literal["basic", "enhanced"]
    duration: Optional[int] = None  # seconds
    quality_score: Optional[float] = None
    sources_count: Optional[int] = None
    facts_count: Optional[int] = None
    timestamp: datetime


class ResearchStartResponse(BaseModel):
    """Response when starting a research task."""
    task_id: str
    status: Literal["started"]
    websocket_url: str
    message: str = "Research task started successfully"


class ResearchStatusResponse(BaseModel):
    """Response for research task status."""
    task_id: str
    status: Literal["pending", "in_progress", "completed", "failed", "cancelled"]
    current_agent: Optional[str] = None
    progress: int = 0  # 0-100
    quality_metrics: Optional[QualityMetrics] = None
    estimated_time_remaining: Optional[int] = None  # seconds
    error: Optional[str] = None


class ResearchReportResponse(BaseModel):
    """Response containing the final research report."""
    task_id: str
    report: str
    metadata: ResearchMetadata


class HistoryItem(BaseModel):
    """A single history item."""
    task_id: str
    query: str
    mode: Literal["basic", "enhanced"]
    status: Literal["completed", "failed", "cancelled"]
    quality_score: Optional[float] = None
    duration: Optional[int] = None
    timestamp: datetime
    preview: Optional[str] = None  # First 200 chars of report


class HistoryListResponse(BaseModel):
    """Response for history list."""
    items: List[HistoryItem]
    total: int
    page: int
    pages: int
    limit: int


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    task_id: Optional[str] = None


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
