from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.saved import SavedContent
from app.models.content import ContentItem
from app.models.creator import Creator

router = APIRouter()

class SaveContentRequest(BaseModel):
    content_id: str
    note: Optional[str] = None

@router.get("/")
async def get_saved_content(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(SavedContent, ContentItem, Creator)
        .join(ContentItem, SavedContent.content_id == ContentItem.id)
        .join(Creator, ContentItem.creator_id == Creator.id)
        .order_by(SavedContent.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for saved, item, creator in rows:
        items.append({
            "id": saved.id,
            "saved_at": saved.created_at.isoformat() if saved.created_at else None,
            "note": saved.note,
            "content": {
                "id": item.id,
                "title": item.title,
                "url": item.canonical_url,
                "platform": item.platform,
                "view_count": item.view_count or 0,
                "like_count": item.like_count or 0,
                "thumbnail_url": item.thumbnail_url,
                "published_at": item.published_at.isoformat() if item.published_at else None,
            },
            "creator": {
                "name": creator.display_name or creator.username,
                "handle": creator.username,
                "platform": creator.platform,
                "avatar": creator.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={creator.username}",
            }
        })

    return items

@router.post("/")
async def save_content(req: SaveContentRequest, db: AsyncSession = Depends(get_db)):
    # Check if already saved
    existing = await db.execute(
        select(SavedContent).where(SavedContent.content_id == req.content_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Content already saved")

    # Check content exists
    content = await db.get(ContentItem, req.content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    saved = SavedContent(content_id=req.content_id, note=req.note)
    db.add(saved)
    await db.commit()
    await db.refresh(saved)
    return {"id": saved.id, "content_id": saved.content_id, "status": "saved"}

@router.delete("/{saved_id}")
async def unsave_content(saved_id: str, db: AsyncSession = Depends(get_db)):
    saved = await db.get(SavedContent, saved_id)
    if not saved:
        raise HTTPException(status_code=404, detail="Saved item not found")
    await db.delete(saved)
    await db.commit()
    return {"status": "removed"}
