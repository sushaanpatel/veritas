"""Analysis Agent - Extracts key facts and insights from sources."""

from typing import Dict, Any, List
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.state.schema import ResearchState, Fact
import os
import re


def create_analysis_agent():
    """Create the analysis agent node.
    
    This agent is responsible for:
    - Reading and comprehending collected sources
    - Extracting key facts, statistics, and claims
    - Identifying patterns and trends
    - Generating structured insights
    
    Returns:
        A function that processes the research state and returns updated state
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0,
        max_tokens=8192
    )
    
    def analysis_node(state: ResearchState) -> Dict[str, Any]:
        """Analyze sources and extract key facts and insights.
        
        Args:
            state: Current research state containing sources
            
        Returns:
            Updated state with extracted facts and insights
        """
        sources = state["sources"]
        query = state["query"]
        strategy = state.get("strategy", {})
        analysis_depth = strategy.get("analysis_depth", "medium")

        print(f"\n🔬 [Analysis Agent] Analyzing {len(sources)} sources (depth={analysis_depth})")

        if not sources:
            print("⚠️  No sources to analyze")
            return {
                "extracted_facts": [],
                "key_insights": [],
                "current_agent": "analysis",
                "messages": [HumanMessage(content="No sources available for analysis")]
            }

        # Scale content consumption with analysis depth.
        # These limits feed the synthesis + report stages — generous ceilings
        # here are what make genuinely in-depth output possible downstream.
        if analysis_depth == "deep":
            max_sources_to_analyse = min(len(sources), 35)
            chars_per_source = 2800
            max_total_chars = 60000
        elif analysis_depth == "shallow":
            max_sources_to_analyse = min(len(sources), 15)
            chars_per_source = 1200
            max_total_chars = 16000
        else:  # medium
            max_sources_to_analyse = min(len(sources), 22)
            chars_per_source = 1800
            max_total_chars = 32000

        # Combine source content
        combined_content = ""
        for i, source in enumerate(sources[:max_sources_to_analyse], 1):
            content_preview = source['content'][:chars_per_source]
            combined_content += f"\n\n--- Source {i}: {source['title']} ---\n{content_preview}"

        # Hard cap on total characters
        if len(combined_content) > max_total_chars:
            combined_content = combined_content[:max_total_chars] + "\n\n[Content truncated...]"

        # Depth-specific extraction instructions
        if analysis_depth == "deep":
            extraction_instructions = """Extract as many verifiable facts as possible — aim for 35 to 50.

Actively seek out and extract ALL of the following:
- Specific statistics, percentages, quantities, and measurements with their context
- Named expert opinions, quotes, or positions (include expert name and affiliation if present)
- Causal relationships ("X causes Y", "X led to Z")
- Comparative data (X is larger/faster/cheaper than Y by N%)
- Temporal data: dates, timelines, rates of change
- Methodological details: how a study was conducted, sample size, confidence intervals
- Contradictions or direct disagreements between sources — flag these explicitly
- Historical background facts that provide context
- Definitions of key technical concepts or terms

INSIGHT instructions: extract 12–20 high-level patterns, themes, or conclusions that emerge from looking across multiple facts. Insights should be analytical observations, not just restatements of individual facts."""

        elif analysis_depth == "shallow":
            extraction_instructions = """Extract the 12–15 most important facts a reader must know to understand this topic.

Focus on:
- The single most significant statistic or data point per major angle
- The dominant expert consensus or most authoritative position
- The most impactful trends and developments

INSIGHT instructions: extract 6–8 high-level takeaways that capture the essential story."""

        else:
            extraction_instructions = """Extract 20–28 key facts covering all significant angles of the topic.

Prioritise:
- Quantitative data: statistics, percentages, measurements with context
- Named expert opinions or institutional positions
- Clear causal or comparative relationships
- Important trends and their drivers
- Notable contradictions or debates between sources (extract one fact for each side)

