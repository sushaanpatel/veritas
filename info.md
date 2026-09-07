# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

This is a **Multi-Agent Research System** built with Python, LangGraph, LangChain, and AWS Bedrock with Claude. The system uses six specialized AI agents that collaborate to conduct comprehensive research on any given topic, producing professional markdown reports with citations.

### Core Technologies
- **Python 3.11+**: Primary language
- **LangGraph**: Agent orchestration and state management
- **LangChain**: LLM abstractions and tool integrations
- **AWS Bedrock with Claude 3.5 Sonnet**: Primary LLM for all agents
- **Tavily API**: Web search functionality

### Two Orchestration Modes

1. **Basic Orchestrator** (`src/main.py`): Fast, sequential workflow (2-3 min, ~$0.10-0.20)
2. **Enhanced Orchestrator** (`src/main_enhanced.py`): Intelligent, adaptive workflow with quality control (3-5 min, ~$0.15-0.35)

## Architecture

### Agent System

The system consists of 6 specialized agents:

1. **Coordinator Agent** (`src/orchestrator/coordinator.py`) - Enhanced mode only
   - Analyzes queries and selects optimal research strategies
   - Monitors quality throughout the process
   - Makes adaptive routing decisions
   - Determines when refinement is needed

2. **Web Search Agent** (`src/agents/web_search.py`)
   - Generates diverse search queries from research topics
   - Executes web searches using Tavily API
   - Collects and organizes sources with metadata
   - Enhanced mode includes credibility scoring

3. **Analysis Agent** (`src/agents/analysis.py`)
   - Extracts key facts, statistics, and claims from sources
   - Identifies patterns and trends
   - Generates structured insights
   - Uses structured text parsing (FACT:/SOURCES:/CONFIDENCE: format)

4. **Synthesis Agent** (`src/agents/synthesis.py`)
   - Combines insights from multiple sources
   - Resolves conflicting information
   - Builds coherent narratives
   - Creates integrated knowledge base

5. **Fact-Checking Agent** (`src/agents/fact_checker.py`)
   - Verifies claims against authoritative sources
   - Assigns confidence scores (0.0-1.0)
   - Uses JSON-based response format for reliable parsing
   - Status: VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, CONTRADICTED

6. **Report Writer Agent** (`src/agents/report_writer.py`)
   - Generates professional markdown reports
   - Adds proper citations and references
   - Structures content with clear sections
   - Ensures readability and clarity

### State Management

**Basic State** (`src/state/schema.py`):
- Simple TypedDict with core fields
- Used by basic orchestrator

**Enhanced State** (`src/state/enhanced_schema.py`):
- Extended state with quality metrics
- Includes strategy configuration
- Tracks iterations and refinement needs
- Used by enhanced orchestrator

### Workflow Patterns

**Basic Workflow** (`src/graph/workflow.py`):
```
Query → Web Search → Analysis → Synthesis → Fact Check → Report
```

**Enhanced Workflow** (`src/graph/enhanced_workflow.py`):
```
Query → Coordinator (Analyze & Plan)
         ↓
      Web Search (with credibility scoring)
         ↓
      Coordinator (Quality Check)
         ↓
      Analysis → Coordinator → Synthesis
         ↓
      Coordinator (Quality Check)
         ↓
      Fact Check (if needed)
         ↓
      Coordinator (Refinement Decision)
         ↓
      Report
```

### Enhanced Orchestrator Components

**Query Analyzer** (`src/orchestrator/query_analyzer.py`):
- Classifies query type: OVERVIEW, TECHNICAL, COMPARATIVE, HISTORICAL, SCIENTIFIC, CONTROVERSIAL
- Assesses complexity: LOW, MEDIUM, HIGH
- Determines depth: SHALLOW, MEDIUM, DEEP
- Creates optimal research strategy

**Quality Control** (`src/orchestrator/quality_control.py`):
- Monitors 4 quality metrics:
  - Source diversity (different domains)
  - Content depth (substantial content)
  - Fact confidence (well-supported claims)
  - Citation coverage (facts have sources)
- Determines if refinement is needed (threshold: 0.7)
- Scores source credibility (.edu, .gov, academic journals prioritized)

**Coordinator** (`src/orchestrator/coordinator.py`):
- Orchestrates workflow based on strategy
- Makes adaptive routing decisions
- Triggers refinement loops when quality is low
- Manages iteration limits (max 2 iterations)

## Building and Running

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_DEFAULT_REGION
# - AWS_BEDROCK_MODEL_ID (optional, defaults to anthropic.claude-3-5-sonnet-20241022-v2:0)
# - TAVILY_API_KEY

