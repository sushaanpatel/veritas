"""Main entry point for the enhanced multi-agent research system."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from src.graph.enhanced_workflow import run_enhanced_research
from src.utils.config import validate_api_keys
import argparse


def main():
    """Main entry point for the enhanced research system."""
    # Load environment variables (override any existing ones)
    load_dotenv(override=True)
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description="Enhanced Multi-Agent Research System with Intelligent Orchestration",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m src.main_enhanced --query "What is quantum computing?"
  python -m src.main_enhanced --query "Compare React vs Vue" --output report.md
  python -m src.main_enhanced --query "AI ethics" --no-verbose
  
Features:
  - Intelligent query analysis and strategy selection
  - Quality-based adaptive routing
  - Iterative refinement for complex queries
  - Source credibility scoring
        """
    )
    parser.add_argument(
        "--query",
        type=str,
        help="Research query or topic"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="research_report.md",
        help="Output file path (default: research_report.md)"
    )
    parser.add_argument(
        "--no-verbose",
        action="store_true",
        help="Disable verbose output"
    )
    
    args = parser.parse_args()
    
    # Validate API keys
    print("🔑 Validating credentials...")
    api_keys = validate_api_keys()
    
    missing_keys = [key for key, valid in api_keys.items() if not valid and "(optional)" not in key]
    if missing_keys:
        print(f"❌ Missing required credentials: {', '.join(missing_keys)}")
        print("\nPlease set the following environment variables:")
        for key in missing_keys:
            if key.startswith("AWS_"):
                print(f"  export {key}=your_value_here")
            else:
                print(f"  export {key}=your_key_here")
        print("\nOr create a .env file based on .env.example")
        print("\nFor AWS Bedrock setup, see MIGRATION_TO_BEDROCK.md")
        sys.exit(1)
    
    print("✅ API keys validated")
    
    # Get query
    if args.query:
        query = args.query
    else:
        # Interactive mode
        print("\n" + "=" * 80)
        print("🤖 Enhanced Multi-Agent Research System")
        print("   with Intelligent Orchestration")
        print("=" * 80)
        query = input("\n📋 Enter your research query: ").strip()
        
        if not query:
            print("❌ No query provided. Exiting.")
            sys.exit(1)
    
    # Run enhanced research
    verbose = not args.no_verbose
    report = run_enhanced_research(query, verbose=verbose)
    
    # Save report
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"\n💾 Report saved to: {output_path.absolute()}")
    
    # Display report preview
    if verbose:
        print("\n" + "=" * 80)
        print("📄 REPORT PREVIEW")
        print("=" * 80)
        # Show first 1000 characters
        preview = report[:1000]
        if len(report) > 1000:
            preview += "\n\n... (truncated, see full report in file)"
        print(preview)
        print("=" * 80)


if __name__ == "__main__":
    main()
