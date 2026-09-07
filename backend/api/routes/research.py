"""Research API routes."""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional

from api.models.request import ResearchRequest
from api.models.response import (
    ResearchStartResponse,
    ResearchStatusResponse,
    ResearchReportResponse,
    ErrorResponse,
    QualityMetrics,
    ResearchMetadata
)
from api.services.research_service import research_service
from database.models import ResearchTask
from database.connection import get_db_context

router = APIRouter(prefix="/api/research", tags=["research"])


@router.post("/start", response_model=ResearchStartResponse)
async def start_research(
    request: ResearchRequest,
    background_tasks: BackgroundTasks
):
    """Start a new research task.
    
    Args:
        request: Research request with query and options
        background_tasks: FastAPI background tasks
        
    Returns:
        Task ID and WebSocket URL
    """
    try:
        # Start research task (creates DB entry, does NOT execute)
        task_id = await research_service.start_research(
            query=request.query,
            mode=request.mode,
            options=request.options.dict() if request.options else None
        )
        
        # DO NOT execute in background - let WebSocket handle it
        # This allows WebSocket to send progress updates
        
        # Return task info
        return ResearchStartResponse(
            task_id=task_id,
            status="started",
            websocket_url=f"ws://localhost:8000/ws/{task_id}",
            message="Research task started successfully. Connect to WebSocket for progress updates."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}/status", response_model=ResearchStatusResponse)
async def get_research_status(task_id: str):
    """Get current status of a research task.
    
    Args:
        task_id: Task ID
        
    Returns:
        Current status and progress
    """
    try:
        # Get task status
        status = research_service.get_task_status(task_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Build response
        quality_metrics = status.get("quality_metrics")
        if quality_metrics:
            quality_metrics = QualityMetrics(**quality_metrics)
        
        return ResearchStatusResponse(
            task_id=task_id,
            status=status.get("status", "pending"),
            current_agent=status.get("current_agent"),
            progress=status.get("progress", 0),
            quality_metrics=quality_metrics,
            estimated_time_remaining=None,  # TODO: Calculate based on progress
            error=status.get("error_message")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}/report", response_model=ResearchReportResponse)
async def get_research_report(task_id: str):
    """Get the final research report.
    
    Args:
        task_id: Task ID
        
    Returns:
        Research report and metadata
    """
    try:
        # Get task from database
        with get_db_context() as db:
            task = db.query(ResearchTask).filter(ResearchTask.task_id == task_id).first()
            
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            
            if task.status != "completed":
                raise HTTPException(
                    status_code=400,
                    detail=f"Task is not completed yet. Current status: {task.status}"
                )
            
            # Build metadata
            metadata = ResearchMetadata(
                query=task.query,
                mode=task.mode,
                duration=task.duration,
                quality_score=task.quality_metrics.get("overall_quality") if task.quality_metrics else None,
                sources_count=task.sources_count,
                facts_count=task.facts_count,
                timestamp=task.completed_at or task.created_at
            )
            
            return ResearchReportResponse(
                task_id=task_id,
                report=task.report or "",
                metadata=metadata
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}/cancel")
async def cancel_research(task_id: str):
    """Cancel an in-progress research task.
    
    Args:
        task_id: Task ID
        
    Returns:
        Success message
    """
    try:
        await research_service.cancel_task(task_id)
        return {"success": True, "message": "Task cancelled successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))