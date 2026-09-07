"""Report Writer Agent - Generates professional markdown reports."""

from typing import Dict, Any, List
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.state.schema import ResearchState
import os


def create_report_writer_agent():
    """Create the report writer agent node.

    This agent generates reports section-by-section via multiple LLM calls so
    each section gets the model's full attention and the combined output is
    reliably long and detailed — this is what makes genuinely in-depth reports
    possible from a small/fast model.

    Deep mode:    5 LLM calls → ~3500-4500 words
    Medium mode:  4 LLM calls → ~2200-2800 words
    Shallow mode: 2 LLM calls → ~1200-1500 words

    Returns:
        A function that processes the research state and returns updated state
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0.3,
        max_tokens=8192
    )

    def _invoke(system_content: str, human_content: str) -> str:
        """Helper: single LLM call, returns text."""
        return llm.invoke([
            SystemMessage(content=system_content),
            HumanMessage(content=human_content),
        ]).content

    def report_writer_node(state: ResearchState) -> Dict[str, Any]:
        """Generate final research report via section-by-section LLM calls.

        Args:
            state: Current research state with all gathered information

        Returns:
            Updated state with final report
        """
        query = state["query"]
        synthesized_content = state.get("synthesized_content", "")
        verified_facts = state.get("verified_facts", [])
        key_insights = state.get("key_insights", [])
        sources = state["sources"]
        strategy = state.get("strategy", {})
        analysis_depth = strategy.get("analysis_depth", "medium")

        print(f"\n📝 [Report Writer Agent] Generating research report (depth={analysis_depth})")

        if not synthesized_content and not verified_facts:
            print("⚠️  No content available for report")
            return {
                "final_report": "# Research Report\n\nNo content available.",
                "current_agent": "report_writer",
                "messages": [HumanMessage(content="Report generation failed - no content available")]
            }

        # ── Build supplementary reference blocks ─────────────────────────────
        facts_block = ""
        if verified_facts:
            verified_count = sum(1 for f in verified_facts if f.get("verified", False))
            facts_block = f"VERIFIED FACTS ({verified_count}/{len(verified_facts)} verified):\n"
            for i, fact in enumerate(verified_facts[:40], 1):
                status = "✓" if fact.get("verified", False) else "○"
                conf = fact.get("confidence", 0.0)
                facts_block += f"{i}. {status} {fact['claim']} (confidence: {conf:.2f})\n"

        insights_block = ""
        if key_insights:
            insights_block = f"KEY INSIGHTS ({len(key_insights)} items):\n"
            for insight in key_insights[:30]:
                insights_block += f"- {insight}\n"

        # Numbered source list for inline citation in report
        sources_block = "AVAILABLE SOURCES (use [n] for inline citations):\n"
        for i, source in enumerate(sources[:40], 1):
            sources_block += f"[{i}] {source['title']} — {source['url']}\n"

        # ── Shared writer persona ─────────────────────────────────────────────
        writer_persona = (
            "You are a professional research report writer producing an in-depth "
            "document that domain experts will read and rely on. Write in full, "
            "substantive paragraphs — never collapse prose into bullets. Be specific: "
            "real statistics, expert names, dates, study titles. Cite every significant "
            "claim with an inline [n] number matching the source list. Depth, rigour, "
            "and completeness are the goal — never abbreviate or rush a section."
        )

        # ── Shared context block passed to every section call ─────────────────
        research_context = f"""Research Query: {query}

SYNTHESIZED RESEARCH CONTENT:
{synthesized_content}

{facts_block}
{insights_block}
{sources_block}"""

        # ═════════════════════════════════════════════════════════════════════
        # DEEP MODE — 5 focused passes
        # ═════════════════════════════════════════════════════════════════════
        if analysis_depth == "deep":
            report_parts: List[str] = []

            # Pass 1: Title + Executive Summary + Background
            print("   Section 1/5: Title, Executive Summary, Background")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

Write ONLY the opening of a comprehensive, in-depth research report. Stop after "Background & Context".

# [A descriptive, topic-specific title reflecting the actual content]

## Executive Summary
Write 4-5 full paragraphs (NOT bullet points) covering: what this report examines and why the topic matters; the most important findings and what they reveal; the key implications; and what the reader will take away. Each paragraph must be substantive and information-dense.

## Background & Context
Write 3-4 full paragraphs: historical background and evolution; essential definitions and concepts (explained thoroughly, not just named); the current landscape — what is established, what is debated, what has shifted recently. Use specific dates, names, and figures. Cite sources with [n]."""))

            # Pass 2: Thematic sections 1-2
            print("   Section 2/5: Thematic analysis (part 1)")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The report's opening (Executive Summary + Background) is already written.
Write the FIRST TWO major thematic analysis sections. Do not write a title, summary, or any later sections.

Each section must:
- Have a ## heading naming a specific theme (not generic labels)
- Contain at least 4 full paragraphs of substantive analysis
- Include specific statistics, named expert positions, study citations, and inline [n] references
- Analyse significance — explain what the evidence means, not just what it says
- Use ### sub-headings where a theme has distinct sub-components

