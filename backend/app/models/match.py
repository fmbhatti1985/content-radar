from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class ContentMatch(Base):
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scan.id"), index=True, nullable=True)
    
    source_content_id = Column(String, ForeignKey("contentitem.id"), index=True, nullable=False)
    candidate_content_id = Column(String, ForeignKey("contentitem.id"), index=True, nullable=False)
    
    overall_score = Column(Float, nullable=False)
    visual_score = Column(Float, nullable=True)
    audio_score = Column(Float, nullable=True)
    transcript_score = Column(Float, nullable=True)
    caption_score = Column(Float, nullable=True)
    duration_score = Column(Float, nullable=True)
    
    confidence = Column(String, nullable=False) # very_high, high, possible, low
    algorithm_version = Column(String, default="1.0")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ContentGap(Base):
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scan.id"), index=True, nullable=True)
    
    source_content_id = Column(String, ForeignKey("contentitem.id"), index=True, nullable=False)
    target_platform = Column(String, index=True, nullable=False)
    
    gap_score = Column(Float, nullable=False)
    potential = Column(String, nullable=False) # high, medium, low
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
