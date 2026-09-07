# Multi-Agent Research System

A sophisticated AI-powered research system that uses multiple specialized agents to collaboratively conduct in-depth research on any given topic. Built with Python, LangGraph, LangChain, and **AWS Bedrock with Claude**.

## 🌟 Features

- **Multi-Agent Collaboration**: Six specialized agents work together seamlessly
- **Comprehensive Research**: Automated web search, analysis, synthesis, and fact-checking
- **Professional Reports**: Generate well-structured markdown reports with citations
- **Powered by AWS Bedrock**: Uses Claude 3.5 Sonnet via AWS Bedrock for intelligent analysis
- **Two Orchestration Modes**: Choose between basic (fast) or enhanced (intelligent)
- **State Persistence**: Long-running research with automatic checkpointing
- **Human-in-the-Loop**: Review and guide research at critical decision points
- **Observability**: Full tracing and debugging with LangSmith
- **Extensible Architecture**: Easy to add new agents or customize existing ones

## 🎯 Two Orchestration Systems

### Basic Orchestrator (Fast & Simple)
- Sequential workflow: Search → Analysis → Synthesis → Fact-Check → Report
- Fixed strategy for all queries
- Average time: 2-3 minutes
- Cost: ~$0.10-0.20 per query
- **Best for:** Quick research, simple queries, cost-sensitive applications

### Enhanced Orchestrator (Intelligent & Adaptive) ⭐ NEW
- Intelligent query analysis and strategy selection
- Quality-based adaptive routing
- Source credibility scoring
- Iterative refinement loops
- Average time: 3-5 minutes
- Cost: ~$0.15-0.35 per query
- **Best for:** Complex queries, high-quality requirements, academic research

See [ORCHESTRATOR_COMPARISON.md](ORCHESTRATOR_COMPARISON.md) for detailed comparison.

## 🤖 Agent Types

1. **Coordinator Agent** (Enhanced only): Orchestrates workflow with intelligent decisions
2. **Web Search Agent**: Gathers information from multiple sources
3. **Analysis Agent**: Extracts key facts and insights from sources
4. **Synthesis Agent**: Combines information into coherent narratives
5. **Fact-Checking Agent**: Verifies claims and assigns confidence scores
6. **Report Writer Agent**: Generates professional markdown reports

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- AWS Account with Bedrock access (for Claude models)
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

#### Option 2: Enhanced Orchestrator (Intelligent) ⭐
```python
from src.graph.enhanced_workflow import run_enhanced_research

# Intelligent research with adaptive strategy
report = run_enhanced_research("Compare React vs Vue for enterprise apps")
```

```bash
# Command line
python -m src.main_enhanced --query "Compare React vs Vue"
```

## 📁 Project Structure

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
├── ARCHITECTURE.md      # Detailed architecture documentation
├── IMPLEMENTATION_GUIDE.md  # Step-by-step implementation guide
├── ORCHESTRATOR_ENHANCEMENTS.md  # Advanced orchestrator ideas
├── ORCHESTRATOR_COMPARISON.md    # Basic vs Enhanced comparison
├── QUICKSTART.md        # 5-minute setup guide
└── README.md           # This file
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)**: Get started in 5 minutes
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Comprehensive system architecture
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)**: Step-by-step code walkthrough
- **[ORCHESTRATOR_COMPARISON.md](ORCHESTRATOR_COMPARISON.md)**: Basic vs Enhanced comparison
- **[ORCHESTRATOR_ENHANCEMENTS.md](ORCHESTRATOR_ENHANCEMENTS.md)**: Future enhancement ideas

## 🔧 Configuration

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

## 🎯 Use Cases

- **Academic Research**: Gather and synthesize information from multiple sources
- **Market Research**: Analyze trends and competitive landscapes
- **Technical Documentation**: Research and document complex technical topics
- **Due Diligence**: Comprehensive fact-checking and verification
- **Content Creation**: Generate well-researched articles and reports
- **Comparative Analysis**: Compare multiple options with pros/cons

## 🔍 Example Research Topics

```python
# Technology research (use enhanced for comparisons)
run_enhanced_research("Compare React, Vue, and Angular")

# Scientific research (use enhanced for depth)
run_enhanced_research("Latest breakthroughs in cancer immunotherapy")

# Quick overview (use basic for speed)
run_research("What is machine learning?")

# Business research (use enhanced for quality)
run_enhanced_research("Analyze the electric vehicle market trends")
```

## 🛠️ Advanced Features

### Streaming Output

Get real-time updates:

```python
from src.graph.enhanced_workflow import run_enhanced_research_with_streaming

for event in run_enhanced_research_with_streaming("Your query"):
    agent = event.get("current_agent")
    print(f"[{agent}] Processing...")
```

### Quality Monitoring (Enhanced Only)

```python
# Quality metrics are automatically tracked
# - Source diversity
# - Content depth
# - Fact confidence
# - Citation coverage
```

### Source Credibility Scoring (Enhanced Only)

```python
# Sources are automatically scored based on:
# - Domain reputation (.edu, .gov, academic journals)
# - Author credentials
# - Publication date
# - Content quality
```

## 🧪 Testing

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_workflow.py

# Run with coverage
pytest --cov=src tests/

# Test enhanced system
python examples/enhanced_research.py
```

## 📊 Monitoring

Enable LangSmith tracing for observability:

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=your_key
export LANGSMITH_PROJECT=multi-agent-research
```

View traces at: https://smith.langchain.com/

## 💰 Cost Estimates

### Basic Orchestrator
- Per research query: ~$0.10 - $0.20 USD
- Time: 2-3 minutes
- Quality: Good

### Enhanced Orchestrator
- Per research query: ~$0.15 - $0.35 USD
- Time: 3-5 minutes
- Quality: Excellent

**Model Options:**
- **Claude 3.5 Sonnet** (default): Best balance
- **Claude 3 Haiku**: Most economical
- **Claude 3 Opus**: Highest quality

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t multi-agent-research .

# Run container
docker run -e ANTHROPIC_API_KEY=your_key multi-agent-research
```

### API Server

```bash
# Start FastAPI server
uvicorn src.api:app --reload

# Make research request
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "Your research topic"}'
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Roadmap

- [x] Basic sequential workflow
- [x] Intelligent orchestrator with query analysis
- [x] Quality-based adaptive routing
- [x] Source credibility scoring
- [ ] Parallel multi-strategy execution
- [ ] Human-in-the-loop checkpoints
- [ ] Learning system with pattern recognition
- [ ] Multi-modal research (images, videos, code)
- [ ] Real-time source monitoring
- [ ] Web UI dashboard
- [ ] Export to PDF/DOCX

## 🐛 Troubleshooting

### Common Issues

**API Rate Limits**
```python
# Add retry logic with exponential backoff
from tenacity import retry, stop_after_attempt

@retry(stop=stop_after_attempt(3))
def resilient_search(query):
    return web_search(query)
```

**Memory Issues**
```python
# Process sources in batches
for batch in chunks(sources, batch_size=10):
    process_batch(batch)
```

**Slow Performance**
- Use basic orchestrator for simple queries
- Reduce max_sources in configuration
- Use Claude 3 Haiku for faster results
- Enable caching for repeated queries

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [LangGraph](https://github.com/langchain-ai/langgraph)
- Powered by [LangChain](https://github.com/langchain-ai/langchain)
- LLM by [Anthropic Claude](https://www.anthropic.com/)
- Search powered by [Tavily](https://tavily.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This is a research tool. Always verify critical information from authoritative sources.
