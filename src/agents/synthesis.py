"""Synthesis Agent - Combines information into coherent narratives."""

from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.state.schema import ResearchState
import os


def create_synthesis_agent():
    """Create the synthesis agent node.

    This agent is responsible for:
    - Combining insights from multiple sources into rich, detailed prose
    - Resolving conflicting information with nuanced treatment
    - Building coherent multi-section narratives scaled to analysis depth
    - Creating a synthesis rich enough to power a full, in-depth research report

    Generates content in multiple passes so the model never has to compress a
    full synthesis into a single response — each pass gets a fresh token budget.

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

    def synthesis_node(state: ResearchState) -> Dict[str, Any]:
        """Synthesize information from analysis into coherent content.

        For deep mode: three LLM passes (context → findings → analysis/implications).
        For medium mode: two passes (overview/findings → analysis/implications).
        For shallow mode: a single focused call.

        Args:
            state: Current research state containing extracted facts and insights

        Returns:
            Updated state with synthesized content
        """
        facts = state["extracted_facts"]
        insights = state["key_insights"]
        query = state["query"]
        strategy = state.get("strategy", {})
        analysis_depth = strategy.get("analysis_depth", "medium")

        print(f"\n🧩 [Synthesis Agent] Synthesizing information (depth={analysis_depth})")

        if not facts and not insights:
            print("⚠️  No facts or insights to synthesize")
            return {
                "synthesized_content": "",
                "current_agent": "synthesis",
                "messages": [HumanMessage(content="No information available for synthesis")]
            }

        # ── Input scaling — pass as much material to the model as the tier allows ──
        if analysis_depth == "deep":
            facts_limit = min(len(facts), 60)
            insights_limit = min(len(insights), 30)
        elif analysis_depth == "shallow":
            facts_limit = min(len(facts), 20)
            insights_limit = min(len(insights), 12)
        else:  # medium
            facts_limit = min(len(facts), 40)
            insights_limit = min(len(insights), 20)

        facts_text = "\n".join([
            f"- {f['claim']} (confidence: {f['confidence']:.2f})"
            for f in facts[:facts_limit]
        ])
        insights_text = (
            "\n".join([f"- {i}" for i in insights[:insights_limit]])
            if insights else "(none extracted)"
        )

        # ── Common system context ─────────────────────────────────────────────
        writer_role = (
            "You are an expert research synthesizer producing content that will "
            "become the backbone of an in-depth professional research report. Your "
            "output is passed directly to a report writer — make it rich, detailed, "
            "and exhaustive. Write exclusively in full prose paragraphs (no bullet "
            "summaries). Be specific: use real statistics, expert names, study titles, "
            "and dates. Depth and completeness matter far more than brevity — never "
            "compress or abbreviate."
        )

        base_context = f"""Research Query: {query}

Extracted Facts ({len(facts[:facts_limit])} items):
{facts_text}

Key Insights ({len(insights[:insights_limit])} items):
{insights_text}"""

        # ═══ Deep mode: three focused passes ════════════════════════════════
        if analysis_depth == "deep":
            print("   Pass 1/3: Overview + Background")
            part1 = _invoke(
                writer_role,
                f"""{base_context}

Write ONLY the opening of the synthesis — the "Overview" and "Background & Context" sections. Stop after Background.

## Overview
4-5 full paragraphs: what is this topic, why does it matter, what is the current state of knowledge, and what is the scope of what follows? Establish genuine, substantive context with specific data and dates.

## Background & Context
3-4 full paragraphs: historical evolution, foundational concepts (explained, not just named), the key players or schools of thought, and how the landscape has changed recently. This is deep context — be thorough."""
            )

            print("   Pass 2/3: Key Findings (detailed, multi-theme)")
            part2 = _invoke(
                writer_role,
                f"""{base_context}

Write ONLY the "Key Findings" section. The Overview and Background have already been written — do not repeat them.

## Key Findings
Organise the discoveries into 5-7 distinct sub-themes. Give each sub-theme its own ### heading followed by 2-4 full paragraphs of substantive explanation — NOT bullet lists. For every finding: include specific figures, named studies, expert positions, and explain WHY it matters. This is the heart of the report — be exhaustive and specific. Aim for the longest, most detailed section."""
            )

            print("   Pass 3/3: Detailed Analysis + Connections + Implications")
            part3 = _invoke(
                writer_role,
                f"""{base_context}

Write ONLY the final three sections of the synthesis. The Overview, Background, and Key Findings have already been written.

## Detailed Analysis
3-4 paragraphs examining methodology behind key studies, quantitative comparisons, the strength and quality of evidence, and points of expert debate. Be analytical, not descriptive — interpret what the evidence means and how reliable it is.

## Connections & Patterns
3-4 paragraphs: How do the findings fit together? What larger narrative do they form? What trends are driving change? Where do sources agree and disagree — and what explains the tension?

## Implications & Significance
3-4 paragraphs: What do the findings mean in practice? Who is affected and how? What are the near-term and long-term consequences? What important questions remain unanswered?"""
            )

            synthesized_content = part1 + "\n\n" + part2 + "\n\n" + part3

        # ═══ Medium mode: two focused passes ════════════════════════════════
        elif analysis_depth == "medium":
            print("   Pass 1/2: Overview + Key Findings")
            part1 = _invoke(
                writer_role,
                f"""{base_context}

Write ONLY the "Overview" and "Key Findings" sections. Stop after Key Findings.

## Overview
3 full paragraphs establishing what the topic is, why it matters, and the current state of knowledge, with specific data.

## Key Findings
4-5 sub-themes, each a ### heading with 2-3 full paragraphs of explanation. Include specific evidence, statistics, and expert positions. Write in prose, not bullets."""
            )

            print("   Pass 2/2: Analysis + Connections + Implications")
            part2 = _invoke(
                writer_role,
                f"""{base_context}

Write ONLY these final sections. The Overview and Key Findings are already written.

## Detailed Analysis
2-3 paragraphs interpreting the evidence: methodology, quality, and points of debate.

## Connections & Patterns
2 paragraphs: how the findings fit together and what trends emerge.

## Implications & Significance
2-3 paragraphs on practical significance and what the findings mean for relevant stakeholders."""
            )

            synthesized_content = part1 + "\n\n" + part2

        # ═══ Shallow mode: single substantial call ══════════════════════════
        else:
            synthesized_content = _invoke(
                writer_role,
                f"""{base_context}

Write a focused synthesis of AT LEAST 800 words organised into these sections:

## Overview
2-3 paragraphs: what this topic is, why it matters, and the current state of knowledge.

## Key Findings
3-4 sub-themes, each a ### heading with 1-2 full paragraphs and specific supporting evidence.

## Analysis & Implications
2 paragraphs: what larger story the findings tell and what they mean in practice.

Write in full prose paragraphs throughout. Be specific — real statistics, names, and dates."""
            )

        print(f"✅ Synthesis complete ({len(synthesized_content)} characters)")

        return {
            "synthesized_content": synthesized_content,
            "current_agent": "synthesis",
            "messages": [HumanMessage(content=f"Synthesis complete. Generated {len(synthesized_content)} characters of content.")]
        }

    return synthesis_node