Choose the two most important themes for comprehensive coverage of: {query}"""))

            # Pass 3: Thematic sections 3-4
            print("   Section 3/5: Thematic analysis (part 2)")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The Executive Summary, Background, and the first two thematic sections are already written.
Write TWO MORE major thematic analysis sections covering DIFFERENT aspects than the obvious primary ones — secondary themes, challenges, controversies, comparisons, or future-facing angles.

Each section must:
- Have a ## heading naming a specific theme (not generic labels)
- Contain at least 3-4 full paragraphs of substantive analysis with inline [n] citations
- Bring in specific evidence and explain its significance
- Avoid repeating points already covered

Themes should deepen and broaden coverage of: {query}"""))

            # Pass 4: Analysis & Discussion + Key Findings
            print("   Section 4/5: Analysis and Key Findings")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The opening and four thematic sections are already written. Write ONLY these two sections:

## Analysis & Discussion
Write 3-4 paragraphs of high-level synthesis: What overarching patterns emerge across all the evidence? Where do experts or studies disagree, and what explains the tension? What is the balance of evidence pointing toward? What gaps or uncertainties remain? Take a clear, evidence-grounded analytical position.

## Key Findings
Write a numbered list of 15-20 findings. Each must be a COMPLETE SENTENCE with supporting context (not a short label), specific (numbers, names, dates where possible), and followed by an inline [n] citation. Example: "Global adoption of X reached 47% in 2023, up from 12% in 2019, driven primarily by cost reductions [4]." """))

            # Pass 5: Implications + Conclusion + References
            print("   Section 5/5: Implications, Conclusion, References")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The main body of the report is written. Write ONLY the closing sections:

## Implications & Future Directions
Write 3-4 full paragraphs (NOT bullets): what the findings mean for practitioners, researchers, policymakers, or the public; near-term implications worth acting on now; long-term trajectories; and the open questions the field still needs to resolve.

## Conclusion
Write 2-3 substantive paragraphs synthesising the overall picture — the report's central message — and leaving the reader with clear, memorable takeaways. Do not merely re-list findings.

## References
{sources_block}

List only the sources actually cited in the report, as a numbered reference list.
Format: [n] Title — URL"""))

            final_report = "\n\n".join(report_parts)

        # ═════════════════════════════════════════════════════════════════════
        # MEDIUM MODE — 4 focused passes
        # ═════════════════════════════════════════════════════════════════════
        elif analysis_depth == "medium":
            report_parts = []

            # Pass 1: Title + Executive Summary + Background
            print("   Section 1/4: Title, Executive Summary, Background")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

Write ONLY the opening of a thorough research report. Stop after "Background & Context".

# [A descriptive, specific title]

## Executive Summary
3 full paragraphs (no bullets): what was researched, the main findings, and their significance.

## Background & Context
2 paragraphs of essential context: key definitions, why the topic matters now, and current relevance. Cite with [n]."""))

            # Pass 2: Thematic sections
            print("   Section 2/4: Thematic analysis")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The Executive Summary and Background are already written.
Write 3 thematic analysis sections. Each must have a ## heading specific to the topic and at least 3 full paragraphs of substantive analysis with specific evidence and inline [n] citations. Use ### sub-headings where useful. Cover the most important aspects of: {query}"""))

            # Pass 3: Analysis + Key Findings
            print("   Section 3/4: Analysis and Key Findings")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The opening and thematic sections are already written. Write ONLY:

## Analysis & Discussion
2-3 paragraphs of synthesis: patterns across the evidence, points of disagreement, and what the balance of evidence suggests.

## Key Findings
10-15 findings as complete sentences with specific data and inline [n] citations — full informative sentences, not labels."""))

            # Pass 4: Conclusion + References
            print("   Section 4/4: Conclusion and References")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The main body is written. Write ONLY the closing sections:

## Conclusion
2 substantive paragraphs synthesising the overall picture and key takeaways. Do not just re-list findings.

## References
{sources_block}

List all cited sources as a numbered reference list.
Format: [n] Title — URL"""))

            final_report = "\n\n".join(report_parts)

        # ═════════════════════════════════════════════════════════════════════
        # SHALLOW MODE — 2 focused passes
        # ═════════════════════════════════════════════════════════════════════
        else:
            report_parts = []

            # Pass 1: Title + Summary + Topic areas
            print("   Section 1/2: Title, Summary, Topic areas")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

Write the opening of a focused research report. Stop after the topic-area sections.

# [Descriptive, specific title]

## Summary
2-3 substantive paragraphs: what the topic is, what is known, and why it matters. Full paragraphs, no bullets.

## [Key Topic Area 1 — name it specifically]
2 paragraphs covering the most important facts with specific evidence and [n] citations.

## [Key Topic Area 2 — name it specifically]
2 paragraphs with specific evidence and citations."""))

            # Pass 2: Takeaways + References
            print("   Section 2/2: Key Takeaways and References")
            report_parts.append(_invoke(writer_persona, f"""{research_context}

The opening sections are already written. Write ONLY:

## Key Takeaways
8-10 takeaways as complete sentences with brief supporting context and [n] citations — not one-line labels.

## References
{sources_block}

List cited sources as: [n] Title — URL"""))

            final_report = "\n\n".join(report_parts)

        print(f"✅ Report generated ({len(final_report)} characters)")

        return {
            "final_report": final_report,
            "current_agent": "report_writer",
            "messages": [HumanMessage(content=f"Report generation complete. Generated {len(final_report)} characters.")]
        }

    return report_writer_node
