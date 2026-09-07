"""Quality control and assessment for research orchestration."""

from typing import Dict, Any
from urllib.parse import urlparse
from src.state.enhanced_schema import QualityMetrics, EnhancedResearchState


def assess_quality(state: Dict[str, Any]) -> QualityMetrics:
    """Assess the quality of current research state.
    
    Args:
        state: Current research state
        
    Returns:
        QualityMetrics with various quality scores
    """
    sources = state.get("sources", [])
    facts = state.get("verified_facts", []) or state.get("extracted_facts", [])
    
    metrics: QualityMetrics = {
        "source_diversity": 0.0,
        "content_depth": 0.0,
        "fact_confidence": 0.0,
        "citation_coverage": 0.0,
        "overall_quality": 0.0
    }
    
    if not sources:
        return metrics
    
    # 1. Source Diversity - measure domain diversity
    domains = set()
    for source in sources:
        try:
            domain = urlparse(source["url"]).netloc
            domains.add(domain)
        except:
            pass
    
    metrics["source_diversity"] = min(len(domains) / max(len(sources), 1), 1.0)
    
    # 2. Content Depth - average content length and quality
    if sources:
        total_length = sum(len(s.get("content", "")) for s in sources)
        avg_length = total_length / len(sources)
        # Normalize: 1000+ chars is good depth
        metrics["content_depth"] = min(avg_length / 1000, 1.0)
    
    # 3. Fact Confidence - average confidence of facts
    if facts:
        total_confidence = sum(f.get("confidence", 0.5) for f in facts)
        metrics["fact_confidence"] = total_confidence / len(facts)
    
    # 4. Citation Coverage - percentage of facts with citations
    if facts:
        cited_facts = sum(1 for f in facts if f.get("source_urls"))
        metrics["citation_coverage"] = cited_facts / len(facts)
    
    # 5. Overall Quality - weighted combination
    metrics["overall_quality"] = (
        metrics["source_diversity"] * 0.25 +
        metrics["content_depth"] * 0.20 +
        metrics["fact_confidence"] * 0.30 +
        metrics["citation_coverage"] * 0.25
    )
    
    return metrics


def should_refine(state: Dict[str, Any], quality_threshold: float = 0.7) -> bool:
    """Determine if research needs refinement.
    
    Args:
        state: Current research state
        quality_threshold: Minimum acceptable quality score (default: 0.7)
        
    Returns:
        True if refinement is needed
    """
    metrics = assess_quality(state)
    
    # Check if we've hit max iterations
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 2)
    
    if iteration >= max_iterations:
        return False
    
    # Check overall quality
    if metrics["overall_quality"] < quality_threshold:
        return True
    
    # Check specific quality issues
    if metrics["source_diversity"] < 0.3:
        print(f"⚠️  Low source diversity ({metrics['source_diversity']:.2f})")
        return True
    
    if metrics["fact_confidence"] < 0.6:
        print(f"⚠️  Low fact confidence ({metrics['fact_confidence']:.2f})")
        return True
    
    if metrics["citation_coverage"] < 0.5:
        print(f"⚠️  Low citation coverage ({metrics['citation_coverage']:.2f})")
        return True
    
    return False


def should_run_additional_search(state: Dict[str, Any]) -> bool:
    """Determine if additional web search is needed.
    
    Args:
        state: Current research state
        
    Returns:
        True if more sources are needed
    """
    sources = state.get("sources", [])
    strategy = state.get("strategy", {})
    max_sources = strategy.get("max_sources", 15)
    
    # Check if we have enough sources
    if len(sources) < max(5, max_sources * 0.5):
        return True
    
    # Check source diversity
    metrics = assess_quality(state)
    if metrics["source_diversity"] < 0.3:
        return True
    
    # Check content quality
    if metrics["content_depth"] < 0.4:
        return True
    
    return False


def evaluate_source_credibility(source: Dict[str, Any]) -> float:
    """Evaluate credibility of a single source.
    
    Args:
        source: Source dictionary
        
    Returns:
        Credibility score between 0 and 1
    """
    score = 0.5  # Base score
    
    # Domain reputation (simple heuristic)
    url = source.get("url", "")
    domain = urlparse(url).netloc.lower()
    
    # Trusted domains get higher scores
    trusted_domains = [
        "wikipedia.org", "arxiv.org", "nature.com", "science.org",
        "ieee.org", "acm.org", "nih.gov", "gov", "edu",
        "springer.com", "sciencedirect.com", "jstor.org"
    ]
    
    for trusted in trusted_domains:
        if trusted in domain:
            score += 0.3
            break
    
    # Has author
    if source.get("author"):
        score += 0.1
    
    # Has date
    if source.get("date"):
        score += 0.05
    
    # Content length (longer is generally better)
    content_length = len(source.get("content", ""))
    if content_length > 1000:
        score += 0.1
    elif content_length > 500:
        score += 0.05
    
    return min(score, 1.0)


def prioritize_sources(sources: list) -> list:
    """Sort sources by credibility score.
    
    Args:
        sources: List of source dictionaries
        
    Returns:
        Sorted list of sources (highest credibility first)
    """
    for source in sources:
        if "credibility_score" not in source:
            source["credibility_score"] = evaluate_source_credibility(source)
    
    return sorted(sources, key=lambda x: x.get("credibility_score", 0.5), reverse=True)


def print_quality_report(metrics: QualityMetrics):
    """Print quality metrics for user visibility."""
    print("\n" + "="*80)
    print("📊 QUALITY ASSESSMENT")
    print("="*80)
    print(f"Source Diversity:    {metrics['source_diversity']:.2%} {'✅' if metrics['source_diversity'] >= 0.5 else '⚠️'}")
    print(f"Content Depth:       {metrics['content_depth']:.2%} {'✅' if metrics['content_depth'] >= 0.5 else '⚠️'}")
    print(f"Fact Confidence:     {metrics['fact_confidence']:.2%} {'✅' if metrics['fact_confidence'] >= 0.7 else '⚠️'}")
    print(f"Citation Coverage:   {metrics['citation_coverage']:.2%} {'✅' if metrics['citation_coverage'] >= 0.7 else '⚠️'}")
    print(f"\nOverall Quality:     {metrics['overall_quality']:.2%} {'✅' if metrics['overall_quality'] >= 0.7 else '⚠️'}")
    print("="*80 + "\n")
