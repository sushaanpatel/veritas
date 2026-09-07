"""Web Search Agent - Gathers information from multiple sources."""

from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.state.schema import ResearchState, Source
from src.tools.search_tools import web_search, deep_search
import os


def create_web_search_agent():
    """Create the web search agent node.
    
    This agent is responsible for:
    - Generating diverse search queries from the research topic
    - Executing web searches using Tavily API
    - Collecting and organizing sources
    - Filtering for relevance and quality
    
    Returns:
        A function that processes the research state and returns updated state
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0,
        max_tokens=4096
    )
    
    def web_search_node(state: ResearchState) -> Dict[str, Any]:
        """Execute web search based on research query.

        Behaviour is driven by the strategy stored in state:
        - search_depth "advanced" → deep_search for every query (more content, raw pages)
        - search_depth "basic"    → web_search for all queries (faster, lighter)
        - max_sources controls how many results we keep in total
        - more queries are generated for advanced searches

        Args:
            state: Current research state containing the query

        Returns:
            Updated state with sources added
        """
        query = state["query"]
        strategy = state.get("strategy", {})
        search_depth = strategy.get("search_depth", "basic")
        max_sources = strategy.get("max_sources", 10)

        # Number of search queries scales with how deep we want to go
        if search_depth == "advanced":
            num_queries = 9
            results_per_query = 10
        else:
            num_queries = 5
            results_per_query = 6

        print(f"\n🔍 [Web Search Agent] Starting {'deep' if search_depth == 'advanced' else 'basic'} "
              f"search (max_sources={max_sources}) for: {query}")

        # Generate diverse search queries — request more when doing a deep search
        system_msg = SystemMessage(content=f"""You are a research intelligence specialist who designs search strategies to maximise coverage of a topic.

Generate exactly {num_queries} search queries that together will provide comprehensive coverage of the research topic. Each query must target a distinct angle — do not generate variations of the same question.

Cover these angles across your queries (not necessarily one each):
1. Broad overview / definition — what it is and why it matters
2. Latest developments and current news (include "2024" or "2025" in at least one query)
3. Key statistics, data, and quantitative evidence
4. Expert analysis, academic research, or authoritative reports
5. Practical applications or real-world examples
6. Challenges, criticisms, or controversies
7. Comparisons, alternatives, or competing approaches (if applicable)
8. Future outlook, projections, or emerging trends

Query craft rules:
- Use precise, specific language — avoid generic queries that return noise
- Mix different query styles: some factual ("what is X"), some comparative ("X vs Y"), some data-focused ("X statistics 2024"), some expert-focused ("expert analysis X")
- Include domain-specific terminology where relevant
- The first query should be the broadest and most important

Format: Return ONLY the queries, one per line, no numbering, no bullets, no explanations.""")

        response = llm.invoke([
            system_msg,
            HumanMessage(content=f"Generate {num_queries} search queries for: {query}")
        ])

        # Parse search queries
        search_queries = [q.strip() for q in response.content.split('\n') if q.strip()]
        print(f"📝 Generated {len(search_queries)} search queries")

        # Execute searches
        sources = []
        seen_urls = set()

        for i, search_query in enumerate(search_queries[:num_queries], 1):
            print(f"   Query {i}: {search_query[:60]}...")

            try:
                if search_depth == "advanced":
                    # Use deep_search (search_depth="advanced", raw content) for all queries
                    results = deep_search.invoke(search_query)
                else:
                    # Use basic web_search for lightweight mode
                    results = web_search.invoke(search_query)

                for result in results[:results_per_query]:
                    url = result.get("url", "")

                    # Skip duplicates
                    if url in seen_urls:
                        continue
                    seen_urls.add(url)

                    # Create source entry
                    source: Source = {
                        "url": url,
                        "title": result.get("title", "Untitled"),
                        "content": result.get("content", ""),
                        "author": None,
                        "date": None,
                        "credibility_score": 0.8  # Default score; enhanced workflow re-scores
                    }
                    sources.append(source)

                # Stop early if we already have enough sources
                if len(sources) >= max_sources * 1.5:
                    print(f"   ℹ️  Collected sufficient sources, stopping early")
                    break

            except Exception as e:
                print(f"   ⚠️  Error searching '{search_query[:40]}...': {e}")
                continue

        # Trim to the requested maximum
        sources = sources[:max_sources]
        print(f"✅ Found {len(sources)} unique sources")

        return {
            "sources": sources,
            "current_agent": "web_search",
            "messages": [HumanMessage(content=f"Web search complete. Found {len(sources)} sources.")]
        }
    
    return web_search_node
