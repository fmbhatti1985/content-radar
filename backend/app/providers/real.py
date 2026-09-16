from typing import Dict, List, Any, Optional
import yt_dlp
import asyncio
from datetime import datetime
import uuid
import time

from app.providers.base import BaseProvider

class RealProvider(BaseProvider):
    @property
    def platform_name(self) -> str:
        return "real"
        
    @property
    def capabilities(self) -> Dict[str, bool]:
        return {
            "can_lookup_creator": True,
            "can_list_creator_content": True,
            "can_search_content": True,
            "can_get_metrics": True,
            "can_download_media": False,
            "can_get_comments": False,
            "can_get_transcript": False,
        }

    async def validate_credentials(self) -> bool:
        return True

    def _extract_info(self, url: str, extract_flat: bool, playlist_end: int):
        ydl_opts = {
            'quiet': True,
            'extract_flat': extract_flat,
            'playlist_end': playlist_end,
            'skip_download': True,
            'no_warnings': True,
            'ignoreerrors': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    def _search_yt(self, query: str, limit: int):
        ydl_opts = {
            'quiet': True,
            'extract_flat': True,
            'skip_download': True,
            'no_warnings': True,
            'ignoreerrors': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # ytsearch: queries youtube
            return ydl.extract_info(f"ytsearch{limit}:{query}", download=False)

    async def get_creator(self, identifier: str) -> Optional[Dict[str, Any]]:
        # Treat identifier as URL. If not URL, assume youtube handle
        if not identifier.startswith("http"):
            if not identifier.startswith("@"):
                identifier = "@" + identifier
            identifier = f"https://www.youtube.com/{identifier}"

        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, self._extract_info, identifier, True, 1)
        
        if not info:
            return {
                "id": f"real_creator_{uuid.uuid4().hex[:8]}",
                "username": identifier,
                "display_name": identifier.split("/")[-1],
                "platform": "unknown",
            }
            
        return {
            "id": info.get("channel_id") or info.get("id") or str(uuid.uuid4()),
            "username": identifier, # Store original url/identifier here
            "display_name": info.get("uploader") or info.get("title") or identifier.split("/")[-1],
            "platform": info.get("extractor_key", "unknown").lower(),
            "avatar_url": None,
            "followers": None,
            "bio": info.get("description")
        }

    async def get_creator_content(self, creator_username: str, limit: int = 20) -> List[Dict[str, Any]]:
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, self._extract_info, creator_username, True, limit)
        
        videos = []
        if not info or 'entries' not in info:
            return videos
            
        for i, entry in enumerate(info['entries']):
            if not entry:
                continue
                
            # yt-dlp might return partial info in flat mode
            vid_id = entry.get('id', str(uuid.uuid4()))
            url = entry.get('url') or entry.get('webpage_url')
            if not url and info.get('extractor_key') == 'Youtube':
                url = f"https://www.youtube.com/watch?v={vid_id}"
                
            videos.append({
                "id": vid_id,
                "external_id": vid_id,
                "platform": info.get('extractor_key', 'unknown').lower(),
                "canonical_url": url or "",
                "title": entry.get('title', 'Unknown Title'),
                "caption": entry.get('description', ''),
                "thumbnail_url": entry.get('thumbnail'), # might be None in flat extraction
                "duration_seconds": entry.get('duration', 0.0),
                "view_count": entry.get('view_count', 0),
                "like_count": entry.get('like_count', 0),
                "published_at": datetime.now().isoformat() # Placeholder for flat extract
            })
            
        return videos

    async def search_content(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        # Using ytsearch to search youtube for candidates
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, self._search_yt, query, limit)
        
        results = []
        if not info or 'entries' not in info:
            return results
            
        for entry in info['entries']:
            if not entry:
                continue
            
            vid_id = entry.get('id', str(uuid.uuid4()))
            url = entry.get('url') or f"https://www.youtube.com/watch?v={vid_id}"
            
            results.append({
                "id": vid_id,
                "external_id": vid_id,
                "platform": "youtube",
                "canonical_url": url,
                "title": entry.get('title', 'Unknown Title'),
                "caption": entry.get('description', ''),
                "thumbnail_url": entry.get('thumbnail'),
                "duration_seconds": entry.get('duration', 0.0),
                "view_count": entry.get('view_count', 0),
                "like_count": entry.get('like_count', 0),
                "published_at": datetime.now().isoformat(),
                "creator_name": entry.get('uploader') or entry.get('channel', 'Unknown Creator'),
                "creator_url": entry.get('uploader_url') or entry.get('channel_url', ''),
                "creator_external_id": entry.get('uploader_id') or entry.get('channel_id', str(uuid.uuid4()))
            })
            
        return results

    async def get_content_metadata(self, content_id: str) -> Optional[Dict[str, Any]]:
        return None

    async def health_check(self) -> bool:
        return True
