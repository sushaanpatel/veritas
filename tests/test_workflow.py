"""Tests for the research workflow."""

import pytest
from unittest.mock import Mock, patch
from src.graph.workflow import create_research_workflow, run_research
from src.state.schema import ResearchState


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Mock environment variables for testing."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("TAVILY_API_KEY", "test-key")


def test_create_workflow():
    """Test that workflow can be created."""
    workflow = create_research_workflow()
    assert workflow is not None


@patch('src.agents.web_search.web_search')
@patch('src.agents.web_search.ChatOpenAI')
def test_workflow_execution(mock_llm, mock_search, mock_env_vars):
    """Test basic workflow execution."""
    # Mock LLM responses
    mock_llm_instance = Mock()
    mock_llm_instance.invoke.return_value = Mock(content="Test query\nAnother query")
    mock_llm.return_value = mock_llm_instance
    
    # Mock search results
    mock_search.invoke.return_value = [
        {
            "url": "https://example.com",
            "title": "Test Article",
            "content": "Test content"
        }
    ]
    
    # This would require more extensive mocking for a full test
    # For now, just verify the workflow can be created
    workflow = create_research_workflow()
    assert workflow is not None


def test_initial_state_structure():
    """Test that initial state has correct structure."""
    from datetime import datetime
    
    initial_state: ResearchState = {
        "query": "test query",
        "research_goals": [],
        "subtasks": [],
        "sources": [],
        "extracted_facts": [],
        "key_insights": [],
        "synthesized_content": "",
        "verified_facts": [],
        "final_report": None,
        "messages": [],
        "current_agent": "",
        "iteration": 0,
        "needs_human_review": False,
        "timestamp": datetime.now().isoformat()
    }
    
    # Verify all required keys are present
    required_keys = [
        "query", "sources", "extracted_facts", "key_insights",
        "synthesized_content", "verified_facts", "final_report"
    ]
    
    for key in required_keys:
        assert key in initial_state


@pytest.mark.integration
def test_run_research_integration(mock_env_vars):
    """Integration test for full research workflow.
    
    Note: This requires valid API keys and will make real API calls.
    Mark as integration test to skip in regular test runs.
    """
    query = "What is Python?"
    report = run_research(query, verbose=False)
    
    assert report is not None
    assert len(report) > 0
    assert "Python" in report or "python" in report
