from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.content import ContentItem
from app.models.creator import Creator
from app.models.match import ContentMatch, ContentGap
from app.models.scan import Scan

router = APIRouter()

@router.get("/")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # 1. Total Creators Scanned
    creators_result = await db.execute(select(func.count(Creator.id)))
    total_creators = creators_result.scalar() or 0

    # 2. Total Videos Analyzed
    videos_result = await db.execute(select(func.count(ContentItem.id)))
    total_videos = videos_result.scalar() or 0

    # 3. Content Gaps
    gaps_result = await db.execute(select(func.count(ContentGap.id)))
    total_gaps = gaps_result.scalar() or 0

    # 4. Average Match Rate
    # Just an arbitrary calculation or average of overall_score
    match_rate_result = await db.execute(select(func.avg(ContentMatch.overall_score)))
    avg_match_rate = match_rate_result.scalar() or 0.0

    # 5. Top Content Opportunities (Top ContentGaps by score)
    # Join ContentGap with Source ContentItem and Creator
    stmt = (
        select(ContentGap, ContentItem, Creator)
        .join(ContentItem, ContentGap.source_content_id == ContentItem.id)
        .join(Creator, ContentItem.creator_id == Creator.id)
        .order_by(ContentGap.gap_score.desc())
        .limit(5)
    )
    opportunities_result = await db.execute(stmt)
    rows = opportunities_result.all()
    
    opportunities = []
    for gap, item, creator in rows:
        opportunities.append({
            "title": item.title,
            "creator": creator.display_name or creator.username,
            "source": item.platform,
            "views": item.view_count,
            "target": gap.target_platform,
            "score": gap.gap_score
        })

    return {
        "stats": {
            "creators": total_creators,
            "videos": total_videos,
            "gaps": total_gaps,
            "avg_match_rate": round(avg_match_rate, 1)
        },
        "opportunities": opportunities
    }
