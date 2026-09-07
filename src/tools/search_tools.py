"""Web search tools for gathering research information."""

from typing import List, Dict, Any
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
import os


@tool
def web_search(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search the web for information on a given query.
    
    Args:
        query: The search query string
        max_results: Maximum number of results to return (default: 5)
        
    Returns:
        List of search results with url, title, and content
    """
    try:
        search = TavilySearchResults(
            max_results=max_results,
            search_depth="basic",
            include_answer=False,
            include_raw_content=False
        )
        results = search.invoke(query)
        return results
    except Exception as e:
        print(f"Error in web_search: {e}")
        return []


@tool
def deep_search(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Perform a deep search with more comprehensive results.
    
    This search goes deeper and returns more detailed information,
    including raw content from pages.
    
    Args:
        query: The search query string
        max_results: Maximum number of results to return (default: 10)
        
    Returns:
        List of detailed search results with url, title, content, and raw_content
    """
    try:
        search = TavilySearchResults(
            max_results=max_results,
            search_depth="advanced",
            include_answer=True,
            include_raw_content=True,
            include_domains=[],
            exclude_domains=[]
        )
        results = search.invoke(query)
        return results
    except Exception as e:
        print(f"Error in deep_search: {e}")
        return []


@tool
def search_with_domains(
    query: str, 
    include_domains: List[str] = None,
    exclude_domains: List[str] = None,
    max_results: int = 5
) -> List[Dict[str, Any]]:
    """Search with domain filtering.
    
    Args:
        query: The search query string
        include_domains: List of domains to include (e.g., ['wikipedia.org', 'arxiv.org'])
        exclude_domains: List of domains to exclude
        max_results: Maximum number of results to return
        
    Returns:
        List of filtered search results
    """
    try:
        search = TavilySearchResults(
            max_results=max_results,
            search_depth="advanced",
            include_domains=include_domains or [],
            exclude_domains=exclude_domains or []
        )
        results = search.invoke(query)
        return results
    except Exception as e:
        print(f"Error in search_with_domains: {e}")
        return []
