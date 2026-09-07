# Veritas

A sophisticated AI-powered research system that uses multiple specialized agents to collaboratively conduct in-depth research on any given topic. Built with Python, LangGraph, LangChain.

## Features

- **Multi-Agent Collaboration**: Six specialized agents work together seamlessly
- **Comprehensive Research**: Automated web search, analysis, synthesis, and fact-checking
- **Professional Reports**: Generate well-structured markdown reports with citations
- **Powered by AWS Bedrock**: Uses Claude 3.5 Sonnet via AWS Bedrock for intelligent analysis
- **Two Orchestration Modes**: Choose between basic (fast) or enhanced (intelligent)
- **State Persistence**: Long-running research with automatic checkpointing
- **Human-in-the-Loop**: Review and guide research at critical decision points
- **Observability**: Full tracing and debugging with LangSmith
- **Extensible Architecture**: Easy to add new agents or customize existing ones

## Two Orchestration Systems

### Basic Orchestrator (Fast & Simple)
- Sequential workflow: Search → Analysis → Synthesis → Fact-Check → Report
- Fixed strategy for all queries
- Average time: 2-3 minutes
- Cost: ~$0.10-0.20 per query
- **Best for:** Quick research, simple queries, cost-sensitive applications

### Enhanced Orchestrator (Intelligent & Adaptive)
- Intelligent query analysis and strategy selection
- Quality-based adaptive routing
- Source credibility scoring
- Iterative refinement loops
- Average time: 3-5 minutes
- Cost: ~$0.15-0.35 per query
- **Best for:** Complex queries, high-quality requirements, academic research

## Agent Types

1. **Coordinator Agent** (Enhanced only): Orchestrates workflow with intelligent decisions
2. **Web Search Agent**: Gathers information from multiple sources
3. **Analysis Agent**: Extracts key facts and insights from sources
4. **Synthesis Agent**: Combines information into coherent narratives
5. **Fact-Checking Agent**: Verifies claims and assigns confidence scores
6. **Report Writer Agent**: Generates professional markdown reports

## Architecture

### Basic Workflow
```
Query → Web Search → Analysis → Synthesis → Fact Check → Report
```

### Enhanced Workflow
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

## Quick Start

### Prerequisites

- Python 3.11+
- Anthropic API key (for Claude models)
- Tavily API key (for web search)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd multi-agent-research

# Install dependencies
pip install -r requirements.txt

# Or using Poetry
poetry install

# Set up environment variables
cp .env.example .env
# Edit .env with your AWS credentials and API keys:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_DEFAULT_REGION
# - AWS_BEDROCK_MODEL_ID
# - TAVILY_API_KEY
```

### Basic Usage

#### Option 1: Basic Orchestrator (Fast)
```python
from src.graph.workflow import run_research

# Quick research with fixed strategy
report = run_research("What is quantum computing?")
```

```bash
# Command line
python -m src.main --query "What is quantum computing?"
```

#### Option 2: Enhanced Orchestrator (Intelligent)
```python
from src.graph.enhanced_workflow import run_enhanced_research

# Intelligent research with adaptive strategy
report = run_enhanced_research("Compare React vs Vue for enterprise apps")
```

```bash
# Command line
python -m src.main_enhanced --query "Compare React vs Vue"
```

## Project Structure

```
research/
├── src/
│   ├── agents/          # Agent implementations
│   ├── tools/           # Search and analysis tools
│   ├── state/           # State schema definitions
│   ├── graph/           # LangGraph workflows (basic & enhanced)
│   ├── orchestrator/    # Enhanced orchestration components
│   ├── utils/           # Utilities and helpers
│   ├── main.py          # Basic system entry point
│   └── main_enhanced.py # Enhanced system entry point
├── tests/               # Test suite
├── examples/            # Example scripts
│   ├── basic_research.py
│   └── enhanced_research.py
├── config/              # Configuration files
```

## Configuration

Configure agent behavior in `config/agents.yaml`:

```yaml
web_search:
  max_sources: 20
  search_depth: advanced

analysis:
  chunk_size: 2000
  confidence_threshold: 0.6

synthesis:
  min_sources: 3
  temperature: 0.3

fact_checker:
  verification_sources: 3
  min_confidence: 0.7

report_writer:
  format: markdown
  citation_style: APA
```