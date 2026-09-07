"""Main LangGraph workflow for multi-agent research system."""

from typing import Dict, Any
from langgraph.graph import StateGraph, END
from src.state.schema import ResearchState
from src.agents.web_search import create_web_search_agent
from src.agents.analysis import create_analysis_agent
from src.agents.synthesis import create_synthesis_agent
from src.agents.fact_checker import create_fact_checker_agent
from src.agents.report_writer import create_report_writer_agent
from datetime import datetime


def _route_after_synthesis(state: Dict[str, Any]) -> str:
    """Route from synthesis to either fact_checker or report_writer.

    In basic mode the user can disable fact-checking via options.  The strategy
    (populated from user options by the service layer) is the source of truth.
    """
    strategy = state.get("strategy", {})
    if strategy.get("requires_fact_check", False):
        return "fact_checker"
    return "report_writer"


def create_research_workflow():
    """Create the main research workflow graph.

    Sequential pipeline (basic mode):
    1. Web Search Agent   — gathers sources
    2. Analysis Agent     — extracts facts and insights
    3. Synthesis Agent    — combines information
    4. Fact-Checking Agent — verifies claims (skipped when requires_fact_check=False)
    5. Report Writer Agent — generates final report

    Returns:
        Compiled LangGraph application ready for execution
    """
    # Initialize the state graph
    workflow = StateGraph(ResearchState)

    # Add agent nodes
    workflow.add_node("web_search", create_web_search_agent())
    workflow.add_node("analysis", create_analysis_agent())
    workflow.add_node("synthesis", create_synthesis_agent())
    workflow.add_node("fact_checker", create_fact_checker_agent())
    workflow.add_node("report_writer", create_report_writer_agent())

    # Define the workflow edges (sequential flow)
    workflow.set_entry_point("web_search")
    workflow.add_edge("web_search", "analysis")
    workflow.add_edge("analysis", "synthesis")

    # Conditionally skip fact-checking based on strategy
    workflow.add_conditional_edges(
        "synthesis",
        _route_after_synthesis,
        {
            "fact_checker": "fact_checker",
            "report_writer": "report_writer",
        }
    )

    workflow.add_edge("fact_checker", "report_writer")
    workflow.add_edge("report_writer", END)

    # Compile the graph
    app = workflow.compile()

    return app


def run_research(query: str, verbose: bool = True) -> str:
    """Execute research workflow for a given query.
    
    This is the main entry point for running research. It initializes
    the state, executes the workflow, and returns the final report.
    
    Args:
        query: The research topic or question
        verbose: Whether to print progress messages (default: True)
        
    Returns:
        The final research report as a markdown string
        
    Example:
        >>> report = run_research("What is quantum computing?")
        >>> print(report)
    """
    if verbose:
        print("=" * 80)
        print(f"🚀 Starting Multi-Agent Research System")
        print(f"📋 Query: {query}")
        print("=" * 80)
    
    # Create the workflow
    app = create_research_workflow()
    
    # Initialize state
    initial_state: ResearchState = {
        "query": query,
        "research_goals": [],
        "subtasks": [],
        "sources": [],
        "extracted_facts": [],
        "key_insights": [],
        "synthesized_content": "",
        "verified_facts": [],
        "final_report": None,
        "messages": [],
        "current_agent": "",
        "iteration": 0,
        "needs_human_review": False,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Run the workflow
        result = app.invoke(initial_state)
        
        if verbose:
            print("\n" + "=" * 80)
            print("✅ Research Complete!")
            print("=" * 80)
        
        return result.get("final_report", "Error: No report generated")
        
    except Exception as e:
        error_msg = f"Error during research: {str(e)}"
        if verbose:
            print(f"\n❌ {error_msg}")
        return error_msg


def run_research_with_streaming(query: str):
    """Execute research workflow with streaming output.
    
    This version streams events as they happen, allowing you to see
    real-time progress of each agent.
    
    Args:
        query: The research topic or question
        
    Yields:
        State updates from each agent as they complete
        
    Example:
        >>> for event in run_research_with_streaming("AI ethics"):
        ...     print(f"Agent: {event.get('current_agent')}")
    """
    print("=" * 80)
    print(f"🚀 Starting Multi-Agent Research System (Streaming Mode)")
    print(f"📋 Query: {query}")
    print("=" * 80)
    
    app = create_research_workflow()
    
    initial_state: ResearchState = {
        "query": query,
        "research_goals": [],
        "subtasks": [],
        "sources": [],
        "extracted_facts": [],
        "key_insights": [],
        "synthesized_content": "",
        "verified_facts": [],
        "final_report": None,
        "messages": [],
        "current_agent": "",
        "iteration": 0,
        "needs_human_review": False,
        "timestamp": datetime.now().isoformat()
    }
    
    # Stream events
    for event in app.stream(initial_state):
        yield event
    
    print("\n" + "=" * 80)
    print("✅ Research Complete!")
    print("=" * 80)