INSIGHT instructions: extract 10–15 analytical observations that connect multiple facts or identify patterns."""

        system_msg = SystemMessage(content=f"""You are an expert research analyst with a mandate to extract maximum value from source material.

Your task is to extract every significant fact and insight from the provided sources, formatted precisely so a downstream synthesis agent can use them directly.

EXTRACTION FORMAT — use exactly this structure for each fact:
FACT: [A complete, specific, self-contained claim. Include numbers, names, dates, and context so the fact stands alone without needing the source.]
SOURCES: [Source numbers that support this fact, e.g., 1,3,5]
CONFIDENCE: [0.0–1.0, where 1.0 = explicitly stated in source, 0.7 = strongly implied, 0.5 = indirect inference]
REASONING: [One sentence explaining why this fact is credible and what evidence supports it]

INSIGHT FORMAT:
INSIGHT: [An analytical observation, pattern, or conclusion that emerges from looking across multiple facts — not a restatement of a single fact]

{extraction_instructions}

Quality standards:
- FACTS must be specific and falsifiable — "X increased significantly" is not a fact; "X increased by 34% in 2023" is a fact
- CONFIDENCE must reflect the actual strength of evidence — do not inflate scores
- REASONING must reference specific evidence, not just say "supported by sources"
- Extract contradictions and disagreements as separate facts (one per position) — these are valuable
- Do not duplicate: if the same claim appears in multiple sources, extract it once with all source numbers listed
- Be comprehensive: it is better to over-extract than under-extract""")


        response = llm.invoke([
            system_msg,
            HumanMessage(content=f"""Research Query: {query}

Sources ({max_sources_to_analyse} sources, up to {chars_per_source} chars each):
{combined_content}

Extract every significant fact and insight from these sources. Be thorough — missing an important fact here means it will be absent from the final report. Aim for the maximum number of high-quality extractions specified in your instructions.""")
        ])
        
        # Parse response into facts and insights
        facts: List[Fact] = []
        insights: List[str] = []
        
        lines = response.content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if line.startswith('FACT:'):
                # Extract fact details
                fact_claim = line.replace('FACT:', '').strip()
                source_urls = []
                confidence = 0.7
                reasoning = ""
                
                # Look for SOURCES, CONFIDENCE, REASONING on next lines
                j = i + 1
                while j < len(lines) and j < i + 5:
                    next_line = lines[j].strip()
                    if next_line.startswith('SOURCES:'):
                        # Extract source numbers and map to URLs
                        source_nums = re.findall(r'\d+', next_line)
                        for num in source_nums:
                            idx = int(num) - 1
                            if 0 <= idx < len(sources):
                                source_urls.append(sources[idx]['url'])
                    elif next_line.startswith('CONFIDENCE:'):
                        try:
                            conf_str = re.search(r'[\d.]+', next_line)
                            if conf_str:
                                confidence = float(conf_str.group())
                        except:
                            pass
                    elif next_line.startswith('REASONING:'):
                        reasoning = next_line.replace('REASONING:', '').strip()
                    elif next_line.startswith(('FACT:', 'INSIGHT:')):
                        break
                    j += 1
                
                if fact_claim:
                    facts.append({
                        "claim": fact_claim,
                        "source_urls": source_urls if source_urls else [sources[0]['url']],
                        "confidence": confidence,
                        "verified": False,
                        "reasoning": reasoning
                    })
                
                i = j - 1
                
            elif line.startswith('INSIGHT:'):
                insight = line.replace('INSIGHT:', '').strip()
                if insight:
                    insights.append(insight)
            
            i += 1
        
        print(f"✅ Extracted {len(facts)} facts and {len(insights)} insights")
        
        return {
            "extracted_facts": facts,
            "key_insights": insights,
            "current_agent": "analysis",
            "messages": [HumanMessage(content=f"Analysis complete. Extracted {len(facts)} facts and {len(insights)} insights.")]
        }
    
    return analysis_node
