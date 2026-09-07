"""Enhanced workflow with intelligent orchestration."""

from typing import Dict, Any
from langgraph.graph import StateGraph, END
from src.state.enhanced_schema import EnhancedResearchState
from src.agents.web_search import create_web_search_agent
from src.agents.analysis import create_analysis_agent
from src.agents.synthesis import create_synthesis_agent
from src.agents.fact_checker import create_fact_checker_agent
from src.agents.report_writer import create_report_writer_agent
from src.orchestrator.coordinator import create_coordinator_agent, route_next_agent
from src.orchestrator.quality_control import prioritize_sources
from datetime import datetime


def create_enhanced_research_workflow():
    """Create enhanced research workflow with intelligent orchestration.
    
    This workflow includes:
    - Intelligent query analysis and strategy selection
    - Quality-based adaptive routing
    - Iterative refinement loops
    - Source credibility scoring
    
    Returns:
        Compiled LangGraph application
    """
    # Initialize the state graph
    workflow = StateGraph(EnhancedResearchState)
    
    # Add coordinator agent
    workflow.add_node("coordinator", create_coordinator_agent())
    
    # Add research agents with quality enhancements
    workflow.add_node("web_search", create_enhanced_web_search_agent())
    workflow.add_node("analysis", create_analysis_agent())
    workflow.add_node("synthesis", create_synthesis_agent())
    workflow.add_node("fact_checker", create_fact_checker_agent())
    workflow.add_node("report_writer", create_report_writer_agent())
    
    # Set entry point
    workflow.set_entry_point("coordinator")
    
    # Add conditional routing based on orchestrator decisions
    workflow.add_conditional_edges(
        "coordinator",
        route_next_agent,
        {
            "web_search": "web_search",
            "analysis": "analysis",
            "synthesis": "synthesis",
            "fact_checker": "fact_checker",
            "report_writer": "report_writer",
            "END": END
        }
    )
    
    # Route from each agent back to coordinator for quality assessment
    workflow.add_edge("web_search", "coordinator")
    workflow.add_edge("analysis", "coordinator")
    workflow.add_edge("synthesis", "coordinator")
    workflow.add_edge("fact_checker", "coordinator")
    workflow.add_edge("report_writer", END)
    
    # Compile the graph
    app = workflow.compile()
    
    return app


def create_enhanced_web_search_agent():
    """Create enhanced web search agent with credibility scoring."""
    base_agent = create_web_search_agent()
    
    def enhanced_search_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced web search with source prioritization."""
        # Run base search
        result = base_agent(state)
        
        # Get strategy to determine max sources
        strategy = state.get("strategy", {})
        max_sources = strategy.get("max_sources", 15)
        
        # Prioritize sources by credibility
        if result.get("sources"):
            sources = prioritize_sources(result["sources"])
            # Limit to max sources from strategy
            result["sources"] = sources[:max_sources]
            
            print(f"📊 Source credibility scores:")
            for i, source in enumerate(result["sources"][:5], 1):
                score = source.get("credibility_score", 0.5)
                print(f"   {i}. {source['title'][:50]}... (Score: {score:.2f})")
        
        return result
    
    return enhanced_search_node


def run_enhanced_research(query: str, verbose: bool = True) -> str:
    """Execute enhanced research workflow with intelligent orchestration.
    
    Args:
        query: The research topic or question
        verbose: Whether to print progress messages (default: True)
        
    Returns:
        The final research report as a markdown string
    """
    if verbose:
        print("=" * 80)
        print(f"🚀 Starting Enhanced Multi-Agent Research System")
        print(f"📋 Query: {query}")
        print("=" * 80)
    
    # Create the enhanced workflow
    app = create_enhanced_research_workflow()
    
    # Initialize state
    initial_state: EnhancedResearchState = {
        "query": query,
        "query_type": "",
        "complexity": "",
        "research_goals": [],
        "subtasks": [],
        "strategy": {
            "type": "overview",
            "max_sources": 15,
            "search_depth": "basic",
            "analysis_depth": "medium",
            "requires_fact_check": True,
            "requires_iteration": False
        },
        "sources": [],
        "extracted_facts": [],
        "key_insights": [],
        "synthesized_content": "",
        "verified_facts": [],
        "quality_metrics": {
            "source_diversity": 0.0,
            "content_depth": 0.0,
            "fact_confidence": 0.0,
            "citation_coverage": 0.0,
            "overall_quality": 0.0
        },
        "final_report": None,
        "messages": [],
        "current_agent": "",
        "iteration": 0,
        "max_iterations": 2,
        "needs_refinement": False,
        "needs_additional_search": False,
        "needs_human_review": False,
        "timestamp": datetime.now().isoformat(),
        "agent_history": []
    }
    
    try:
        # Run the workflow
        result = app.invoke(initial_state)
        
        if verbose:
            print("\n" + "=" * 80)
            print("✅ Enhanced Research Complete!")
            print("=" * 80)
            
            # Print final quality metrics
            if result.get("quality_metrics"):
                from src.orchestrator.quality_control import print_quality_report
                print_quality_report(result["quality_metrics"])
        
        return result.get("final_report", "Error: No report generated")
        
    except Exception as e:
        error_msg = f"Error during research: {str(e)}"
        if verbose:
            print(f"\n❌ {error_msg}")
        return error_msg


def run_enhanced_research_with_streaming(query: str):
    """Execute enhanced research with streaming output.
    
    Args:
        query: The research topic or question
        
    Yields:
        State updates from each agent as they complete
    """
    print("=" * 80)
    print(f"🚀 Starting Enhanced Multi-Agent Research System (Streaming Mode)")
    print(f"📋 Query: {query}")
    print("=" * 80)
    
    app = create_enhanced_research_workflow()
    
    initial_state: EnhancedResearchState = {
        "query": query,
        "query_type": "",
        "complexity": "",
        "research_goals": [],
        "subtasks": [],
        "strategy": {
            "type": "overview",
            "max_sources": 15,
            "search_depth": "basic",
            "analysis_depth": "medium",
            "requires_fact_check": True,
            "requires_iteration": False
        },
        "sources": [],
        "extracted_facts": [],
        "key_insights": [],
        "synthesized_content": "",
        "verified_facts": [],
        "quality_metrics": {
            "source_diversity": 0.0,
            "content_depth": 0.0,
            "fact_confidence": 0.0,
            "citation_coverage": 0.0,
            "overall_quality": 0.0
        },
        "final_report": None,
        "messages": [],
        "current_agent": "",
        "iteration": 0,
        "max_iterations": 2,
        "needs_refinement": False,
        "needs_additional_search": False,
        "needs_human_review": False,
        "timestamp": datetime.now().isoformat(),
        "agent_history": []
    }
    
    # Stream events
    for event in app.stream(initial_state):
        yield event
    
    print("\n" + "=" * 80)
    print("✅ Enhanced Research Complete!")
    print("=" * 80)
