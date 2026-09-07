"""Coordinator agent for intelligent research orchestration."""

from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.orchestrator.query_analyzer import analyze_query, create_strategy, print_strategy
from src.orchestrator.quality_control import assess_quality, should_refine, print_quality_report
import os


def create_coordinator_agent():
    """Create the coordinator agent that orchestrates the research workflow.
    
    This agent:
    - Analyzes queries and selects optimal strategies
    - Monitors quality throughout the process
    - Makes decisions about workflow routing
    - Determines when refinement is needed
    
    Returns:
        A function that coordinates the research process
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0,
        max_tokens=4096
    )
    
    def coordinator_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate research workflow based on query and current state.
        
        Args:
            state: Current research state
            
        Returns:
            Updated state with strategy and coordination decisions
        """
        query = state["query"]
        current_agent = state.get("current_agent", "")
        
        # Initial coordination - analyze query and create strategy
        if not current_agent or current_agent == "coordinator":
            print("\n🎯 [Coordinator] Analyzing query and planning research strategy...")

            # Analyze the query
            analysis = analyze_query(query)

            # Create strategy based on analysis
            strategy = create_strategy(analysis)

            # Apply user-specified options as hard overrides — the user's explicit
            # choices always take priority over the LLM-derived strategy.
            user_options = state.get("user_options", {})
            if user_options:
                if "max_sources" in user_options and user_options["max_sources"] is not None:
                    strategy["max_sources"] = user_options["max_sources"]
                if "search_depth" in user_options and user_options["search_depth"] in ("basic", "advanced"):
                    strategy["search_depth"] = user_options["search_depth"]
                if "analysis_depth" in user_options and user_options["analysis_depth"] in ("shallow", "medium", "deep"):
                    strategy["analysis_depth"] = user_options["analysis_depth"]
                if "requires_fact_check" in user_options and user_options["requires_fact_check"] is not None:
                    strategy["requires_fact_check"] = user_options["requires_fact_check"]
                if "requires_iteration" in user_options and user_options["requires_iteration"] is not None:
                    strategy["requires_iteration"] = user_options["requires_iteration"]

            # Print final (merged) strategy for visibility
            print_strategy(query, analysis, strategy)

            return {
                "query_type": analysis["query_type"],
                "complexity": analysis["complexity"],
                "strategy": strategy,
                "current_agent": "coordinator",
                "iteration": 0,
                "max_iterations": 2 if strategy["requires_iteration"] else 1,
                "needs_refinement": False,
                "needs_additional_search": False,
                "agent_history": ["coordinator"],
                "messages": [HumanMessage(content=f"Strategy created: {strategy['type']}")]
            }
        
        # Mid-process coordination - assess quality and make decisions
        else:
            print(f"\n🎯 [Coordinator] Assessing quality after {current_agent}...")
            
            # Assess current quality
            metrics = assess_quality(state)
            print_quality_report(metrics)
            
            # Store metrics in state
            state["quality_metrics"] = metrics
            
            # Determine if refinement is needed
            needs_refinement = should_refine(state)
            
            # Make routing decisions
            decisions = {
                "needs_refinement": needs_refinement,
                "quality_metrics": metrics
            }
            
            if needs_refinement:
                print("🔄 [Coordinator] Quality below threshold - refinement recommended")
                decisions["iteration"] = state.get("iteration", 0) + 1
            else:
                print("✅ [Coordinator] Quality acceptable - proceeding to next stage")
            
            return decisions
    
    return coordinator_node


def route_next_agent(state: Dict[str, Any]) -> str:
    """Determine which agent should run next based on current state.
    
    This function implements adaptive workflow routing.
    
    Args:
        state: Current research state
        
    Returns:
        Name of the next agent to run
    """
    current = state.get("current_agent", "")
    strategy = state.get("strategy", {})
    
    # Initial routing from coordinator
    if current == "coordinator" and not state.get("sources"):
        return "web_search"
    
    # After web search
    if current == "web_search":
        sources = state.get("sources", [])
        
        # Check if we need more sources
        if len(sources) < 5:
            print("⚠️  [Router] Insufficient sources, running additional search")
            return "web_search"
        
        return "analysis"
    
    # After analysis
    if current == "analysis":
        facts = state.get("extracted_facts", [])
        
        # Check if we got enough facts
        if len(facts) < 3:
            print("⚠️  [Router] Insufficient facts, returning to search")
            return "web_search"
        
        return "synthesis"
    
    # After synthesis
    if current == "synthesis":
        # Check if fact-checking is required by strategy
        if strategy.get("requires_fact_check", True):
            return "fact_checker"
        return "report_writer"
    
    # After fact-checking
    if current == "fact_checker":
        # Check if refinement is needed
        if state.get("needs_refinement", False):
            iteration = state.get("iteration", 0)
            max_iterations = state.get("max_iterations", 2)
            
            if iteration < max_iterations:
                print(f"🔄 [Router] Starting refinement iteration {iteration + 1}/{max_iterations}")
                return "web_search"  # Start refinement loop
        
        return "report_writer"
    
    # After report writing
    if current == "report_writer":
        return "END"
    
    # Default fallback
    return "END"