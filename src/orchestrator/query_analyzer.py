"""Query analyzer for intelligent research strategy selection."""

from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
import os


def analyze_query(query: str) -> Dict[str, Any]:
    """Analyze a research query to determine optimal strategy.
    
    Args:
        query: The research query to analyze
        
    Returns:
        Dictionary containing query analysis:
        - query_type: Type of query (OVERVIEW, TECHNICAL, COMPARATIVE, etc.)
        - complexity: Complexity level (LOW, MEDIUM, HIGH)
        - depth: Required depth (SHALLOW, MEDIUM, DEEP)
        - key_aspects: List of key aspects to research
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0
    )
    
    system_msg = SystemMessage(content="""You are a research strategy expert.
Analyze the given query and classify it according to these dimensions:

QUERY_TYPE (choose one):
- OVERVIEW: General information about a topic
- TECHNICAL: Detailed technical/scientific information
- COMPARATIVE: Comparing multiple things
- HISTORICAL: Historical context and evolution
- SCIENTIFIC: Scientific research and findings
- CONTROVERSIAL: Debated or controversial topics

COMPLEXITY (choose one):
- LOW: Simple, straightforward topic
- MEDIUM: Moderate complexity, some nuance
- HIGH: Complex, multi-faceted topic

DEPTH (choose one):
- SHALLOW: Basic facts and overview sufficient
- MEDIUM: Moderate detail needed
- DEEP: Comprehensive, in-depth research required

Also identify 3-5 KEY_ASPECTS that should be researched.

Format your response as:
QUERY_TYPE: [type]
COMPLEXITY: [level]
DEPTH: [level]
KEY_ASPECTS:
- [aspect 1]
- [aspect 2]
- [aspect 3]""")
    
    response = llm.invoke([
        system_msg,
        HumanMessage(content=f"Analyze this research query: {query}")
    ])
    
    # Parse response
    lines = response.content.split('\n')
    analysis = {
        "query_type": "OVERVIEW",
        "complexity": "MEDIUM",
        "depth": "MEDIUM",
        "key_aspects": []
    }
    
    in_aspects = False
    for line in lines:
        line = line.strip()
        if line.startswith('QUERY_TYPE:'):
            analysis["query_type"] = line.split(':', 1)[1].strip()
        elif line.startswith('COMPLEXITY:'):
            analysis["complexity"] = line.split(':', 1)[1].strip()
        elif line.startswith('DEPTH:'):
            analysis["depth"] = line.split(':', 1)[1].strip()
        elif line.startswith('KEY_ASPECTS:'):
            in_aspects = True
        elif in_aspects and line.startswith('-'):
            aspect = line.lstrip('- ').strip()
            if aspect:
                analysis["key_aspects"].append(aspect)
    
    return analysis


def create_strategy(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Create a research strategy based on query analysis.
    
    Args:
        analysis: Query analysis from analyze_query()
        
    Returns:
        Dictionary containing research strategy configuration
    """
    query_type = analysis["query_type"]
    complexity = analysis["complexity"]
    depth = analysis["depth"]
    
    # Base strategy — use correct schema key names
    strategy = {
        "type": query_type,
        "max_sources": 20,
        "requires_fact_check": True,
        "requires_iteration": False,
        "search_depth": "advanced",
        "analysis_depth": "medium",
    }

    # Adjust based on complexity
    if complexity == "HIGH":
        strategy["max_sources"] = 25
        strategy["requires_iteration"] = True
        strategy["analysis_depth"] = "deep"
    elif complexity == "LOW":
        strategy["max_sources"] = 15
        strategy["analysis_depth"] = "medium"

    # Adjust based on depth
    if depth == "DEEP":
        strategy["max_sources"] = max(strategy["max_sources"], 25)
        strategy["search_depth"] = "advanced"
        strategy["analysis_depth"] = "deep"
        strategy["requires_iteration"] = True
    elif depth == "SHALLOW":
        strategy["max_sources"] = min(strategy["max_sources"], 15)
        strategy["search_depth"] = "basic"
        strategy["analysis_depth"] = "medium"

    # Adjust based on query type
    if query_type == "CONTROVERSIAL":
        strategy["requires_fact_check"] = True
        strategy["requires_iteration"] = True
        strategy["max_sources"] = max(strategy["max_sources"], 22)
    elif query_type in ("TECHNICAL", "SCIENTIFIC"):
        strategy["requires_fact_check"] = True
        strategy["analysis_depth"] = "deep"
    elif query_type == "COMPARATIVE":
        strategy["max_sources"] = max(strategy["max_sources"], 20)
        strategy["analysis_depth"] = "deep"

    return strategy


def print_strategy(query: str, analysis: Dict[str, Any], strategy: Dict[str, Any]) -> None:
    """Print the research strategy in a readable format.
    
    Args:
        query: The research query
        analysis: Query analysis
        strategy: Research strategy
    """
    print("\n" + "="*70)
    print("📋 RESEARCH STRATEGY")
    print("="*70)
    print(f"\nQuery: {query}")
    print(f"\nQuery Type: {analysis['query_type']}")
    print(f"Complexity: {analysis['complexity']}")
    print(f"Depth: {analysis['depth']}")
    
    print(f"\nKey Aspects to Research:")
    for aspect in analysis['key_aspects']:
        print(f"  • {aspect}")
    
    print(f"\nStrategy Configuration:")
    print(f"  • Max Sources: {strategy['max_sources']}")
    print(f"  • Search Depth: {strategy['search_depth']}")
    print(f"  • Analysis Depth: {strategy['analysis_depth']}")
    print(f"  • Fact Checking: {'Yes' if strategy['requires_fact_check'] else 'No'}")
    print(f"  • Iterative Refinement: {'Yes' if strategy['requires_iteration'] else 'No'}")
    print("="*70 + "\n")