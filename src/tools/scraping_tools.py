"""Web scraping tools for extracting content from URLs."""

from typing import Optional
from langchain_core.tools import tool
from bs4 import BeautifulSoup
import requests
from requests.exceptions import RequestException, Timeout


@tool
def scrape_webpage(url: str, timeout: int = 10) -> str:
    """Scrape and extract text content from a webpage.
    
    Args:
        url: The URL of the webpage to scrape
        timeout: Request timeout in seconds (default: 10)
        
    Returns:
        Extracted text content from the webpage, limited to 10,000 characters
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, timeout=timeout, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Limit to 10k characters
        return text[:10000]
        
    except Timeout:
        return f"Error: Timeout while scraping {url}"
    except RequestException as e:
        return f"Error scraping {url}: {str(e)}"
    except Exception as e:
        return f"Unexpected error scraping {url}: {str(e)}"


@tool
def extract_main_content(url: str) -> str:
    """Extract main article content from a webpage, filtering out navigation and ads.
    
    Args:
        url: The URL of the webpage
        
    Returns:
        Main content text from the webpage
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, timeout=10, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find main content areas
        main_content = None
        for selector in ['article', 'main', '[role="main"]', '.content', '#content']:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if not main_content:
            main_content = soup.body
        
        if main_content:
            # Remove unwanted elements
            for element in main_content(["script", "style", "nav", "footer", "aside", "header"]):
                element.decompose()
            
            text = main_content.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text[:10000]
        
        return "Could not extract main content"
        
    except Exception as e:
        return f"Error extracting content from {url}: {str(e)}"
