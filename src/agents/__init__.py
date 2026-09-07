"""Agent implementations for the multi-agent research system."""

from src.agents.web_search import create_web_search_agent
from src.agents.analysis import create_analysis_agent
from src.agents.synthesis import create_synthesis_agent
from src.agents.fact_checker import create_fact_checker_agent
from src.agents.report_writer import create_report_writer_agent

__all__ = [
    "create_web_search_agent",
    "create_analysis_agent",
    "create_synthesis_agent",
    "create_fact_checker_agent",
    "create_report_writer_agent",
]
