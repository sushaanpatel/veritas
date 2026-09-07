"""Database models for research history."""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class ResearchTask(Base):
    """Model for storing research tasks."""
    __tablename__ = "research_tasks"
    
    task_id = Column(String(36), primary_key=True)
    query = Column(Text, nullable=False)
    mode = Column(String(20), nullable=False)  # basic or enhanced
    status = Column(String(20), nullable=False)  # pending, in_progress, completed, failed, cancelled
    
    # Progress tracking
    current_agent = Column(String(50), nullable=True)
    progress = Column(Integer, default=0)  # 0-100
    
    # Results
    report = Column(Text, nullable=True)
    sources_count = Column(Integer, nullable=True)
    facts_count = Column(Integer, nullable=True)
    
    # Quality metrics (stored as JSON)
    quality_metrics = Column(JSON, nullable=True)
    
    # Metadata
    options = Column(JSON, nullable=True)  # Research options used
    duration = Column(Integer, nullable=True)  # seconds
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "task_id": self.task_id,
            "query": self.query,
            "mode": self.mode,
            "status": self.status,
            "current_agent": self.current_agent,
            "progress": self.progress,
            "report": self.report,
            "sources_count": self.sources_count,
            "facts_count": self.facts_count,
            "quality_metrics": self.quality_metrics,
            "options": self.options,
            "duration": self.duration,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
