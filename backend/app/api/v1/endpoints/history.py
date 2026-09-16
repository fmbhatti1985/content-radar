from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_db
from app.models.scan import Scan
from app.models.creator import Creator
from app.models.match import ContentGap

router = APIRouter()

@router.get("/")
async def get_scan_history(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Scan, Creator)
        .join(Creator, Scan.creator_id == Creator.id)
        .order_by(desc(Scan.created_at))
    )
    result = await db.execute(stmt)
    rows = result.all()

    history = []
    for scan, creator in rows:
        # Count gaps for this scan
        gap_res = await db.execute(
            select(func.count(ContentGap.id)).where(ContentGap.scan_id == scan.id)
        )
        gap_count = gap_res.scalar() or 0

        history.append({
            "id": scan.id,
            "status": scan.status,
            "progress": scan.progress,
            "source_platform": scan.source_platform,
            "target_platforms": scan.target_platforms,
            "content_limit": scan.content_limit,
            "error_message": scan.error_message,
            "started_at": scan.started_at.isoformat() if scan.started_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
            "gaps_found": gap_count,
            "creator": {
                "name": creator.display_name or creator.username,
                "handle": creator.username,
                "platform": creator.platform,
                "avatar": creator.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={creator.username}",
            }
        })

    return history
