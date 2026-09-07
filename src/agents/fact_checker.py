"""Fact-Checking Agent - Verifies claims and assigns confidence scores."""

from typing import Dict, Any, List
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from src.state.schema import ResearchState, Fact
import os
import json


def create_fact_checker_agent():
    """Create the fact-checking agent node.
    
    This agent is responsible for:
    - Verifying facts against authoritative sources
    - Checking for logical consistency
    - Identifying potential biases or misinformation
    - Validating statistics and data points
    - Cross-referencing facts across sources
    - Assigning confidence scores
    
    Returns:
        A function that processes the research state and returns updated state
    """
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    llm = ChatAnthropic(
        model=model,
        temperature=0,
        max_tokens=4096
    )
    
    def fact_checker_node(state: ResearchState) -> Dict[str, Any]:
        """Verify facts and assign confidence scores.
        
        Args:
            state: Current research state containing extracted facts
            
        Returns:
            Updated state with verified facts
        """
        facts = state["extracted_facts"]
        sources = state["sources"]
        query = state["query"]
        strategy = state.get("strategy", {})
        analysis_depth = strategy.get("analysis_depth", "medium")

        print(f"\n✓ [Fact-Checking Agent] Verifying {len(facts)} facts (depth={analysis_depth})")
        
        if not facts:
            print("⚠️  No facts to verify")
            return {
                "verified_facts": [],
                "current_agent": "fact_checker",
                "messages": [HumanMessage(content="No facts available for verification")]
            }
        
        verified_facts: List[Fact] = []
        
        # Scale source content and breadth with analysis depth
        if analysis_depth == "deep":
            chars_per_source = 1200
            sources_for_check = min(len(sources), 15)
        elif analysis_depth == "shallow":
            chars_per_source = 500
            sources_for_check = min(len(sources), 6)
        else:  # medium
            chars_per_source = 800
            sources_for_check = min(len(sources), 10)

        # Prepare source content for verification
        source_content = "\n\n".join([
            f"Source {i+1} ({source['title']}):\n{source['content'][:chars_per_source]}"
            for i, source in enumerate(sources[:sources_for_check])
        ])
        
        # Verify facts in batches
        batch_size = 5
        for i in range(0, len(facts), batch_size):
            batch = facts[i:i+batch_size]
            
            # Prepare batch for verification with numbered claims
            claims_list = []
            for j, fact in enumerate(batch, 1):
                claims_list.append({
                    "number": j,
                    "claim": fact['claim']
                })
            
            system_msg = SystemMessage(content="""You are a rigorous fact-checker with a mandate to verify claims with precision and intellectual honesty.

For each claim, examine the provided source material carefully and respond with a JSON array.

Each verification object must contain:
- claim_number: the number of the claim (integer)
- status: exactly one of "VERIFIED", "PARTIALLY_VERIFIED", "UNVERIFIED", or "CONTRADICTED"
- confidence: a float between 0.0 and 1.0
- reasoning: a specific, evidence-based explanation (2–3 sentences minimum) — cite which source number supports or contradicts the claim and what it says

Status definitions (apply rigorously):
- VERIFIED (confidence 0.75–1.0): The claim is directly and explicitly supported by at least one source. Quote or closely paraphrase the supporting text in your reasoning.
- PARTIALLY_VERIFIED (confidence 0.5–0.75): The claim is broadly consistent with sources but has caveats — different scope, approximate numbers, or only one source of several supports it. Explain the qualification.
- UNVERIFIED (confidence 0.3–0.6): The claim does not appear in the provided sources. Do not penalise claims that may be true but simply outside the source material — note this distinction.
- CONTRADICTED (confidence 0.0–0.4): At least one source directly contradicts the claim. Quote the contradicting text in your reasoning.

Reasoning quality standards:
- Always cite the source number(s): "Source 3 states that..." or "No source mentions..."
- Never write vague reasoning like "not directly supported" — explain specifically what IS in the sources
- If a claim uses different wording than the source but conveys the same meaning, mark it VERIFIED and note the paraphrase
- Be fair: UNVERIFIED is not the same as false

Respond ONLY with a valid JSON array. No markdown, no preamble, no explanation outside the JSON.""")
            
            response = llm.invoke([
                system_msg,
                HumanMessage(content=f"""Research Topic: {query}

Claims to verify:
{json.dumps(claims_list, indent=2)}

Available Source Material:
{source_content}

Verify each claim against the source material above. For each claim, cite specific source numbers in your reasoning. Respond with a JSON array only.""")
            ])
            
            # Parse JSON response
            try:
                # Extract JSON from response (handle markdown code blocks)
                content = response.content.strip()
                if content.startswith('```'):
                    # Remove markdown code block markers
                    lines = content.split('\n')
                    content = '\n'.join(lines[1:-1]) if len(lines) > 2 else content
                    content = content.replace('```json', '').replace('```', '').strip()
                
                verifications = json.loads(content)
                
                # Process each verification
                for j, fact in enumerate(batch):
                    # Find matching verification
                    verification = None
                    for v in verifications:
                        if v.get('claim_number') == j + 1:
                            verification = v
                            break
                    
                    if verification:
                        status = verification.get('status', 'UNVERIFIED')
                        confidence = verification.get('confidence', fact['confidence'])
                        reasoning = verification.get('reasoning', '')
                        
                        # Determine if verified
                        verified = status in ['VERIFIED', 'PARTIALLY_VERIFIED']
                        
                        # Adjust confidence based on status
                        if status == 'VERIFIED':
                            confidence = min(confidence * 1.1, 1.0)
                        elif status == 'PARTIALLY_VERIFIED':
                            confidence = confidence * 0.9
                        elif status == 'CONTRADICTED':
                            confidence = confidence * 0.3
                            verified = False
                        else:  # UNVERIFIED
                            confidence = confidence * 0.6
                            verified = False
                        
                        verified_facts.append({
                            "claim": fact['claim'],
                            "source_urls": fact['source_urls'],
                            "confidence": round(confidence, 2),
                            "verified": verified,
                            "reasoning": reasoning
                        })
                    else:
                        # No verification found, mark as unverified
                        verified_facts.append({
                            "claim": fact['claim'],
                            "source_urls": fact['source_urls'],
                            "confidence": round(fact['confidence'] * 0.6, 2),
                            "verified": False,
                            "reasoning": "Could not verify from available sources"
                        })
                
            except json.JSONDecodeError as e:
                print(f"   ⚠️  JSON parsing error: {e}")
                print(f"   Response was: {response.content[:200]}...")
                # Fallback: mark all as unverified
                for fact in batch:
                    verified_facts.append({
                        "claim": fact['claim'],
                        "source_urls": fact['source_urls'],
                        "confidence": round(fact['confidence'] * 0.6, 2),
                        "verified": False,
                        "reasoning": "Verification failed due to parsing error"
                    })
            
            print(f"   Verified batch {i//batch_size + 1}/{(len(facts)-1)//batch_size + 1}")
        
        # Count verification results
        verified_count = sum(1 for f in verified_facts if f['verified'])
        print(f"✅ Verification complete: {verified_count}/{len(verified_facts)} facts verified")
        
        return {
            "verified_facts": verified_facts,
            "current_agent": "fact_checker",
            "messages": [HumanMessage(content=f"Fact-checking complete. {verified_count}/{len(verified_facts)} facts verified.")]
        }
    
    return fact_checker_node