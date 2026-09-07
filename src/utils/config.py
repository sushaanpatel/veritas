"""Configuration management utilities."""

import os
import yaml
from typing import Dict, Any, Optional
from pathlib import Path


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Load configuration from YAML file.
    
    Args:
        config_path: Path to config file. If None, uses default config/agents.yaml
        
    Returns:
        Configuration dictionary
    """
    if config_path is None:
        # Try to find config in standard locations
        possible_paths = [
            Path("config/agents.yaml"),
            Path("../config/agents.yaml"),
            Path(__file__).parent.parent.parent / "config" / "agents.yaml"
        ]
        
        for path in possible_paths:
            if path.exists():
                config_path = str(path)
                break
    
    if config_path and os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    
    # Return default configuration
    return {
        "web_search": {
            "max_sources": 20,
            "search_depth": "advanced",
            "timeout": 30
        },
        "analysis": {
            "chunk_size": 2000,
            "max_facts": 50,
            "confidence_threshold": 0.6
        },
        "synthesis": {
            "min_sources": 3,
            "temperature": 0.3
        },
        "fact_checker": {
            "verification_sources": 3,
            "min_confidence": 0.7
        },
        "report_writer": {
            "format": "markdown",
            "max_length": 5000,
            "citation_style": "APA"
        }
    }


def get_env_var(key: str, default: Optional[str] = None) -> Optional[str]:
    """Get environment variable with optional default.
    
    Args:
        key: Environment variable name
        default: Default value if not found
        
    Returns:
        Environment variable value or default
    """
    return os.getenv(key, default)


def validate_api_keys() -> Dict[str, bool]:
    """Validate that required API keys are set.
    
    Returns:
        Dictionary mapping API key names to whether they are set
    """
    required_keys = {
        "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY"),
        "TAVILY_API_KEY": os.getenv("TAVILY_API_KEY")
    }
    
    optional_keys = {
        "ANTHROPIC_MODEL": os.getenv("ANTHROPIC_MODEL"),
        "LANGSMITH_API_KEY": os.getenv("LANGSMITH_API_KEY")
    }
    
    validation = {}
    for key, value in required_keys.items():
        validation[key] = bool(value)
    
    for key, value in optional_keys.items():
        validation[f"{key} (optional)"] = bool(value)
    
    return validation
