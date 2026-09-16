import asyncio
import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.scan import Scan
from app.models.content import ContentItem
from app.models.match import ContentMatch, ContentGap
from app.providers.real import RealProvider
from app.services.matching import MatchScorer
from datetime import datetime, timezone

class ScanOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db
        from app.providers import get_provider
        self.provider = get_provider()
        self.scorer = MatchScorer()

    async def run_scan(self, scan_id: str):
        # 1. Update status to running
        scan = await self.db.get(Scan, scan_id)
        if not scan:
            return
            
        scan.status = "running"
        scan.progress = 10.0
        await self.db.commit()
        
        try:
            from app.models.creator import Creator
            creator = await self.db.get(Creator, scan.creator_id)
            if not creator:
                raise Exception("Creator not found")
            source_content = await self.provider.get_creator_content(creator.username, scan.content_limit)
            scan.progress = 30.0
            await self.db.commit()
            
            # Save source content to DB
            saved_sources = []
            for item in source_content:
                db_item = ContentItem(
                    creator_id=scan.creator_id,
                    platform=item["platform"],
                    external_id=item["external_id"],
                    canonical_url=item["canonical_url"],
                    title=item["title"],
                    caption=item["caption"],
                    thumbnail_url=item["thumbnail_url"],
                    duration_seconds=item["duration_seconds"],
                    view_count=item["view_count"],
                    like_count=item["like_count"],
                    published_at=datetime.fromisoformat(item["published_at"]).replace(tzinfo=timezone.utc) if "published_at" in item else None
                )
                self.db.add(db_item)
                saved_sources.append(db_item)
            await self.db.flush()
            
            # 3. Discover candidates per source item
            total_items = len(saved_sources)
            for idx, source_item in enumerate(saved_sources):
                candidates = await self.provider.search_content(source_item.title or "", limit=3)
                
                match_scores = []
                for candidate in candidates:
                    # Find or create candidate creator
                    from sqlalchemy import select
                    candidate_creator = None
                    if candidate.get("creator_external_id"):
                        result = await self.db.execute(select(Creator).where(Creator.username == candidate["creator_external_id"]))
                        candidate_creator = result.scalar_one_or_none()
                        
                    if not candidate_creator:
                        candidate_creator = Creator(
                            username=candidate.get("creator_external_id") or f"unknown_{uuid.uuid4().hex[:8]}",
                            display_name=candidate.get("creator_name", "Unknown"),
                            platform=candidate["platform"]
                        )
                        self.db.add(candidate_creator)
                        await self.db.flush()
                        
                    # Save candidate
                    db_candidate = ContentItem(
                        creator_id=candidate_creator.id,
                        platform=candidate["platform"],
                        external_id=candidate["external_id"],
                        canonical_url=candidate["canonical_url"],
                        title=candidate["title"],
                        caption=candidate["caption"],
                        thumbnail_url=candidate["thumbnail_url"],
                        duration_seconds=candidate["duration_seconds"],
                        view_count=candidate["view_count"]
                    )
                    self.db.add(db_candidate)
                    await self.db.flush()
                    
                    # 4. Score match
                    source_dict = {
                        "id": source_item.id,
                        "title": source_item.title,
                        "caption": source_item.caption,
                        "duration_seconds": source_item.duration_seconds
                    }
                    candidate_dict = {
                        "id": db_candidate.id,
                        "title": db_candidate.title,
                        "caption": db_candidate.caption,
                        "duration_seconds": db_candidate.duration_seconds
                    }
                    score_res = self.scorer.score_match(source_dict, candidate_dict)
                    match_scores.append(score_res["overall_score"])
                    
                    db_match = ContentMatch(
                        scan_id=scan.id,
                        source_content_id=source_item.id,
                        candidate_content_id=db_candidate.id,
                        overall_score=score_res["overall_score"],
                        visual_score=score_res["visual_score"],
                        audio_score=score_res["audio_score"],
                        transcript_score=score_res["transcript_score"],
                        caption_score=score_res["caption_score"],
                        duration_score=score_res["duration_score"],
                        confidence=score_res["confidence"]
                    )
                    self.db.add(db_match)
                
                # 5. Gap Score
                gap_res = self.scorer.calculate_gap_score({"view_count": source_item.view_count}, match_scores)
                
                for target_platform in scan.target_platforms:
                    db_gap = ContentGap(
                        scan_id=scan.id,
                        source_content_id=source_item.id,
                        target_platform=target_platform,
                        gap_score=gap_res["gap_score"],
                        potential=gap_res["potential"]
                    )
                    self.db.add(db_gap)
                
                # Update progress
                scan.progress = 30.0 + (60.0 * (idx + 1) / total_items)
                await self.db.commit()
                
            # 6. Finalize
            scan.status = "completed"
            scan.progress = 100.0
            scan.completed_at = datetime.now(timezone.utc)
            await self.db.commit()
            
        except Exception as e:
            scan.status = "failed"
            scan.error_message = str(e)
            await self.db.commit()
