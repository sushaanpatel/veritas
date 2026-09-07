"""State schema definitions for the multi-agent research system."""

from typing import TypedDict, List, Dict, Optional, Annotated
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


class ResearchState(TypedDict):
    """Main state shared across all agents.

    This state is passed between agents and maintains the complete
    context of the research process.
    """
    # Messages for agent communication (LangGraph standard)
    messages: Annotated[List[Dict], add_messages]

    # Query Information
    query: str
    research_goals: List[str]
    subtasks: List[str]

    # Research Materials
    sources: List[Source]

    # Analysis Results
    extracted_facts: List[Fact]
    key_insights: List[str]

    # Synthesis
    synthesized_content: str

    # Verification
    verified_facts: List[Fact]

    # Report
    final_report: Optional[str]

    # Configuration — populated from user options by the service layer
    strategy: Dict        # keys: max_sources, search_depth, analysis_depth, requires_fact_check, requires_iteration
    user_options: Dict    # raw options dict from the API request

    # Metadata
    current_agent: str
    iteration: int
    needs_human_review: bool
    timestamp: str
    agent_history: List[str]
