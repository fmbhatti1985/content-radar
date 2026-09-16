from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.creator import Creator
from app.models.content import ContentItem

router = APIRouter()

@router.get("/")
async def get_creators(db: AsyncSession = Depends(get_db)):
    # Get all creators with their total content items count
    stmt = (
        select(
            Creator, 
            func.count(ContentItem.id).label("video_count")
        )
        .outerjoin(ContentItem, ContentItem.creator_id == Creator.id)
        .group_by(Creator.id)
        .order_by(Creator.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    creators_list = []
    for creator, video_count in rows:
        creators_list.append({
            "id": creator.id,
            "username": creator.username,
            "name": creator.display_name or creator.username,
            "platform": creator.platform,
            "followers": creator.followers or 0,
            "avatar": creator.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={creator.username}",
            "bio": creator.bio,
            "video_count": video_count
        })
        
    return creators_list
