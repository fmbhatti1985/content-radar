from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class BaseProvider(ABC):
    def __init__(self, settings: Any = None):
        self.settings = settings

    @property
    @abstractmethod
    def platform_name(self) -> str:
        pass

    @property
    def capabilities(self) -> Dict[str, bool]:
        return {
            "can_lookup_creator": False,
            "can_list_creator_content": False,
            "can_search_content": False,
            "can_get_metrics": False,
            "can_download_media": False,
            "can_get_comments": False,
            "can_get_transcript": False,
        }

    @abstractmethod
    async def validate_credentials(self) -> bool:
        pass

    @abstractmethod
    async def get_creator(self, identifier: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_creator_content(self, creator_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def search_content(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_content_metadata(self, content_id: str) -> Optional[Dict[str, Any]]:
        pass
        
    @abstractmethod
    async def health_check(self) -> bool:
        pass
