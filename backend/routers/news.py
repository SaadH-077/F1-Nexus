import httpx
import xml.etree.ElementTree as ET
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/news", tags=["News"])

RSS_FEEDS = [
    ("https://www.motorsport.com/rss/f1/news/", "Motorsport.com"),
    ("https://the-race.com/feed/?cat=formula-1", "The Race"),
    ("https://www.autosport.com/rss/f1/news/", "Autosport"),
]

MEDIA_NS = "{http://search.yahoo.com/mrss/}"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"


def _extract_image(item: ET.Element) -> str | None:
    """Try several RSS image patterns."""
    # media:content
    for el in item.iter(f"{MEDIA_NS}content"):
        url = el.get("url")
        if url and url.startswith("http"):
            return url
    # media:thumbnail
    for el in item.iter(f"{MEDIA_NS}thumbnail"):
        url = el.get("url")
        if url and url.startswith("http"):
            return url
    # enclosure
    enc = item.find("enclosure")
    if enc is not None:
        url = enc.get("url", "")
        if url.startswith("http"):
            return url
    return None


def _parse_feed(xml_text: str, source_name: str) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_text)
        channel = root.find("channel") or root
        for item in channel.findall("item")[:8]:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            if not title or not link:
                continue
            desc = (item.findtext("description") or "").strip()
            # Strip basic HTML tags from description
            import re
            desc = re.sub(r"<[^>]+>", "", desc)[:200]
            pub_date = (item.findtext("pubDate") or "").strip()
            image = _extract_image(item)
            items.append({
                "title": title,
                "url": link,
                "description": desc,
                "publishedAt": pub_date,
                "image": image,
                "source": source_name,
            })
    except Exception:
        pass
    return items


@router.get("")
async def get_news() -> Dict[str, Any]:
    """Fetch latest F1 news from multiple RSS feeds."""
    all_articles: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
        for feed_url, name in RSS_FEEDS:
            try:
                resp = await client.get(
                    feed_url,
                    headers={"User-Agent": "F1Nexus/1.0 (f1nexus.app)"},
                )
                if resp.status_code == 200:
                    articles = _parse_feed(resp.text, name)
                    all_articles.extend(articles)
            except Exception:
                pass

    # Deduplicate by URL
    seen: set[str] = set()
    unique: List[Dict[str, Any]] = []
    for a in all_articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            unique.append(a)

    return {"articles": unique[:15]}
