"""History API routes."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from sqlalchemy import desc, asc

from api.models.response import HistoryListResponse, HistoryItem, ResearchReportResponse, ResearchMetadata
from database.models import ResearchTask
from database.connection import get_db_context

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=HistoryListResponse)
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("date", regex="^(date|quality|duration)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    search: Optional[str] = None
):
    """Get list of research history.
    
    Args:
        page: Page number (1-indexed)
        limit: Items per page
        sort: Sort field (date, quality, duration)
        order: Sort order (asc, desc)
        search: Optional search query
        
    Returns:
        Paginated list of history items
    """
    try:
        with get_db_context() as db:
            # Build query
            query = db.query(ResearchTask).filter(
                ResearchTask.status.in_(["completed", "failed", "cancelled"])
            )
            
            # Apply search filter
            if search:
                query = query.filter(ResearchTask.query.contains(search))
            
            # Apply sorting
            sort_column = {
                "date": ResearchTask.completed_at,
                "quality": ResearchTask.quality_metrics,
                "duration": ResearchTask.duration
            }.get(sort, ResearchTask.completed_at)
            
            if order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * limit
            tasks = query.offset(offset).limit(limit).all()
            
            # Build response items
            items = []
            for task in tasks:
                # Get quality score
                quality_score = None
                if task.quality_metrics:
                    quality_score = task.quality_metrics.get("overall_quality")
                
                # Get report preview
                preview = None
                if task.report:
                    preview = task.report[:200] + "..." if len(task.report) > 200 else task.report
                
                items.append(HistoryItem(
                    task_id=task.task_id,
                    query=task.query,
                    mode=task.mode,
                    status=task.status,
                    quality_score=quality_score,
                    duration=task.duration,
                    timestamp=task.completed_at or task.created_at,
                    preview=preview
                ))
            
            # Calculate pages
            pages = (total + limit - 1) // limit
            
            return HistoryListResponse(
                items=items,
                total=total,
                page=page,
                pages=pages,
                limit=limit
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=ResearchReportResponse)
async def get_history_item(task_id: str):
    """Get details of a specific history item.
    
    Args:
        task_id: Task ID
        
    Returns:
        Full research report and metadata
    """
    try:
        with get_db_context() as db:
            task = db.query(ResearchTask).filter(ResearchTask.task_id == task_id).first()
            
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            
            # Build metadata
            quality_score = None
            if task.quality_metrics:
                quality_score = task.quality_metrics.get("overall_quality")
            
            metadata = ResearchMetadata(
                query=task.query,
                mode=task.mode,
                duration=task.duration,
                quality_score=quality_score,
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


@router.delete("/{task_id}")
async def delete_history_item(task_id: str):
    """Delete a history item.
    
    Args:
        task_id: Task ID
        
    Returns:
        Success message
    """
    try:
        with get_db_context() as db:
            task = db.query(ResearchTask).filter(ResearchTask.task_id == task_id).first()
            
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            
            db.delete(task)
        
        return {"success": True, "message": "History item deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/rerun")
async def rerun_history_item(task_id: str):
    """Re-run a previous research query.
    
    Args:
        task_id: Task ID to rerun
        
    Returns:
        New task ID
    """
    try:
        with get_db_context() as db:
            task = db.query(ResearchTask).filter(ResearchTask.task_id == task_id).first()
            
            if not task:
                raise HTTPException(status_code=404, detail="Task not found")
            
            # Import here to avoid circular dependency
            from backend.api.services.research_service import research_service
            
            # Start new research with same parameters
            new_task_id = await research_service.start_research(
                query=task.query,
                mode=task.mode,
                options=task.options
            )
            
            return {
                "success": True,
                "message": "Research restarted",
                "new_task_id": new_task_id,
                "websocket_url": f"ws://localhost:8000/ws/{new_task_id}"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