# Verify setup
python verify_setup.py
```

### Running Research

**Basic System (Fast):**
```bash
python -m src.main --query "Your research topic"
```

**Enhanced System (Intelligent):**
```bash
python -m src.main_enhanced --query "Your research topic"
```

**Python API:**
```python
# Basic
from src.graph.workflow import run_research
report = run_research("What is quantum computing?")

# Enhanced
from src.graph.enhanced_workflow import run_enhanced_research
report = run_enhanced_research("Compare React vs Vue", verbose=True)

# Enhanced with streaming
from src.graph.enhanced_workflow import run_enhanced_research_with_streaming
for event in run_enhanced_research_with_streaming("Your query"):
    print(event)
```

### Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_workflow.py

# Run with coverage
pytest --cov=src tests/
```

## Development Conventions

### Code Style

- **Formatting**: Code follows standard Python conventions
- **Type Hints**: All functions use type hints (TypedDict for state)
- **Docstrings**: All functions have comprehensive docstrings
- **Imports**: Organized by standard library, third-party, local

### Agent Implementation Pattern

All agents follow this pattern:

```python
def create_agent_name():
    """Create the agent node.
    
    This agent is responsible for:
    - Responsibility 1
    - Responsibility 2
    
    Returns:
        A function that processes the research state
    """
    model_id = os.getenv("AWS_BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    llm = ChatBedrock(
        model_id=model_id,
        model_kwargs={"temperature": 0}
    )
    
    def agent_node(state: ResearchState) -> Dict[str, Any]:
        """Process state and return updates.
        
        Args:
            state: Current research state
            
        Returns:
            Updated state dictionary
        """
        # Agent logic here
        return {
            "field_to_update": value,
            "current_agent": "agent_name",
            "messages": [HumanMessage(content="Status message")]
        }
    
    return agent_node
```

### LLM Response Parsing

**For structured data, use JSON format:**
```python
system_msg = SystemMessage(content="""Respond ONLY with valid JSON.
Format: [{"field": "value"}]""")

response = llm.invoke([system_msg, HumanMessage(content=prompt)])

# Parse with error handling
try:
    content = response.content.strip()
    # Remove markdown code blocks if present
    if content.startswith('```'):
        content = '\n'.join(content.split('\n')[1:-1])
    data = json.loads(content)
except json.JSONDecodeError:
    # Fallback handling
```

**For text with structure, use clear delimiters:**
```python
system_msg = SystemMessage(content="""Use this EXACT format:
FACT: [claim]
SOURCES: [source numbers]
CONFIDENCE: [0.0-1.0]
REASONING: [explanation]""")
```

### State Updates

Agents return partial state updates (not full state):

```python
return {
    "sources": new_sources,  # Update this field
    "current_agent": "web_search",  # Track current agent
    "messages": [HumanMessage(content="Status")]  # Add message
}
```

LangGraph merges these updates into the full state automatically.

### Error Handling

- Use try-except blocks for external API calls
- Print warnings for non-critical errors
- Continue with partial results when possible
- Log errors for debugging

### Configuration

Agent behavior is configured in `config/agents.yaml`:

```yaml
web_search:
  max_sources: 20
  search_depth: advanced
  
analysis:
  chunk_size: 2000
  confidence_threshold: 0.6
```

Load configuration:
```python
from src.utils.config import load_config
config = load_config()
max_sources = config['web_search']['max_sources']
```

### Logging

Use the centralized logging system:

```python
from src.utils.logging import get_logger
logger = get_logger(__name__)

logger.info("Starting web search")
logger.warning("Low source count")
logger.error("API call failed", exc_info=True)
```

### Quality Metrics

When working with the enhanced orchestrator, quality metrics are critical:

```python
# Quality assessment returns:
{
    "source_diversity": 0.85,  # 0.0-1.0
    "content_depth": 0.78,     # 0.0-1.0
    "fact_confidence": 0.82,   # 0.0-1.0
    "citation_coverage": 0.89, # 0.0-1.0
    "overall_quality": 0.83    # Average of above
}

