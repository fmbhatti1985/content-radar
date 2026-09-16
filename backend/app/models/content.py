from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class ContentItem(Base):
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(String, ForeignKey("creator.id"), index=True, nullable=False)
    platform = Column(String, index=True, nullable=False)
    external_id = Column(String, index=True, nullable=False)
    canonical_url = Column(String, nullable=False)
    
    title = Column(String, nullable=True)
    caption = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    
    view_count = Column(Integer, nullable=True)
    like_count = Column(Integer, nullable=True)
    comment_count = Column(Integer, nullable=True)
    share_count = Column(Integer, nullable=True)
    
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
