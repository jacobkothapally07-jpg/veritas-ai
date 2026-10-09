import os
import urllib.parse
import urllib.request
import json
import ssl
import asyncio
from typing import Dict, Any, List, Optional

SERPAPI_BASE_URL = "https://serpapi.com/search"

# Unverified SSL context to handle macOS default missing CA certificate bundles
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def fetch_serpapi_engine_sync(engine: str, query: str, api_key: str, extra_params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Synchronously fetches results from a specific SerpApi engine."""
    params = {
        "engine": engine,
        "q": query,
        "api_key": api_key,
        "hl": "en",
        "gl": "us",
        "num": "10"
    }
    if extra_params:
        params.update(extra_params)
    
    url = f"{SERPAPI_BASE_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "VeritasAI-ForensicAuditor/1.0"})
    
    try:
        with urllib.request.urlopen(req, timeout=12, context=ssl_ctx) as response:
            if response.status == 200:
                raw = response.read().decode("utf-8")
                return json.loads(raw)
    except Exception as e:
        print(f"⚠️ SerpApi [{engine}] query error for '{query}': {e}")
        return {"error": str(e)}
    return {}


async def fetch_serpapi_engine_async(engine: str, query: str, api_key: str, extra_params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Runs synchronous urllib call in asyncio thread executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, fetch_serpapi_engine_sync, engine, query, api_key, extra_params)


def normalize_patent_results(raw_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalizes SerpApi google_patents JSON response."""
    organic = raw_json.get("organic_results", [])
    normalized = []
    for item in organic:
        pub_info = item.get("publication_info", {})
        patent_id = item.get("patent_id") or pub_info.get("publication_number") or item.get("title", "")[:15]
        assignee = item.get("assignee") or pub_info.get("assignee") or "Undisclosed Assignee"
        filing_date = item.get("filing_date") or pub_info.get("filing_date") or "N/A"
        priority_date = item.get("priority_date") or pub_info.get("priority_date") or "N/A"
        
        normalized.append({
            "engine": "google_patents",
            "patent_id": patent_id,
            "title": item.get("title", "Untitled Patent"),
            "assignee": assignee,
            "filing_date": filing_date,
            "priority_date": priority_date,
            "snippet": item.get("snippet", ""),
            "link": item.get("link", f"https://patents.google.com/patent/{patent_id}/en"),
            "status": "Active / Filed"
        })
    return normalized


def normalize_scholar_results(raw_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalizes SerpApi google_scholar JSON response."""
    organic = raw_json.get("organic_results", [])
    normalized = []
    for item in organic:
        pub_info = item.get("publication_info", {})
        authors = pub_info.get("authors", [])
        author_names = ", ".join([a.get("name", "") for a in authors]) if authors else pub_info.get("summary", "Academic Researchers")
        inline_links = item.get("inline_links", {})
        cited_by = inline_links.get("cited_by", {}).get("total", 0)
        
        resources = item.get("resources", [])
        pdf_link = resources[0].get("link") if resources else None
        
        normalized.append({
            "engine": "google_scholar",
            "title": item.get("title", "Untitled Academic Paper"),
            "authors": author_names,
            "publication": pub_info.get("summary", "Peer-Reviewed Scientific Journal"),
            "citations": cited_by,
            "snippet": item.get("snippet", ""),
            "link": item.get("link", "#"),
            "pdf_link": pdf_link
        })
    return normalized


def normalize_news_results(raw_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalizes SerpApi google_news JSON response."""
    news_results = raw_json.get("news_results", [])
    normalized = []
    for item in news_results:
        source_info = item.get("source", {})
        source_name = source_info.get("name") if isinstance(source_info, dict) else str(source_info)
        
        normalized.append({
            "engine": "google_news",
            "title": item.get("title", "News Headline"),
            "source": source_name or "Financial & Industry Press",
            "date": item.get("date", "Recent"),
            "snippet": item.get("snippet", ""),
            "link": item.get("link", "#")
        })
    return normalized


def normalize_web_results(raw_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalizes SerpApi google organic search JSON response."""
    organic = raw_json.get("organic_results", [])
    normalized = []
    for item in organic:
        normalized.append({
            "engine": "google",
            "title": item.get("title", "Web Discussion"),
            "source": item.get("displayed_link", "web"),
            "snippet": item.get("snippet", ""),
            "link": item.get("link", "#")
        })
    return normalized


async def query_all_four_engines(query: str, api_key: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Executes concurrent queries across all 4 SerpApi engines:
    1. google_patents
    2. google_scholar
    3. google_news
    4. google
    """
    patent_task = fetch_serpapi_engine_async("google_patents", query, api_key)
    scholar_task = fetch_serpapi_engine_async("google_scholar", query, api_key)
    news_task = fetch_serpapi_engine_async("google_news", query, api_key)
    web_task = fetch_serpapi_engine_async("google", query, api_key)
    
    raw_patents, raw_scholar, raw_news, raw_web = await asyncio.gather(
        patent_task, scholar_task, news_task, web_task
    )
    
    return {
        "patents": normalize_patent_results(raw_patents),
        "scholar": normalize_scholar_results(raw_scholar),
        "news": normalize_news_results(raw_news),
        "web": normalize_web_results(raw_web)
    }
