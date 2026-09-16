from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.content import ContentItem
from app.models.creator import Creator

router = APIRouter()

@router.get("/")
async def get_recent_content(limit: int = 50, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(ContentItem, Creator)
        .join(Creator, ContentItem.creator_id == Creator.id)
        .order_by(ContentItem.published_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    content = []
    for item, creator in rows:
        content.append({
            "id": item.id,
            "title": item.title,
            "description": item.caption,
            "url": item.canonical_url,
            "platform": item.platform,
            "published_at": item.published_at,
            "view_count": item.view_count,
            "creator_name": creator.display_name or creator.username,
            "creator_url": creator.username
        })
        
    return content
