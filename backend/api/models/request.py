"""Request models for the API."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class ResearchOptions(BaseModel):
    """Optional research configuration."""
    max_sources: Optional[int] = Field(default=20, ge=5, le=50)
    search_depth: Optional[Literal["basic", "advanced"]] = "advanced"
    analysis_depth: Optional[Literal["shallow", "medium", "deep"]] = "medium"
    requires_fact_check: Optional[bool] = True
    requires_iteration: Optional[bool] = None


class ResearchRequest(BaseModel):
    """Request to start a new research task."""
    query: str = Field(..., min_length=3, max_length=500)
    mode: Literal["basic", "enhanced"] = "enhanced"
    options: Optional[ResearchOptions] = None


class RerunRequest(BaseModel):
    """Request to rerun a previous research task."""
    task_id: str
    use_same_options: bool = True
