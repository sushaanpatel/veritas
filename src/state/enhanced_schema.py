"""Enhanced state schema with orchestrator capabilities."""

from typing import TypedDict, List, Dict, Optional, Annotated, Literal
from datetime import datetime
from langgraph.graph.message import add_messages


class Source(TypedDict):
    """Individual source information."""
    url: str
    title: str
    content: str
    author: Optional[str]
    date: Optional[str]
    credibility_score: float


class Fact(TypedDict):
    """Extracted fact with metadata."""
    claim: str
    source_urls: List[str]
    confidence: float
    verified: bool
    reasoning: Optional[str]


class QualityMetrics(TypedDict):
    """Quality assessment metrics."""
    source_diversity: float      # 0-1, domain diversity
    content_depth: float         # 0-1, average content quality
    fact_confidence: float       # 0-1, average fact confidence
    citation_coverage: float     # 0-1, facts with citations
    overall_quality: float       # 0-1, combined score


class ResearchStrategy(TypedDict):
    """Research strategy configuration."""
    type: Literal["breadth", "depth", "comparative", "technical", "overview"]
    max_sources: int
    search_depth: Literal["basic", "advanced"]
    analysis_depth: Literal["shallow", "medium", "deep"]
    requires_fact_check: bool
    requires_iteration: bool


class EnhancedResearchState(TypedDict):
    """Enhanced state with orchestrator capabilities."""
    # Messages for agent communication
    messages: Annotated[List[Dict], add_messages]
    
    # Query Information
    query: str
    query_type: str  # OVERVIEW, TECHNICAL, COMPARATIVE, etc.
    complexity: str  # LOW, MEDIUM, HIGH
    research_goals: List[str]
    subtasks: List[str]
    
    # Strategy
    strategy: ResearchStrategy
    
    # Research Materials
    sources: List[Source]
    
    # Analysis Results
    extracted_facts: List[Fact]
    key_insights: List[str]
    
    # Synthesis
    synthesized_content: str
    
    # Verification
    verified_facts: List[Fact]
    
    # Quality Metrics
    quality_metrics: QualityMetrics
    
    # Report
    final_report: Optional[str]
    
    # Orchestrator Control
    current_agent: str
    iteration: int
    max_iterations: int
    needs_refinement: bool
    needs_additional_search: bool
    needs_human_review: bool
    
    # Metadata
    timestamp: str
    agent_history: List[str]
