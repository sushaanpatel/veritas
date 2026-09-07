# Quick Start Guide

Get your multi-agent research system up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /Users/sushaanpatel/code/research

# Install Python dependencies
pip install -r requirements.txt

# Or using a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Set Up API Keys

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
TAVILY_API_KEY=tvly-your-tavily-api-key-here

# Optional (for tracing/debugging)
LANGSMITH_API_KEY=ls-your-langsmith-api-key-here
LANGSMITH_TRACING=true
```

### Getting API Keys

- **Anthropic Claude**: https://console.anthropic.com/ (Get API key from Settings)
- **Tavily**: https://tavily.com/ (free tier available)
- **LangSmith** (optional): https://smith.langchain.com/

### Anthropic Models Available

The system uses **Claude 3.5 Sonnet** by default, which offers:
- Excellent reasoning and analysis capabilities
- Strong fact-checking and verification
- High-quality report generation
- Cost-effective for research tasks

You can change the model in `.env`:
```bash
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Default (recommended)
# Or use other models:
# ANTHROPIC_MODEL=claude-3-opus-20240229     # Most capable
# ANTHROPIC_MODEL=claude-3-haiku-20240307    # Fastest, most economical
```

## Step 3: Run Your First Research

### Option A: Interactive Mode
```bash
python -m src.main
```
Then enter your research query when prompted.

### Option B: Command Line
```bash
python -m src.main --query "What are the latest developments in quantum computing?"
```

### Option C: Python Script
```python
from src.graph.workflow import run_research

report = run_research("What is artificial intelligence?")
print(report)
```

## Step 4: View Your Report

The research report will be saved as `research_report.md` in the current directory.

## Example Queries to Try

```bash
# Technology
python -m src.main --query "Explain large language models and their applications"

# Science
python -m src.main --query "What are the latest breakthroughs in cancer research?"

# Business
python -m src.main --query "Analyze the electric vehicle market trends"

# History
python -m src.main --query "What caused the fall of the Roman Empire?"
```

## Advanced Usage

### Custom Output File
```bash
python -m src.main --query "AI ethics" --output my_report.md
```

### Streaming Mode (see progress in real-time)
```bash
python examples/streaming_research.py
```

### Basic Example
```bash
python examples/basic_research.py
```

## Troubleshooting

### "Missing required API keys"
- Make sure you've created a `.env` file with your API keys
- Verify the keys are correct and active
- For Anthropic: Check your API key at https://console.anthropic.com/settings/keys

### "Module not found"
- Make sure you've installed all dependencies: `pip install -r requirements.txt`
- Activate your virtual environment if using one

### "Rate limit exceeded"
- You may be hitting API rate limits
- Wait a few minutes and try again
- Consider upgrading your API plan or using a different model

### Slow performance
- The research process can take 2-5 minutes depending on the query
- Use `--no-verbose` flag to reduce output
- Check your internet connection
- Consider using Claude 3 Haiku for faster (but less detailed) results

### API Errors
- Verify your Anthropic API key is valid
- Check your account has sufficient credits
- Ensure you're using a supported model name

## What Happens During Research?

1. **🔍 Web Search Agent** - Searches the web and collects sources (30-60 seconds)
2. **🔬 Analysis Agent** - Extracts facts and insights from sources (30-60 seconds)
3. **🧩 Synthesis Agent** - Combines information into coherent narrative (20-40 seconds)
4. **✓ Fact-Checking Agent** - Verifies claims and assigns confidence scores (30-60 seconds)
5. **📝 Report Writer Agent** - Generates professional markdown report (20-40 seconds)

**Total time: 2-5 minutes**

## Cost Estimates (Anthropic Claude)

Using Claude 3.5 Sonnet (default):
- **Per research query**: ~$0.10 - $0.30 USD
- Depends on: query complexity, number of sources, report length

Using Claude 3 Haiku (economical):
- **Per research query**: ~$0.02 - $0.08 USD
- Faster but may produce less detailed analysis

Using Claude 3 Opus (premium):
- **Per research query**: ~$0.30 - $0.80 USD
- Most thorough analysis and highest quality reports

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
- Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for code examples
- Explore the `examples/` directory for more usage patterns
- Customize agent behavior in `config/agents.yaml`

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review example scripts in `examples/`
- Visit Anthropic documentation: https://docs.anthropic.com/
- Open an issue on GitHub

---

Happy researching! 🚀