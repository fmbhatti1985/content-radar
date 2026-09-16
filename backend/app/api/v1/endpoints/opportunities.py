from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.match import ContentGap
from app.models.content import ContentItem
from app.models.creator import Creator
from app.models.scan import Scan

router = APIRouter()

@router.get("/")
async def get_opportunities(db: AsyncSession = Depends(get_db)):
    """
    Return the top content gaps ranked by gap_score DESC.
    These are real opportunities where a creator has NOT cross-posted to a platform.
    """
    stmt = (
        select(ContentGap, ContentItem, Creator)
        .join(ContentItem, ContentGap.source_content_id == ContentItem.id)
        .join(Creator, ContentItem.creator_id == Creator.id)
        .order_by(desc(ContentGap.gap_score))
        .limit(50)
    )
    result = await db.execute(stmt)
    rows = result.all()

    opportunities = []
    for gap, item, creator in rows:
        opportunities.append({
            "id": gap.id,
            "gap_score": gap.gap_score,
            "potential": gap.potential,
            "target_platform": gap.target_platform,
            "content": {
                "id": item.id,
                "title": item.title,
                "url": item.canonical_url,
                "platform": item.platform,
                "view_count": item.view_count or 0,
                "like_count": item.like_count or 0,
                "thumbnail_url": item.thumbnail_url,
            },
            "creator": {
                "name": creator.display_name or creator.username,
                "handle": creator.username,
                "platform": creator.platform,
                "avatar": creator.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={creator.username}",
            }
        })

    return opportunities
