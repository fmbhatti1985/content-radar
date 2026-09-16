from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class Scan(Base):
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=True) # Optional for MVP
    creator_id = Column(String, ForeignKey("creator.id"), index=True, nullable=False)
    
    source_platform = Column(String, nullable=False)
    target_platforms = Column(JSON, nullable=False) # list of strings
    content_limit = Column(Integer, default=20)
    
    status = Column(String, default="pending") # pending, running, partial, completed, failed
    progress = Column(Float, default=0.0)
    error_message = Column(String, nullable=True)
    settings_json = Column(JSON, nullable=True)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