# Refinement triggered if overall_quality < 0.7
```

### Source Credibility Scoring

Sources are scored based on:
- Domain reputation: .edu (0.9), .gov (0.95), academic journals (0.9)
- Content quality: length, structure, citations
- Publication date: recent sources scored higher
- Default score: 0.8 for unknown domains

## Key Files and Their Purposes

### Entry Points
- `src/main.py` - Basic system CLI
- `src/main_enhanced.py` - Enhanced system CLI
- `examples/basic_research.py` - Basic usage example
- `examples/enhanced_research.py` - Enhanced usage example

### Core Agents
- `src/agents/web_search.py` - Web search implementation
- `src/agents/analysis.py` - Content analysis and fact extraction
- `src/agents/synthesis.py` - Information synthesis
- `src/agents/fact_checker.py` - Fact verification (uses JSON parsing)
- `src/agents/report_writer.py` - Report generation

### Orchestration
- `src/orchestrator/coordinator.py` - Workflow coordination
- `src/orchestrator/query_analyzer.py` - Query classification and strategy
- `src/orchestrator/quality_control.py` - Quality metrics and assessment

### Workflows
- `src/graph/workflow.py` - Basic sequential workflow
- `src/graph/enhanced_workflow.py` - Enhanced adaptive workflow

### State
- `src/state/schema.py` - Basic state schema
- `src/state/enhanced_schema.py` - Enhanced state with quality metrics

### Tools
- `src/tools/search_tools.py` - Tavily search integration
- `src/tools/scraping_tools.py` - Web scraping utilities

### Utilities
- `src/utils/config.py` - Configuration loading
- `src/utils/logging.py` - Logging setup

### Documentation
- `README.md` - Project overview and quick start
- `ARCHITECTURE.md` - Detailed architecture documentation
- `QUICKSTART.md` - 5-minute setup guide
- `IMPLEMENTATION_GUIDE.md` - Step-by-step code walkthrough
- `ORCHESTRATOR_COMPARISON.md` - Basic vs Enhanced comparison
- `ORCHESTRATOR_ENHANCEMENTS.md` - Future enhancement ideas

## Common Tasks

### Adding a New Agent

1. Create agent file in `src/agents/new_agent.py`
2. Follow the agent implementation pattern
3. Add agent to workflow in `src/graph/workflow.py` or `enhanced_workflow.py`
4. Update state schema if new fields needed
5. Add configuration to `config/agents.yaml`
6. Update documentation

### Modifying Research Strategy

Edit `src/orchestrator/query_analyzer.py`:
- Adjust `create_strategy()` function
- Modify strategy parameters based on query type/complexity
- Update quality thresholds in `src/orchestrator/quality_control.py`

### Changing LLM Model

Set environment variable:
```bash
export AWS_BEDROCK_MODEL_ID="anthropic.claude-3-haiku-20240307-v1:0"  # For speed/cost
export AWS_BEDROCK_MODEL_ID="anthropic.claude-3-opus-20240229-v1:0"   # For quality
```

Or modify in code:
```python
model_id = os.getenv("AWS_BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
```

### Debugging Workflow

Enable LangSmith tracing:
```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=your_key
export LANGSMITH_PROJECT=multi-agent-research
```

View traces at: https://smith.langchain.com/

### Adjusting Quality Thresholds

Edit `src/orchestrator/quality_control.py`:
```python
def should_refine(state: Dict[str, Any]) -> bool:
    overall = metrics.get("overall_quality", 0.0)
    return overall < 0.7  # Adjust this threshold
```

## Important Notes

### API Keys Required
- **AWS_ACCESS_KEY_ID**: For AWS Bedrock access (required)
- **AWS_SECRET_ACCESS_KEY**: For AWS Bedrock access (required)
- **AWS_DEFAULT_REGION**: AWS region for Bedrock (required, e.g., us-east-1)
- **TAVILY_API_KEY**: For web search (required)
- **LANGSMITH_API_KEY**: For tracing (optional)

### Cost Considerations
- Basic system: ~$0.10-0.20 per query
- Enhanced system: ~$0.15-0.35 per query
- Costs vary based on query complexity and source count
- Use Claude 3 Haiku for lower costs
- Limit max_sources in config to reduce costs

### Performance Tips
- Use basic orchestrator for simple queries
- Reduce max_sources for faster results
- Enable caching for repeated queries
- Process sources in batches for large datasets

### Known Issues
- Fact checker previously had text parsing issues (now fixed with JSON)
- Large source counts can cause memory issues (use batching)
- API rate limits may require retry logic
- Some web pages may block scraping

### Migration to AWS Bedrock
This system now uses AWS Bedrock instead of direct Anthropic API. Key changes:
- `ChatAnthropic` → `ChatBedrock`
- Model IDs updated to Bedrock format (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`)
- Environment variables changed to AWS credentials
- All agents now use Claude 3.5 Sonnet via Bedrock by default
- Requires AWS account with Bedrock access

## Future Enhancements

See `ORCHESTRATOR_ENHANCEMENTS.md` for detailed future plans:
- Parallel multi-strategy execution
- Human-in-the-loop checkpoints
- Learning system with pattern recognition
- Multi-modal research (images, videos, code)
- Real-time source monitoring
- Web UI dashboard
- Export to PDF/DOCX

## Getting Help

- Check documentation in project root
- Review examples in `examples/` directory
- Enable verbose mode for detailed output
- Use LangSmith tracing for debugging
- Check `.bob-errors/` for error logs
