import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Any
import uuid

from app.db.session import get_db
from app.models.scan import Scan
from app.services.orchestrator import ScanOrchestrator
from pydantic import BaseModel

router = APIRouter()

class ScanCreate(BaseModel):
    creator_identifier: str
    source_platform: str
    target_platforms: list[str]
    content_limit: int = 20

@router.post("/")
async def create_scan(
    scan_in: ScanCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    from app.providers import get_provider
    provider = get_provider()
    creator = await provider.get_creator(scan_in.creator_identifier)
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
        
    from app.models.creator import Creator
    result = await db.execute(select(Creator).where(Creator.id == creator["id"]))
    db_creator = result.scalar_one_or_none()
    
    if not db_creator:
        db_creator = Creator(**creator)
        db.add(db_creator)
        await db.flush()

    scan = Scan(
        creator_id=db_creator.id,
        source_platform=scan_in.source_platform,
        target_platforms=scan_in.target_platforms,
        content_limit=scan_in.content_limit
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    
    async def run_scan_bg(scan_id: str):
        from app.db.session import SessionLocal
        async with SessionLocal() as bg_db:
            orchestrator = ScanOrchestrator(bg_db)
            await orchestrator.run_scan(scan_id)
            
    background_tasks.add_task(run_scan_bg, scan.id)
    
    return {"scan_id": scan.id, "status": scan.status}

@router.get("/{scan_id}")
async def get_scan_progress(scan_id: str, db: AsyncSession = Depends(get_db)):
    scan = await db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {
        "id": scan.id,
        "status": scan.status,
        "progress": scan.progress,
        "error_message": scan.error_message
    }

@router.get("/{scan_id}/results")
async def get_scan_results(scan_id: str, db: AsyncSession = Depends(get_db)):
    from app.models.creator import Creator
    from app.models.content import ContentItem
    from app.models.match import ContentGap, ContentMatch
    
    scan = await db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    creator = await db.get(Creator, scan.creator_id)
    
    # Get total videos scanned for this creator on source platform?
    # Actually just total videos we analyzed during this scan
    # Or just count all videos for the creator. We can count from ContentItem
    v_res = await db.execute(select(func.count(ContentItem.id)).where(ContentItem.creator_id == creator.id))
    videos_scanned = v_res.scalar() or 0
    
    # Matches
    # For a real implementation we'd link matches to scan. But MVP doesn't have scan_id on match.
    # We can just use gaps which DO have scan_id
    
    # Get gaps
    gaps_stmt = (
        select(ContentGap, ContentItem)
        .join(ContentItem, ContentGap.source_content_id == ContentItem.id)
        .where(ContentGap.scan_id == scan_id)
    )
    gaps_res = await db.execute(gaps_stmt)
    gaps_data = gaps_res.all()
    
    # Format gaps per video
    # Aggregate gaps per video so we can show "Found" / "Not Detected" per target platform
    video_map = {}
    for gap, item in gaps_data:
        if item.id not in video_map:
            video_map[item.id] = {
                "title": item.title,
                "views": item.view_count,
                "url": item.canonical_url,
                "score": 0,
                "targets": {p: "Not detected" for p in scan.target_platforms}
            }
        video_map[item.id]["targets"][gap.target_platform] = "Gap detected"
        video_map[item.id]["score"] = max(video_map[item.id]["score"], gap.gap_score)
        
    # Wait, what if there is a match? We don't have scan_id on ContentMatch.
    # But we can look at ContentMatch for the creator.
    # For MVP we can just say "Not detected" means a gap was found, "Found" means no gap was found.
    # Since gap represents a MISSING cross-post.
    # So if there is a gap, it is "Not detected". If no gap for a target platform, it is "Found".
    for item_id, data in video_map.items():
        # But wait, we only get videos that HAVE gaps. What about videos with NO gaps?
        pass

    # Let's get ALL source videos for this creator on this source platform
    items_stmt = select(ContentItem).where(
        ContentItem.creator_id == creator.id,
        ContentItem.platform == scan.source_platform
    ).limit(scan.content_limit)
    items_res = await db.execute(items_stmt)
    all_items = items_res.scalars().all()
    
    results = []
    gaps_count = len(gaps_data)
    
    for item in all_items:
        targets = {}
        max_score = 0
        for p in scan.target_platforms:
            # check if gap exists
            gap = next((g for g, i in gaps_data if i.id == item.id and g.target_platform == p), None)
            if gap:
                targets[p] = "Not detected"
                max_score = max(max_score, gap.gap_score)
            else:
                targets[p] = "Found"
                
        results.append({
            "title": item.title,
            "views": item.view_count or 0,
            "url": item.canonical_url,
            "targets": targets,
            "score": max_score
        })
        
    cross_post_rate = 100
    if len(all_items) > 0 and len(scan.target_platforms) > 0:
        total_possible = len(all_items) * len(scan.target_platforms)
        cross_post_rate = int(((total_possible - gaps_count) / total_possible) * 100)
    
    return {
        "creator": {
            "name": creator.display_name or creator.username,
            "handle": creator.username,
            "platform": creator.platform,
            "followers": creator.followers or 0,
            "avatar": creator.avatar_url or "https://api.dicebear.com/7.x/avataaars/svg?seed=" + creator.username
        },
        "stats": {
            "videos_scanned": len(all_items),
            "matches": (len(all_items) * len(scan.target_platforms)) - gaps_count,
            "gaps": gaps_count,
            "cross_post_rate": cross_post_rate
        },
        "matrix": results
    }
